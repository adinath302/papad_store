import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const DEFAULT_IMAGES: Record<string, string> = {
  logo: "/logo.png",
  hero_slide_1: "/use_everywhere.jpg",
  hero_slide_2: "/use_everywhere.jpg",
  hero_slide_3: "/use_everywhere.jpg",
  category_moong: "/use_everywhere.jpg",
  category_masala: "/use_everywhere.jpg",
  category_garlic: "/use_everywhere.jpg",
  category_urad: "/use_everywhere.jpg",
  category_pickles: "/use_everywhere.jpg",
  category_spices: "/use_everywhere.jpg",
  category_combos: "/use_everywhere.jpg",
  category_snacks: "/use_everywhere.jpg",
  combo_family: "/use_everywhere.jpg",
  combo_starter: "/use_everywhere.jpg",
  combo_festive: "/use_everywhere.jpg",
  combo_spice: "/use_everywhere.jpg",
  explorer_moong: "/use_everywhere.jpg",
  explorer_masala: "/use_everywhere.jpg",
  explorer_garlic: "/use_everywhere.jpg",
  explorer_urad: "/use_everywhere.jpg",
  heritage: "/use_everywhere.jpg",
  login_bg: "/use_everywhere.jpg",
  signup_bg: "/use_everywhere.jpg",
  product_fallback: "/use_everywhere.jpg",
};

export async function GET() {
  try {
    const rows = await prisma.siteimage.findMany();
    const map: Record<string, string> = { ...DEFAULT_IMAGES };
    for (const row of rows) {
      map[row.key] = row.url;
    }
    return NextResponse.json(map, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (error: any) {
    console.error("Site images GET error:", error);
    return NextResponse.json(DEFAULT_IMAGES);
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { images } = body as { images: Record<string, string> };

    if (!images || typeof images !== "object") {
      return NextResponse.json({ error: "Invalid images data" }, { status: 400 });
    }

    const upserts = Object.entries(images).map(([key, url]) =>
      prisma.siteimage.upsert({
        where: { key },
        update: { url },
        create: { key, url },
      })
    );

    await Promise.all(upserts);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Site images POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
