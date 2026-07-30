import { prisma } from "@/lib/prisma";
import dynamic from "next/dynamic";
import HeroCarousel from "@/components/Home/HeroCarousel";
import PromoBar from "@/components/Home/PromoBar";
import TrustMarquee from "@/components/Home/TrustMarquee";
import CategoryGrid from "@/components/Home/CategoryGrid";
import CombosSection from "@/components/Home/CombosSection";
import TrustMetrics from "@/components/Home/TrustMetrics";
import BestsellerReviews from "@/components/Home/BestsellerReviews";
import ProductCard from "@/components/Products/ProductCard";
import Link from "next/link";

const HeritageSection = dynamic(
  () => import("@/components/Home/HeritageSection"),
  { loading: () => <div className="h-[600px] bg-white" /> },
);

const ReviewsSection = dynamic(
  () => import("@/components/Home/ReviewsSection"),
  { loading: () => <div className="h-[400px] bg-white" /> },
);

const FAQSection = dynamic(() => import("@/components/Home/FAQSection"), {
  loading: () => <div className="h-[500px] bg-[#faf8f5]" />,
});

export default async function Home() {
  let products: any[] = [];
  let ordersDelivered = 0;
  let happyCustomers = 0;
  let productsMade = 0;

  try {
    products = await prisma.product.findMany({ include: { productvariant: true } });
  } catch {
    // Database unavailable during build
  }

  try {
    const deliveredOrders = await prisma.order.findMany({
      where: { status: "DELIVERED" },
      select: { id: true, userId: true },
    });
    ordersDelivered = deliveredOrders.length;

    const uniqueUserIds = new Set(deliveredOrders.map((o: { id: string; userId: string | null }) => o.userId).filter(Boolean));
    happyCustomers = uniqueUserIds.size;

    const deliveredOrderIds = deliveredOrders.map((o: { id: string; userId: string | null }) => o.id);
    if (deliveredOrderIds.length > 0) {
      const items = await prisma.orderitem.findMany({
        where: { orderId: { in: deliveredOrderIds } },
        select: { quantity: true },
      });
      productsMade = items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
    }
  } catch {
    // Database unavailable during build
  }

  return (
    <main className="relative w-full bg-[#faf8f5] overflow-x-hidden">
      {/* Promo announcement strip */}
      <div className="pt-[72px] md:pt-[80px]">
        <PromoBar />
      </div>

      {/* Hero (fullscreen) */}
      <section className="w-full">
        <HeroCarousel />
      </section>

      {/* Scrolling trust badges */}
      <TrustMarquee customerCount={happyCustomers > 0 ? happyCustomers : undefined} />

      {/* Category shortcuts */}
      <CategoryGrid />

      {/* Heritage & story */}
      <HeritageSection />

      {/* Bestsellers from DB */}
      <section className="relative z-10 bg-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-4">
            <div>
              <p className="text-emerald-800 text-[10px] font-bold tracking-[0.35em] uppercase mb-2">
                Customer Favorites
              </p>
              <h2 className="text-3xl md:text-4xl font-serif text-stone-900 tracking-tight">
                Bestsellers
              </h2>
              <p className="text-stone-500 mt-2 text-sm md:text-base">
                Directly from our traditional sun-drying floors.
              </p>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800 hover:text-amber-600 transition-colors shrink-0"
            >
              View All Products →
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#faf8f5] rounded-3xl border border-dashed border-stone-300">
              <p className="text-stone-500 italic">
                No products currently available.
              </p>
            </div>
          )}

          <BestsellerReviews productIds={products.map((p) => p.id)} />
        </div>
      </section>

      {/* Trust Metrics */}
      <TrustMetrics
        ordersDelivered={ordersDelivered}
        happyCustomers={happyCustomers}
        productsMade={productsMade}
      />

      {/* Combos */}
      <CombosSection />

      {/* Reviews */}
      <ReviewsSection />

      {/* FAQ */}
      <FAQSection />
    </main>
  );
}
