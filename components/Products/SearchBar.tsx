"use client";
import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({
  initialSearch = "",
}: {
  initialSearch?: string;
}) {
  const [query, setQuery] = useState(initialSearch);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/products");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative group w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search
          size={18}
          className="text-zinc-400 group-focus-within:text-amber-600 transition-colors"
        />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="block w-full pl-10 pr-4 py-3 bg-zinc-50 border-b border-zinc-200 text-zinc-900 text-sm rounded-t-xl outline-none focus:border-amber-600 focus:bg-white transition-all duration-300"
        placeholder="Search for papads, kurdai, or snacks..."
      />
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-amber-600 transition-all duration-500 group-focus-within:w-full" />
    </form>
  );
}
