import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  razorpay,
  getRazorpayKeyId,
  isRazorpayConfigured,
} from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { calculateShippingFee } from "@/lib/shipping";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      {
        error:
          "Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env",
      },
      { status: 501 },
    );
  }

  try {
    const body = await req.json();
    const { state, guestItems, shippingCost: clientShippingCost, couponCode } = body;

    let subtotal = 0;

    if (!userId) {
      if (!guestItems || !Array.isArray(guestItems) || guestItems.length === 0) {
        return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
      }

      for (const gi of guestItems) {
        const product = await prisma.product.findUnique({
          where: { id: gi.productId },
          include: { productvariant: true },
        });
        if (!product) {
          return NextResponse.json(
            { error: `Product not found: ${gi.productId}` },
            { status: 400 },
          );
        }
        let price = 0;
        if (gi.variantId) {
          const variant = product.productvariant.find(
            (v) => v.id === gi.variantId,
          );
          if (!variant) {
            return NextResponse.json(
              { error: `Variant not found for ${product.name}` },
              { status: 400 },
            );
          }
          price = variant.price;
        } else {
          price = product.productvariant.length > 0
            ? product.productvariant[0].price
            : 0;
        }
        subtotal += price * gi.quantity;
      }
    } else {
      const cartItems = await prisma.cartitem.findMany({
        where: { userId },
        include: {
          product: {
            include: { productvariant: true },
          },
        },
      });

      if (cartItems.length === 0) {
        return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
      }

      for (const item of cartItems) {
        let price = 0;
        if (item.variantId) {
          const variant = item.product.productvariant.find(
            (v) => v.id === item.variantId,
          );
          if (variant) price = variant.price;
        } else {
          price =
            item.product.productvariant.length > 0
              ? item.product.productvariant[0].price
              : 0;
        }
        subtotal += price * item.quantity;
      }
    }

    const shippingCost = clientShippingCost ?? calculateShippingFee(subtotal, state);
    let totalAmount = subtotal + shippingCost;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon && coupon.isActive && (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date())) {
        if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
          if (!coupon.minCartValue || subtotal >= coupon.minCartValue) {
            let discount = 0;
            if (coupon.type === "PERCENTAGE") {
              discount = Math.round((subtotal * coupon.value) / 100);
              if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
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

    const receipt = `rcpt_${Date.now()}`;

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt,
      notes: {
        userId: userId || "guest",
      },
    });

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: getRazorpayKeyId(),
      shippingCost,
    });
  } catch (error: any) {
    console.error("RAZORPAY INIT ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to initiate payment" },
      { status: 500 },
    );
  }
}
