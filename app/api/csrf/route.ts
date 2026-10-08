import { NextResponse } from "next/server";
import { applyCsrfCookie } from "@/lib/csrf";

export async function GET() {
  const res = NextResponse.json({ token: "" });
  const token = applyCsrfCookie(res);
  return NextResponse.json({ token }, { headers: res.headers });
}
