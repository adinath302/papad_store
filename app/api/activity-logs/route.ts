import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });
  return user;
}

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const resource = searchParams.get("resource") || "";

    const where: Record<string, unknown> = {};
    if (resource) where.resource = resource;

    const [logs, totalCount] = await Promise.all([
      prisma.activitylog.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activitylog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch activity logs" },
      { status: 500 },
    );
  }
}
