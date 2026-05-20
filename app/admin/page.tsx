"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  ChevronDown,
} from "lucide-react";

const Home = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    stock: "",
    productType: "weight",
    image: "",
    thumbnail: "",
    variants: [
      {
        label: "200g",
        price: "",
      },
    ],
  });

  // Handles standard single-level inputs (name, description, stock)
  const HandleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const HandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const uploadedImage = form.image;
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        stock: Number(form.stock),
        productType: form.productType,

        image: uploadedImage || form.image,

        thumbnail: uploadedImage || form.image,

        variants: form.variants.map((v) => ({
          label: v.label.trim(),
          price: Number(v.price),
        })),
      }),
    });

    if (res.ok) {
      alert("Product successfully published!");
      setForm({
        name: "",
        description: "",
        stock: "",
        productType: "weight",
        image: "",
        thumbnail: "",
        variants: [
          {
            label: "200g",
            price: "",
          },
        ],
      });
    } else {
      const error = await res.json();
      alert(`Error ${res.status}: ${error.details || error.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 border-b border-zinc-100 pb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-600 mb-2">
            <Sparkles size={14} /> Internal Inventory Studio
          </div>
          <h1 className="text-4xl font-serif text-zinc-900">
            Add Production Product
          </h1>
          <p className="text-zinc-500 font-light mt-1 text-sm">
            Catalogue creation portal for premium distribution.
          </p>
        </div>

        {/* Main Production Form */}
        <form onSubmit={HandleSubmit} className="space-y-12">
          {/* Section 1: Core Details */}
          <div className="space-y-8">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
              01. Essential Nomenclature
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              {/* Product Name */}
              <div className="md:col-span-2 group">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                  Product Title
                </label>
                <input
                  required
                  name="name"
                  value={form.name}
                  placeholder="e.g., Hand-Rolled Sai Moong Papad"
                  onChange={HandleChange}
                  className="w-full border-b border-zinc-200 py-3 outline-none focus:border-amber-600 bg-transparent transition-all text-zinc-900 placeholder:text-zinc-300"
                />
              </div>

              {/* Base Price Input (FIXED: Updates variant state directly) */}
              <div className="group">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                  Base Price (₹)
                </label>
                <input
                  required
                  type="number"
                  placeholder="Price"
                  value={form.variants[0].price}
                  onChange={(e) => {
                    const updatedVariants = [...form.variants];
                    updatedVariants[0].price = e.target.value;
                    setForm({ ...form, variants: updatedVariants });
                  }}
                  className="w-full border-b border-zinc-200 py-3 outline-none focus:border-amber-600 bg-transparent transition-all text-zinc-900 placeholder:text-zinc-300"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2 group">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                  Epicurean Narrative (Optional)
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  placeholder="Describe recipe heritage, notes, and spice thresholds..."
                  rows={2}
                  onChange={HandleChange}
                  className="w-full border-b border-zinc-200 py-3 outline-none focus:border-amber-600 bg-transparent transition-all text-zinc-900 placeholder:text-zinc-300 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Asset Upload */}
          <div className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
              02. Visual Mediums
            </h2>

            <div className="border border-dashed border-zinc-200 bg-zinc-50/50 rounded-2xl p-8 text-center relative group transition-colors hover:bg-zinc-50">
              <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                <ImageIcon
                  className="text-zinc-400 group-hover:text-amber-600 transition-colors"
                  size={24}
                />
                <span className="text-xs font-semibold text-zinc-700">
                  Upload high-res production image
                </span>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                  JPEG, PNG up to 5MB
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setForm({
                      ...form,
                      image: reader.result as string,
                      thumbnail: reader.result as string,
                    });
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </div>

            {/* Direct Image URL input */}
            <div className="group">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                Asset CDN Link (Cloudinary URL)
              </label>
              <input
                name="image"
                placeholder="https://res.cloudinary.com/..."
                value={form.image}
                onChange={HandleChange}
                className="w-full border-b border-zinc-200 py-3 outline-none focus:border-amber-600 bg-transparent transition-all text-sm text-zinc-800 placeholder:text-zinc-300"
              />
            </div>
          </div>

          {/* Section 3: Stock Metrics */}
          <div className="space-y-8">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
              03. Operational Logistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              {/* Total Stock */}
              <div className="group">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                  Available Units
                </label>
                <input
                  name="stock"
                  type="number"
                  value={form.stock}
                  placeholder="0"
                  onChange={HandleChange}
                  className="w-full border-b border-zinc-200 py-3 outline-none focus:border-amber-600 bg-transparent transition-all text-zinc-900 placeholder:text-zinc-300"
                />
              </div>

              {/* Product Metric Type */}
              <div className="group relative">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                  Classification Unit
                </label>
                <select
                  name="productType"
                  value={form.productType}
                  onChange={(e) =>
                    setForm({ ...form, productType: e.target.value })
                  }
                  className="w-full border-b border-zinc-200 py-3 outline-none focus:border-amber-600 bg-transparent transition-all text-zinc-900 appearance-none cursor-pointer text-sm"
                >
                  <option value="weight">By Net Weight (Grams/Kilos)</option>
                  <option value="pieces">
                    By Unit Quantities (Pieces/Packs)
                  </option>
                </select>
                <ChevronDown
                  className="absolute right-0 bottom-3 text-zinc-400 pointer-events-none"
                  size={16}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Architecture Variants */}
          <div className="space-y-6 pt-4">
            <div className="flex justify-between items-end border-b border-zinc-100 pb-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
                04. Commercial Variants
              </h2>
              <button
                type="button"
                onClick={() => {
                  setForm({
                    ...form,
                    variants: [...form.variants, { label: "", price: "" }],
                  });
                }}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700 transition-colors"
              >
                <Plus size={12} /> Add Dimension
              </button>
            </div>

            <div className="space-y-4">
              {form.variants.map((v, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-6 items-end bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100 relative group animate-fade-in"
                >
                  {/* Label / Size Input */}
                  <div className="flex-1 w-full">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
                      Dimension / Size Tag
                    </label>
                    <input
                      placeholder="e.g., 200g or 50 pieces"
                      value={v.label}
                      onChange={(e) => {
                        const updated = [...form.variants];
                        updated[index].label = e.target.value;
                        setForm({ ...form, variants: updated });
                      }}
                      className="w-full border-b border-zinc-200 py-2 outline-none focus:border-amber-600 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-300"
                    />
                  </div>

                  {/* Pricing Matrix Input */}
                  <div className="w-full sm:w-48">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
                      Base Price (INR)
                    </label>
                    <input
                      type="number"
                      placeholder="₹ Base"
                      value={v.price}
                      onChange={(e) => {
                        const updated = [...form.variants];
                        updated[index].price = e.target.value;
                        setForm({ ...form, variants: updated });
                      }}
                      className="w-full border-b border-zinc-200 py-2 outline-none focus:border-amber-600 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-300"
                    />
                  </div>

                  {/* Remove Variant Utility Button */}
                  {form.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = form.variants.filter(
                          (_, i) => i !== index,
                        );
                        setForm({ ...form, variants: updated });
                      }}
                      className="p-2 text-zinc-300 hover:text-red-500 transition-colors mb-0.5"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submission Panel */}
          <div className="pt-8 border-t border-zinc-100 flex justify-between items-center">
            <Link
              href="/products"
              className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              Discard Changes
            </Link>
            <button
              type="submit"
              className="bg-zinc-900 text-white px-12 py-5 rounded-full font-bold text-sm tracking-wide hover:bg-zinc-800 shadow-xl shadow-zinc-100 transition-all active:scale-95"
            >
              Publish Production Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Home;
