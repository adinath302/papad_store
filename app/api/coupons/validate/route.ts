import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, cartTotal } = await req.json();

    if (!code || !cartTotal) {
      return NextResponse.json({ error: "Code and cart total required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
    }

    if (coupon.minCartValue && cartTotal < coupon.minCartValue) {
      return NextResponse.json({
        error: `Minimum cart value of ₹${coupon.minCartValue} required`,
      }, { status: 400 });
    }

    let discount = 0;

    if (coupon.type === "PERCENTAGE") {
      discount = Math.round((cartTotal * coupon.value) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.type === "FIXED") {
      discount = coupon.value;
    } else if (coupon.type === "FREE_SHIPPING") {
      discount = -1;
    }

    return NextResponse.json({
      valid: true,
      discount,
      type: coupon.type,
      code: coupon.code,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
