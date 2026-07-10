"use client";

import { useState, useEffect, useRef } from "react";
import { Image, Upload, Save, RotateCcw, Check } from "lucide-react";

type SiteImagesTabProps = {
  toast: (msg: string, type: "success" | "error") => void;
};

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
    title: "Other Sections",
    keys: [
      { key: "heritage", label: "Heritage Section" },
      { key: "login_bg", label: "Login Background" },
      { key: "signup_bg", label: "Signup Background" },
      { key: "product_fallback", label: "Product Fallback" },
    ],
  },
];

export default function SiteImagesTab({ toast }: SiteImagesTabProps) {
  const [images, setImages] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

  const hasChanges = JSON.stringify(images) !== JSON.stringify(original);

  const handleUpload = async (key: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast("Please select an image file", "error");
      return;
    }
    setUploadingKey(key);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
        const data = await res.json();
        if (data.image) {
          setImages((prev) => ({ ...prev, [key]: data.image }));
          toast("Image uploaded!", "success");
        } else {
          toast("Upload failed: " + (data.error || "Unknown error"), "error");
        }
        setUploadingKey(null);
      };
      reader.readAsDataURL(file);
    } catch {
      toast("Image upload failed", "error");
      setUploadingKey(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const changed: Record<string, string> = {};
      for (const [key, url] of Object.entries(images)) {
        if (url !== original[key]) {
          changed[key] = url;
        }
      }
      if (Object.keys(changed).length === 0) {
        toast("No changes to save", "success");
        setSaving(false);
        return;
      }
      const res = await fetch("/api/site-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: changed }),
      });
      const data = await res.json();
      if (data.success) {
        setOriginal({ ...images });
        toast("Site images saved!", "success");
      } else {
        toast("Save failed: " + (data.error || "Unknown error"), "error");
      }
    } catch {
      toast("Failed to save", "error");
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
          <h3 className="text-sm font-bold text-stone-800 mb-4">
            {section.title}
          </h3>
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
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => fileRefs.current[key]?.click()}
                      disabled={uploadingKey === key}
                      className="p-2.5 bg-white rounded-xl shadow-lg hover:bg-stone-50 transition-colors"
                      title="Upload new image"
                    >
                      {uploadingKey === key ? (
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
