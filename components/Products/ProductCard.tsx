import Image from "next/image";
import { Star } from "lucide-react";

export default function ProductCard({ product }: any) {
  return (
    <div className="group space-y-4">
      {/* Image Container */}
      <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Badge Example */}
        {product.isNew && (
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-amber-700 shadow-sm">
            Aazol's Choice
          </span>
        )}
      </div>
      
      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-zinc-900 leading-tight">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400 font-medium">(200g / 500g)</span>
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={12} fill="currentColor" />
            <span className="text-xs font-bold text-zinc-900">4.8</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xl font-bold text-zinc-900">
            <span className="text-xs font-medium text-zinc-400 mr-1">From</span>
            ₹{product.price}
          </p>
          <button className="bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-tighter px-4 py-2 rounded-full hover:bg-amber-600 transition-colors">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}