"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Save, RotateCcw, Check } from "lucide-react";
import { fetchCsrf } from "@/lib/csrf-client";

type SiteImagesTabProps = {
  toast: (msg: string, type: "success" | "error") => void;
};

const ABOUT_GALLERY_KEYS = [
  "about_gallery_1",
  "about_gallery_2",
  "about_gallery_3",
  "about_gallery_4",
  "about_gallery_5",
  "about_gallery_6",
];

const SECTIONS = [
  {
    title: "Logo",
    keys: [{ key: "logo", label: "Site Logo" }],
  },
  {
    title: "Hero Carousel",
    keys: [
      { key: "hero_slide_1", label: "Slide 1" },
      { key: "hero_slide_2", label: "Slide 2" },
      { key: "hero_slide_3", label: "Slide 3" },
    ],
  },
  {
    title: "Category Images",
    keys: [
      { key: "category_moong", label: "Moong Special" },
      { key: "category_masala", label: "Masala Punch" },
      { key: "category_garlic", label: "Garlic Infusion" },
      { key: "category_urad", label: "Urad Traditional" },
      { key: "category_pickles", label: "Pickles & Chutney" },
      { key: "category_spices", label: "Spice Blends" },
      { key: "category_combos", label: "Festival Combos" },
      { key: "category_snacks", label: "Snack Crunchies" },
    ],
  },
  {
    title: "Combo Section",
    keys: [
      { key: "combo_family", label: "Family Feast" },
      { key: "combo_starter", label: "Starter Taster" },
      { key: "combo_festive", label: "Festive Celebration" },
      { key: "combo_spice", label: "Spice Lover's Bundle" },
    ],
  },
  {
    title: "Papad Explorer",
    keys: [
      { key: "explorer_moong", label: "Explorer - Moong" },
      { key: "explorer_masala", label: "Explorer - Masala" },
      { key: "explorer_garlic", label: "Explorer - Garlic" },
      { key: "explorer_urad", label: "Explorer - Urad" },
    ],
  },
  {
    title: "About Us Gallery",
    keys: [
      { key: "about_gallery_1", label: "Gallery 1" },
      { key: "about_gallery_2", label: "Gallery 2" },
      { key: "about_gallery_3", label: "Gallery 3" },
      { key: "about_gallery_4", label: "Gallery 4" },
      { key: "about_gallery_5", label: "Gallery 5" },
      { key: "about_gallery_6", label: "Gallery 6" },
    ],
  },
  {
    title: "Other Sections",
    keys: [
      { key: "heritage", label: "Heritage Section" },
      { key: "login_bg", label: "Login Background" },
      { key: "signup_bg", label: "Signup Background" },
      { key: "product_fallback", label: "Product Fallback" },
    ],
  },
];

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetchCsrf("/api/upload", {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok || !data.image) {
    throw new Error(data.error || "Upload failed");
  }
  return data.image as string;
}

export default function SiteImagesTab({ toast }: SiteImagesTabProps) {
  const [images, setImages] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKeys, setUploadingKeys] = useState<Set<string>>(new Set());
  const [batchUploading, setBatchUploading] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const aboutBatchRef = useRef<HTMLInputElement | null>(null);
  const imagesRef = useRef(images);
  const originalRef = useRef(original);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    originalRef.current = original;
  }, [original]);

  useEffect(() => {
    fetch("/api/site-images")
      .then((r) => r.json())
      .then((data) => {
        setImages(data);
        setOriginal(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast("Failed to load site images", "error");
      });
  }, [toast]);

  const persistPartial = async (partial: Record<string, string>) => {
    if (Object.keys(partial).length === 0) return true;
    const res = await fetchCsrf("/api/site-images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: partial }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Save failed");
    }
    const merged = { ...originalRef.current, ...partial };
    originalRef.current = merged;
    setOriginal(merged);
    return true;
  };

  const persistImages = async (next: Record<string, string>) => {
    const baseline = originalRef.current;
    const changed: Record<string, string> = {};
    for (const [key, url] of Object.entries(next)) {
      if (url !== baseline[key]) changed[key] = url;
    }
    return persistPartial(changed);
  };

  const hasChanges = JSON.stringify(images) !== JSON.stringify(original);

  const markUploading = (key: string, on: boolean) => {
    setUploadingKeys((prev) => {
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const handleUpload = async (key: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast("Please select an image file", "error");
      return;
    }
    markUploading(key, true);
    try {
      const url = await uploadFile(file);
      imagesRef.current = { ...imagesRef.current, [key]: url };
      setImages({ ...imagesRef.current });
      await persistPartial({ [key]: url });
      toast("Image uploaded!", "success");
    } catch (err: any) {
      toast(err?.message || "Image upload failed", "error");
    } finally {
      markUploading(key, false);
    }
  };

  const handleAboutBatch = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) {
      toast("Please select image files", "error");
      return;
    }

    const slots = ABOUT_GALLERY_KEYS.filter((key) => !uploadingKeys.has(key));
    const selected = list.slice(0, slots.length);
    if (selected.length === 0) {
      toast("All gallery slots are currently uploading", "error");
      return;
    }

    setBatchUploading(true);
    selected.forEach((_, i) => markUploading(slots[i], true));

    try {
      const results = await Promise.allSettled(
        selected.map((file) => uploadFile(file)),
      );
      const uploaded: Record<string, string> = {};
      let ok = 0;
      results.forEach((result, i) => {
        if (result.status === "fulfilled") {
          uploaded[slots[i]] = result.value;
          ok += 1;
        }
      });
      imagesRef.current = { ...imagesRef.current, ...uploaded };
      setImages({ ...imagesRef.current });
      if (ok > 0) {
        await persistPartial(uploaded);
        toast(`${ok} About Us image${ok === 1 ? "" : "s"} uploaded`, "success");
      }
      if (ok < selected.length) {
        toast(`${selected.length - ok} image${selected.length - ok === 1 ? "" : "s"} failed`, "error");
      }
    } catch (err: any) {
      toast(err?.message || "Batch upload failed", "error");
    } finally {
      selected.forEach((_, i) => markUploading(slots[i], false));
      setBatchUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await persistImages(images);
      toast("Site images saved!", "success");
    } catch (err: any) {
      toast(err?.message || "Failed to save", "error");
    }
    setSaving(false);
  };

  const handleReset = () => {
    setImages({ ...original });
    toast("Changes reverted", "success");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Site Images</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage images displayed across the website
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-all border border-stone-200"
            >
              <RotateCcw size={13} /> Revert
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={13} />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {SECTIONS.map((section) => (
        <div
          key={section.title}
          className="bg-white rounded-2xl border border-stone-200 p-5"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-bold text-stone-800">
              {section.title}
            </h3>
            {section.title === "About Us Gallery" && (
              <>
                <button
                  type="button"
                  onClick={() => aboutBatchRef.current?.click()}
                  disabled={batchUploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-40"
                >
                  {batchUploading ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload size={12} />
                  )}
                  {batchUploading ? "Uploading..." : "Add multiple images"}
                </button>
                <input
                  ref={aboutBatchRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) handleAboutBatch(e.target.files);
                    e.target.value = "";
                  }}
                />
              </>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {section.keys.map(({ key, label }) => (
              <div
                key={key}
                className="group relative bg-stone-50 rounded-xl border border-stone-200 overflow-hidden"
              >
                <div className="relative aspect-square">
                  <img
                    src={images[key] || "/use_everywhere.jpg"}
                    alt={label}
                    className="w-full h-full object-cover"
                  />
                  {uploadingKeys.has(key) && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => fileRefs.current[key]?.click()}
                      disabled={uploadingKeys.has(key)}
                      className="p-2.5 bg-white rounded-xl shadow-lg hover:bg-stone-50 transition-colors disabled:opacity-50"
                      title="Upload new image"
                    >
                      {uploadingKeys.has(key) ? (
                        <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload size={16} className="text-stone-700" />
                      )}
                    </button>
                  </div>
                  {images[key] !== original[key] && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-[11px] font-semibold text-stone-700 truncate">
                    {label}
                  </p>
                  <p className="text-[9px] text-stone-400 truncate mt-0.5">
                    {key}
                  </p>
                </div>
                <input
                  ref={(el) => { fileRefs.current[key] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(key, file);
                    e.target.value = "";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
