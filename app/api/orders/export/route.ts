import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { can, isOwner } from "@/lib/permissions";
import { cookies } from "next/headers";
import { calculateSpeedPostRate, estimateZone } from "@/lib/indiapost";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true, permissions: true },
    });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!isOwner(user.email) && !can(user.permissions, "orders", "view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderitem: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const csvRows = [["Order ID", "Date", "Customer", "Phone", "Address", "City", "State", "Pincode", "Payment", "Status", "Items", "Subtotal", "Shipping Charged", "Actual Shipping", "Total", "Courier", "Tracking ID"]];

    for (const order of orders) {
      const totalWeight = order.orderitem.reduce((sum, item) => sum + (item.product.weight || 200) * item.quantity, 0);
      const zone = estimateZone(order.state);
      const actualRate = calculateSpeedPostRate(totalWeight || 500, zone);
      const subtotal = order.totalAmount - order.shippingCost;
      const items = order.orderitem.map((oi) => `${oi.product.name} x${oi.quantity}`).join("; ");

      csvRows.push([
        order.id,
        new Date(order.createdAt).toISOString().split("T")[0],
        `"${order.fullName}"`,
        order.phone,
        `"${order.address1}${order.address2 ? ", " + order.address2 : ""}"`,
        order.city,
        order.state,
        order.pincode,
        order.paymentType,
        order.status,
        `"${items}"`,
        String(subtotal),
        String(order.shippingCost),
        String(actualRate),
        String(order.totalAmount),
        order.courierName || "",
        order.trackingId || "",
      ]);
    }

    const csv = csvRows.map((row) => row.join(",")).join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("EXPORT ERROR:", error);
    return NextResponse.json({ error: "Failed to export orders" }, { status: 500 });
  }
}
