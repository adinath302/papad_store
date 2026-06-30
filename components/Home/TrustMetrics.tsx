import { Package, Users, Clock, Sparkles } from "lucide-react";

interface TrustMetricsProps {
  ordersDelivered: number;
  happyCustomers: number;
  productsMade: number;
}

export default function TrustMetrics({
  ordersDelivered,
  happyCustomers,
  productsMade,
}: TrustMetricsProps) {
  const stats = [
    {
      icon: Package,
      value: ordersDelivered.toLocaleString(),
      suffix: "+",
      label: "Orders Delivered",
    },
    {
      icon: Users,
      value: happyCustomers.toLocaleString(),
      suffix: "+",
      label: "Happy Customers",
    },
    {
      icon: Clock,
      value: "41",
      suffix: "Years",
      label: "Since 1984",
    },
    {
      icon: Sparkles,
      value: productsMade.toLocaleString(),
      suffix: "+",
      label: "Products Made",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map(({ icon: Icon, value, suffix, label }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-stone-200/80 p-6 md:p-8 text-center shadow-sm"
            >
              <Icon
                size={24}
                className="text-emerald-700 mx-auto mb-3"
                strokeWidth={1.5}
              />
              <p className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-1">
                {value}
                {suffix}
              </p>
              <p className="text-xs md:text-sm text-stone-500 uppercase tracking-wider font-semibold">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
