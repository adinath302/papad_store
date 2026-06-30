import { validateCsrfToken } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { isRazorpayConfigured } from "@/lib/razorpay";
import crypto from "crypto";
import { sendAdminOrderNotification, sendCustomerOrderConfirmation } from "@/lib/email";
import { calculateShippingFee } from "@/lib/shipping";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  try {
    const csrfToken = req.headers.get("x-csrf-token");
    if (!(await validateCsrfToken(csrfToken))) {
      return Response.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const body = await req.json();
    const {
      fullName,
      phone,
      address1,
      address2,
      city,
      state,
      pincode,
      paymentType,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      items: clientItems,
      shippingMethod,
      shippingCost: clientShippingCost,
      couponCode,
    } = body;

    if (
      !fullName ||
      !phone ||
      !address1 ||
      !city ||
      !state ||
      !pincode
    ) {
      return Response.json(
        { error: "Missing required shipping fields" },
        { status: 400 },
      );
    }

    // Verify Razorpay signature if payment was made
    if (paymentType === "Razorpay") {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return Response.json(
          { error: "Missing payment verification details" },
          { status: 400 },
        );
      }

      if (isRazorpayConfigured()) {
        const secret = process.env.RAZORPAY_KEY_SECRET || "";
        const generatedSignature = crypto
          .createHmac("sha256", secret)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest("hex");

        if (generatedSignature !== razorpaySignature) {
          return Response.json(
            { error: "Payment verification failed" },
            { status: 400 },
          );
        }
      }
    }

    if (!clientItems || !Array.isArray(clientItems) || clientItems.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Validate pincode and phone format
    if (!/^\d{6}$/.test(pincode)) {
      return Response.json({ error: "Invalid pincode format" }, { status: 400 });
    }
    if (!/^(\+91|0)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ""))) {
      return Response.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    const cartItems: any[] = [];
    for (const ci of clientItems) {
      const product = await prisma.product.findUnique({
        where: { id: ci.productId },
        include: { productvariant: true },
      });
      if (!product) {
        return Response.json(
          { error: "Product not found" },
          { status: 400 },
        );
      }
      if (ci.variantId) {
        const variant = product.productvariant.find(
          (v) => v.id === ci.variantId,
        );
        if (!variant) {
          return Response.json(
            { error: "Variant not found" },
            { status: 400 },
          );
        }
      }
      cartItems.push({
        productId: ci.productId,
        variantId: ci.variantId || null,
        quantity: ci.quantity,
        product,
      });
    }

    const subtotal = cartItems.reduce((sum, item: any) => {
      let price = 0;
      if (item.variantId) {
        const variant = item.product.productvariant.find(
          (v: any) => v.id === item.variantId,
        );
        if (variant) price = variant.price;
      } else if (item.product.productvariant.length > 0) {
        price = item.product.productvariant[0].price;
      }
      return sum + price * item.quantity;
    }, 0);

    const shippingCost = clientShippingCost ?? calculateShippingFee(subtotal, state);
    let totalAmount = subtotal + shippingCost;
    let discount = 0;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon && coupon.isActive && (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date())) {
        if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
          if (!coupon.minCartValue || subtotal >= coupon.minCartValue) {
            if (coupon.type === "PERCENTAGE") {
              discount = Math.round((subtotal * coupon.value) / 100);
              if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
              }
            } else if (coupon.type === "FIXED") {
              discount = coupon.value;
            } else if (coupon.type === "FREE_SHIPPING") {
              discount = shippingCost;
            }
            totalAmount = Math.max(0, subtotal + shippingCost - discount);
          }
        }
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      // Check stock inside transaction to prevent race conditions
      for (const item of cartItems) {
        if (item.product.stock != null) {
          const current = await tx.product.findUnique({
            where: { id: item.productId },
            select: { stock: true, name: true },
          });
          if (!current || current.stock == null) continue;
          if (current.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${current.name}`);
          }
        }
      }

      const created = await tx.order.create({
        data: {
          userId: userId || null,
          paymentType: paymentType || "COD",
          shippingCost,
          shippingMethod: shippingMethod || null,
          totalAmount,
          status: paymentType === "Razorpay" ? "CONFIRMED" : "PENDING",
          fullName,
          phone,
          address1,
          address2: address2 || null,
          city,
          state,
          pincode,
          razorpayOrderId: razorpayOrderId || null,
          razorpayPaymentId: razorpayPaymentId || null,
        },
      });

      await tx.orderitem.createMany({
        data: cartItems.map((item: any) => ({
          orderId: created.id,
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      // Decrement stock inside transaction
      for (const item of cartItems) {
        if (item.product.stock != null) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      if (couponCode && discount > 0) {
        await tx.coupon.updateMany({
          where: { code: couponCode.toUpperCase() },
          data: { usedCount: { increment: 1 } },
        });
      }

      if (userId) {
        await tx.cartitem.deleteMany({ where: { userId } });
      }

      return created;
    });

    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderitem: { include: { product: { include: { productvariant: true } } } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!updatedOrder) {
      return Response.json(order);
    }

    const emailData = {
      orderId: updatedOrder.id,
      fullName: updatedOrder.fullName,
      phone: updatedOrder.phone,
      address: updatedOrder.address1 + (updatedOrder.address2 ? `, ${updatedOrder.address2}` : ""),
      city: updatedOrder.city,
      state: updatedOrder.state,
      pincode: updatedOrder.pincode,
      subtotal: subtotal,
      shippingCost: updatedOrder.shippingCost,
      totalAmount: updatedOrder.totalAmount,
      paymentType: updatedOrder.paymentType,
      status: updatedOrder.status,
      items: updatedOrder.orderitem.map((oi) => ({
        name: oi.product.name,
        quantity: oi.quantity,
      })),
    };

    sendAdminOrderNotification(emailData).catch((e) =>
      console.error("Admin email error:", e),
    );

    if (updatedOrder?.user?.email) {
      sendCustomerOrderConfirmation(updatedOrder.user.email, emailData).catch(
        (e) => console.error("Customer email error:", e),
      );
    }

    return Response.json(updatedOrder);
  } catch (error: any) {
    console.error("CHECKOUT ERROR:", error);
    return Response.json(
      { error: error?.message?.includes("Insufficient stock") ? error.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
