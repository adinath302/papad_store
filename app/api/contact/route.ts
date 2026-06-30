import { NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/rate-limit";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const csrfToken = req.headers.get("x-csrf-token");
    if (!(await validateCsrfToken(csrfToken))) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const { name, email, subject, message } = await req.json();

    if (email) {
      const { allowed } = await checkRateLimit(`contact:${email}`, 5, 60_000);
      if (!allowed) {
        return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
      }
    }

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (adminEmails.length === 0) {
      return NextResponse.json(
        { error: "No admin email configured" },
        { status: 500 },
      );
    }

    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      return NextResponse.json(
        { message: "Thank you for reaching out! We'll get back to you soon." },
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${name}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      replyTo: email,
      to: adminEmails.join(", "),
      subject: `📬 Contact Form: ${subject || "New Inquiry"} from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#065f46;padding:24px;border-radius:12px 12px 0 0;">
            <h1 style="color:#fff;margin:0;font-size:18px;">📬 New Contact Inquiry</h1>
          </div>
          <div style="background:#fff;border:1px solid #e5e5e5;border-top:0;padding:24px;border-radius:0 0 12px 12px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;color:#888;font-size:13px;width:80px;">Name</td>
                <td style="padding:8px 0;font-weight:600;font-size:13px;">${name}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#888;font-size:13px;">Email</td>
                <td style="padding:8px 0;font-weight:600;font-size:13px;">
                  <a href="mailto:${email}" style="color:#065f46;">${email}</a>
                </td>
              </tr>
              ${subject ? `<tr><td style="padding:8px 0;color:#888;font-size:13px;">Subject</td><td style="padding:8px 0;font-weight:600;font-size:13px;">${subject}</td></tr>` : ""}
            </table>
            <div style="margin-top:16px;padding:16px;background:#faf8f5;border-radius:8px;font-size:13px;line-height:1.6;color:#333;white-space:pre-wrap;">
              ${message}
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      message: "Thank you for reaching out! We'll get back to you soon.",
    });
  } catch (error: any) {
    console.error("CONTACT FORM ERROR:", error);
    return NextResponse.json(
      { message: "We received your message but could not send an email notification. Our team will review it shortly." },
    );
  }
}
