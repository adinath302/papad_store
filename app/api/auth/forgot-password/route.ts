import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const { allowed } = checkRateLimit(`forgot-pw:${ip}`, 3, 60_000);
    if (!allowed) {
      return Response.json(
        { error: "Too many requests. Try again later." },
        { status: 429 },
      );
    }

    const { email } = await req.json();
    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json({ message: "If that email exists, a reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordresettoken.upsert({
      where: { userId: user.id },
      update: { token, expiresAt, used: false },
      create: { userId: user.id, token, expiresAt },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3002";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"Shivshambho" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: "Reset your password — Shivshambho",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
            <div style="background:#065f46;color:white;padding:24px;text-align:center;border-radius:12px 12px 0 0">
              <h1 style="margin:0;font-size:18px">Password Reset</h1>
            </div>
            <div style="padding:24px;border:1px solid #eee;border-top:0;border-radius:0 0 12px 12px">
              <p>Click the button below to reset your password. This link expires in 1 hour.</p>
              <a href="${resetUrl}"
                 style="display:inline-block;background:#065f46;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
                Reset Password
              </a>
              <p style="color:#999;font-size:12px">If you didn't request this, ignore this email.</p>
            </div>
          </div>
        `,
      });
    }

    return Response.json({ message: "If that email exists, a reset link has been sent." });
  } catch (error: any) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
