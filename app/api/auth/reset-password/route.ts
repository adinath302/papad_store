import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const { allowed } = await checkRateLimit(`reset-pw:${ip}`, 5, 60_000);
    if (!allowed) {
      return Response.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 },
      );
    }

    const { token, password } = await req.json();
    if (!token || !password) {
      return Response.json(
        { error: "Token and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const resetToken = await prisma.passwordresettoken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return Response.json(
        { error: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    if (resetToken.used) {
      return Response.json(
        { error: "Token has already been used" },
        { status: 400 },
      );
    }

    if (new Date() > resetToken.expiresAt) {
      return Response.json(
        { error: "Token has expired" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordresettoken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    return Response.json({ message: "Password reset successfully. You can now sign in." });
  } catch (error: any) {
    console.error("RESET PASSWORD ERROR:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
