import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.password !== password) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("userId", user.id);

    return Response.json({ message: "Login successful" });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
