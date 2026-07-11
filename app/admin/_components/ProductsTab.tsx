"use client";

import { useState, useRef } from "react";
import {
  Package, Plus, Trash2, Image as ImageIcon,
  FileText, Hash, Link2, IndianRupee, Pencil, Upload,
  GripVertical, X,
} from "lucide-react";
import Image from "next/image";
import type { Product, ProductImage } from "./types";
import { fetchCsrf } from "@/lib/csrf-client";

type FormState = {
  name: string;
  nameMarathi: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
    stock: string;
    weight: string;
    image: string;
    variants: { label: string; price: string }[];
  };

type ProductsTabProps = {
  products: Product[];
  isOwner: boolean;
  hasPerm: (resource: string, action: string) => boolean;
  onProductChange: () => void;
  toast: (msg: string, type: "success" | "error") => void;
};

export default function ProductsTab({ products, isOwner, hasPerm, onProductChange, toast }: ProductsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesFileInputRef = useRef<HTMLInputElement>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "", nameMarathi: "", description: "", metaTitle: "", metaDescription: "", stock: "", weight: "", image: "",
    variants: [{ label: "", price: "" }],
  });

  const resetForm = () => {
    setForm({ name: "", nameMarathi: "", description: "", metaTitle: "", metaDescription: "", stock: "", weight: "", image: "", variants: [{ label: "", price: "" }] });
    setEditingProductId(null);
    setProductImages([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast("Please select an image file", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast("Image must be under 5MB", "error");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const res = await fetchCsrf("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
        const data = await res.json();
        if (data.image) {
          setForm((prev) => ({ ...prev, image: data.image }));
          toast("Image uploaded successfully!", "success");
        } else {
          toast("Upload failed: " + (data.error || "Unknown error"), "error");
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast("Image upload failed", "error");
      setUploading(false);
    }
  };

  const addVariant = () => setForm((prev) => ({
    ...prev, variants: [...prev.variants, { label: "", price: "" }],
  }));

  const updateVariant = (index: number, field: "label" | "price", value: string) => {
    setForm((prev) => {
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  const removeVariant = (index: number) => {
    setForm((prev) => ({
      ...prev, variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const fetchProductImages = async (productId: string) => {
    const res = await fetch(`/api/products/images?productId=${productId}`);
    if (res.ok) {
      const data = await res.json();
      setProductImages(data);
    } else {
      setProductImages([]);
    }
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const formData = new FormData();
      formData.append("productId", editingProductId!);
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }
      const res = await fetchCsrf("/api/products/images", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        toast("Images uploaded successfully!", "success");
        fetchProductImages(editingProductId!);
      } else {
        const err = await res.json();
        toast("Upload failed: " + (err.error || "Unknown error"), "error");
      }
    } catch {
      toast("Image upload failed", "error");
    } finally {
      setUploadingImages(false);
      if (imagesFileInputRef.current) imagesFileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm("Delete this image?")) return;
    const res = await fetchCsrf(`/api/products/images?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Image deleted", "success");
      if (editingProductId) fetchProductImages(editingProductId);
    } else {
      toast("Failed to delete image", "error");
    }
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };
  const handleDragLeave = () => setDragOverIndex(null);
  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }
    const reordered = [...productImages];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    const updated = reordered.map((img, i) => ({ ...img, sortOrder: i }));
    setProductImages(updated);
    setDraggedIndex(null);

    const res = await fetchCsrf("/api/products/images", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images: updated.map((img) => ({ id: img.id, sortOrder: img.sortOrder })),
      }),
    });
    if (!res.ok) {
      toast("Failed to reorder images", "error");
      if (editingProductId) fetchProductImages(editingProductId);
    }
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      nameMarathi: (product as any).nameMarathi || "",
      description: product.description || "",
      metaTitle: (product as any).metaTitle || "",
      metaDescription: (product as any).metaDescription || "",
      stock: product.stock?.toString() || "",
      weight: product.weight?.toString() || "",
      image: product.image || "",
      variants: product.productvariant.map((v) => ({ label: v.label, price: v.price.toString() })),
    });
    setEditingProductId(product.id);
    setShowForm(true);
    fetchProductImages(product.id);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: form.name,
        nameMarathi: form.nameMarathi || null,
        description: form.description || null,
        metaTitle: form.metaTitle || null,
        metaDescription: form.metaDescription || null,
        stock: form.stock ? Number(form.stock) : null,
        weight: form.weight ? Number(form.weight) : null,
        productType: "variant",
        image: form.image || null,
        thumbnail: form.image || null,
        variants: form.variants.filter((v) => v.label.trim() && v.price).map((v) => ({ label: v.label.trim(), price: Number(v.price) })),
      };
      const isEditing = !!editingProductId;
      const res = await fetchCsrf(isEditing ? `/api/products/${editingProductId}` : "/api/products", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast(isEditing ? "Product updated successfully!" : "Product added successfully!", "success");
        resetForm();
        setShowForm(false);
        onProductChange();
      } else {
        const err = await res.json();
        toast(`Error: ${err.details || err.error}`, "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    const res = await fetchCsrf(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      onProductChange();
    } else {
      toast("Failed to delete product", "error");
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-6 md:mb-8">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-stone-900 tracking-tight">Products</h1>
          <p className="text-xs md:text-sm text-stone-500 mt-0.5">{products.length} product{products.length !== 1 ? "s" : ""} • Manage your catalog</p>
        </div>
        {(isOwner || hasPerm("products", "create")) && (
          <button onClick={() => { if (showForm && editingProductId) resetForm(); setShowForm(!showForm); }}
            className="shrink-0 flex items-center gap-1.5 px-3 md:px-5 py-2 md:py-2.5 bg-stone-900 text-white rounded-lg md:rounded-xl text-[11px] md:text-xs font-bold hover:bg-stone-800 transition-all shadow-sm">
            <Plus size={14} strokeWidth={2.5} />
            <span className="hidden sm:inline">{showForm ? "Cancel" : "Add Product"}</span>
            <span className="sm:hidden">{showForm ? "Cancel" : "Add"}</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center">
              <Package size={18} className="text-stone-600" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">{editingProductId ? "Edit Product" : "New Product"}</h2>
              <p className="text-sm text-stone-400">Fill in the details below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4 flex items-center gap-2">
                <FileText size={14} /> Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <input required name="name" value={form.name} placeholder="Product name" onChange={handleChange}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-stone-400 bg-white text-stone-900 placeholder:text-stone-300 text-sm transition-all" />
                </div>
                <div className="md:col-span-2">
                  <textarea name="description" value={form.description} placeholder="Product description (optional)" rows={2} onChange={handleChange}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-stone-400 bg-white text-stone-900 placeholder:text-stone-300 text-sm transition-all resize-none" />
                </div>
                <div>
                  <input name="nameMarathi" value={form.nameMarathi} placeholder="नाव मराठीत (optional)" onChange={handleChange}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-stone-400 bg-white text-stone-900 placeholder:text-stone-300 text-sm transition-all" />
                </div>
                <div className="relative">
                  <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input name="stock" type="number" value={form.stock} placeholder="Stock count" onChange={handleChange}
                    className="w-full border border-stone-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-stone-400 bg-white text-stone-900 placeholder:text-stone-300 text-sm transition-all" />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-xs font-bold">g</span>
                  <input name="weight" type="number" value={form.weight} placeholder="Weight (grams)" onChange={handleChange}
                    className="w-full border border-stone-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-stone-400 bg-white text-stone-900 placeholder:text-stone-300 text-sm transition-all" />
                  {form.weight && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-stone-400">
                      {(parseInt(form.weight) / 1000).toFixed(2).replace(/\.?0+$/, "")} kg
                    </span>
                  )}
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-start gap-3">
                    <div className="relative flex-1">
                      <Link2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                      <input name="image" value={form.image} placeholder="Or paste image URL (optional)" onChange={handleChange}
                        className="w-full border border-stone-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-stone-400 bg-white text-stone-900 placeholder:text-stone-300 text-sm transition-all" />
                    </div>
                    <div>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                        className="flex items-center gap-2 px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50">
                        {uploading ? (
                          <span className="w-4 h-4 border-2 border-stone-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload size={16} />
                        )}
                        {uploading ? "Uploading..." : "Upload"}
                      </button>
                    </div>
                  </div>
                  {form.image && (
                    <div className="mt-3 relative w-20 h-20 rounded-xl overflow-hidden ring-1 ring-stone-200">
                      <Image src={form.image} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Images */}
            {editingProductId && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4 flex items-center gap-2">
                  <ImageIcon size={14} /> Product Images
                </h3>
                {productImages.length > 0 && (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-4">
                    {productImages.map((img, i) => (
                      <div
                        key={img.id}
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragOver={(e) => handleDragOver(e, i)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, i)}
                        className={`relative w-24 h-24 rounded-lg border-2 overflow-hidden cursor-grab active:cursor-grabbing transition-all
                          ${draggedIndex === i ? "opacity-50" : ""}
                          ${dragOverIndex === i ? "border-emerald-500 scale-105" : "border-stone-200"}
                        `}
                      >
                        <Image src={img.url} alt={img.alt || ""} fill className="object-cover pointer-events-none" />
                        <div className="absolute top-1 right-1 z-10">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id); }}
                            className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                            title="Delete image"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <div className="absolute bottom-1 left-1 z-10">
                          <GripVertical size={12} className="text-white drop-shadow" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input
                    ref={imagesFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => imagesFileInputRef.current?.click()}
                    disabled={uploadingImages}
                    className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {uploadingImages ? (
                      <span className="w-4 h-4 border-2 border-stone-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload size={16} />
                    )}
                    {uploadingImages ? "Uploading..." : "Add Images"}
                  </button>
                  <p className="text-xs text-stone-400">Upload multiple product images</p>
                </div>
              </div>
            )}

            {/* SEO */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4">SEO</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Meta Title (SEO)</label>
                  <input name="metaTitle" value={form.metaTitle} onChange={handleChange} placeholder="Custom page title for search engines" className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-stone-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Meta Description (SEO)</label>
                  <textarea name="metaDescription" value={form.metaDescription} onChange={handleChange} rows={2} placeholder="Custom description for search results" className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-stone-400 resize-y" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                  <IndianRupee size={14} /> Variants & Pricing
                </h3>
                <button type="button" onClick={addVariant}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-600 transition-colors">
                  <Plus size={14} strokeWidth={2.5} /> Add Variant
                </button>
              </div>
              <div className="space-y-2.5">
                {form.variants.map((v, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 bg-white border border-stone-200 rounded-xl p-3">
                    <div className="flex-1 min-w-0">
                      <input placeholder="e.g. 200g, 500g, 1kg" value={v.label}
                        onChange={(e) => updateVariant(i, "label", e.target.value)}
                        className="w-full border border-stone-200 sm:border-0 bg-transparent px-3 sm:px-2 py-2 sm:py-1.5 rounded-lg sm:rounded-none outline-none text-sm text-stone-900 placeholder:text-stone-300 font-medium" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-400 text-xs font-medium">₹</span>
                      <input type="number" placeholder="Price" value={v.price}
                        onChange={(e) => updateVariant(i, "price", e.target.value)}
                        className="w-full sm:w-24 border border-stone-200 rounded-lg px-3 py-2 sm:py-1.5 outline-none focus:border-stone-400 bg-white text-sm text-stone-900 placeholder:text-stone-300 text-right" />
                    </div>
                    {form.variants.length > 1 && (
                      <button type="button" onClick={() => removeVariant(i)}
                        className="self-end sm:self-center p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {form.variants.length === 0 && (
                <p className="text-xs text-stone-400 text-center py-6">Add at least one variant</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-stone-100">
              <button type="button" onClick={() => { resetForm(); setShowForm(false); }}
                className="px-6 py-2.5 text-xs font-bold text-stone-500 hover:text-stone-700 transition-colors">Cancel</button>
              <button type="submit"
                disabled={saving || form.variants.filter((v) => v.label.trim() && v.price).length === 0}
                className="px-8 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center gap-2">
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Saving...
                  </>
                ) : editingProductId ? "Update Product" : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {products.length > 0 ? (
          <>
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50">
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Product</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden lg:table-cell">मराठी</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden xl:table-cell">Variants</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden sm:table-cell">Stock</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden sm:table-cell">Weight</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-stone-200">
                            {product.image ? (
                              <Image src={product.image} alt={product.name} width={40} height={40}
                                className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon size={16} className="text-stone-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-stone-800">{product.name}</p>
                            {product.description && (
                              <p className="text-xs text-stone-400 mt-0.5 line-clamp-1 max-w-[200px]">{product.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-stone-500 text-sm">{(product as any).nameMarathi || "—"}</td>
                      <td className="px-5 py-4 hidden xl:table-cell">
                        <div className="flex flex-wrap gap-1.5">
                          {product.productvariant.map((v) => (
                            <span key={v.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg text-[11px] font-medium">
                              {v.label}<span className="text-stone-400">•</span>₹{v.price}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell text-stone-600 font-medium">{product.stock ?? "—"}</td>
                      <td className="px-5 py-4 hidden sm:table-cell text-stone-600 text-sm">
                        {product.weight > 0 ? `${product.weight}g${product.weight >= 1000 ? ` / ${(product.weight / 1000).toFixed(1).replace(/\.0$/, "")}kg` : ""}` : "—"}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {(isOwner || hasPerm("products", "edit")) && (
                          <button onClick={() => handleEdit(product)}
                            className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all mr-1" title="Edit product">
                            <Pencil size={15} />
                          </button>
                        )}
                        {(isOwner || hasPerm("products", "delete")) && (
                          <button onClick={() => deleteProduct(product.id)}
                            className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete product">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-stone-100">
              {products.map((product) => (
                <div key={product.id} className="p-4 hover:bg-stone-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-stone-100 rounded-xl overflow-hidden shrink-0 ring-1 ring-stone-200">
                      {product.image ? (
                        <Image src={product.image} alt={product.name} width={48} height={48} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon size={18} className="text-stone-300" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-800 text-sm">{product.name}</p>
                      {(product as any).nameMarathi && <p className="text-[11px] text-stone-400">{(product as any).nameMarathi}</p>}
                      {product.stock != null && <p className="text-[11px] text-stone-500 mt-1">Stock: {product.stock}</p>}
                      {product.productvariant.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {product.productvariant.slice(0, 2).map((v) => (
                            <span key={v.id} className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-medium">
                              {v.label} • ₹{v.price}
                            </span>
                          ))}
                          {product.productvariant.length > 2 && (
                            <span className="text-[10px] text-stone-400 px-1">+{product.productvariant.length - 2} more</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {(isOwner || hasPerm("products", "edit")) && (
                        <button onClick={() => handleEdit(product)} className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                          <Pencil size={13} />
                        </button>
                      )}
                      {(isOwner || hasPerm("products", "delete")) && (
                        <button onClick={() => deleteProduct(product.id)} className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </>
        ) : (
          <div className="text-center py-20">
            <Package size={44} className="mx-auto text-stone-200 mb-4" strokeWidth={1} />
            <p className="text-stone-400 text-sm mb-4">No products yet</p>
            {(isOwner || hasPerm("products", "create")) && (
              <button onClick={() => { resetForm(); setShowForm(true); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all shadow-sm">
                <Plus size={15} strokeWidth={2.5} /> Add Your First Product
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
