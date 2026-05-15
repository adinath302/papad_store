import { Trash2 } from "lucide-react";

export default function CartItem({ item }: { item: any }) {
  return (
    <div className="flex gap-4 items-center">
      <div className="w-20 h-24 bg-zinc-100 rounded-xl overflow-hidden shrink-0">
        <img 
          src={item.product?.image || "/papad-placeholder.jpg"} 
          className="w-full h-full object-cover"
          alt={item.product?.name}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-zinc-900 font-medium truncate">{item.product?.name}</h4>
        <p className="text-xs text-zinc-400 mb-2">Qty: {item.quantity}</p>
        <p className="text-sm font-bold text-zinc-900">₹{item.product?.price * item.quantity}</p>
      </div>
      <button className="p-2 text-zinc-300 hover:text-red-500 transition-colors">
        <Trash2 size={16} />
      </button>
    </div>
  );
}