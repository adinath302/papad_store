export default function FilterSidebar() {
  return (
    <div className="space-y-10 sticky top-28">
      {/* Availability */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-zinc-900">Availability</h3>
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-zinc-600 group-hover:text-zinc-900 transition-colors">In stock only</span>
          <input type="checkbox" className="w-4 h-4 accent-amber-600" />
        </label>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-zinc-900">Category</h3>
        <div className="space-y-3">
          {["Classic Moong", "Spicy Masala", "Healthy Kurdai", "Traditional Udad"].map((cat) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded accent-amber-600 border-zinc-300" />
              <span className="text-zinc-600 group-hover:text-zinc-900 transition-colors">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-zinc-900">Price Range</h3>
        <input type="range" className="w-full accent-amber-600 mt-2" min="0" max="1000" />
        <div className="flex justify-between mt-2 text-xs font-medium text-zinc-500">
          <span>₹0</span>
          <span>₹1000+</span>
        </div>
      </div>
    </div>
  );
}