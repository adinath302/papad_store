import Image from "next/image";

export default function ProductCard({ product }: any) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-zinc-100 mb-6 transition-all group-hover:shadow-2xl">
        <Image
          src={product.image || "https://images.unsplash.com/photo-1599481238640-4c1288750d7a?q=80&w=800"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
          <p className="text-zinc-900 font-bold text-sm">₹{product.price}</p>
        </div>
      </div>
      
      <div className="space-y-1 px-2">
        <h3 className="text-xl font-serif text-zinc-900 group-hover:text-amber-700 transition-colors">
          {product.name}
        </h3>
        <p className="text-zinc-500 text-sm line-clamp-1">{product.description}</p>
        <button className="mt-4 text-xs font-black tracking-widest uppercase text-amber-600 border-b-2 border-amber-600/20 pb-1 group-hover:border-amber-600 transition-all">
          View Details
        </button>
      </div>
    </div>
  );
}