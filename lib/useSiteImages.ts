"use client";

import { useState, useEffect, useCallback } from "react";

let cachedImages: Record<string, string> | null = null;
let cachePromise: Promise<Record<string, string>> | null = null;

const DEFAULTS: Record<string, string> = {
  logo: "/logo.png",
  hero_slide_1: "/use_everywhere.jpg",
  hero_slide_2: "/use_everywhere.jpg",
  hero_slide_3: "/use_everywhere.jpg",
  category_moong: "/use_everywhere.jpg",
  category_masala: "/use_everywhere.jpg",
  category_garlic: "/use_everywhere.jpg",
  category_urad: "/use_everywhere.jpg",
  category_pickles: "/use_everywhere.jpg",
  category_spices: "/use_everywhere.jpg",
  category_combos: "/use_everywhere.jpg",
  category_snacks: "/use_everywhere.jpg",
  combo_family: "/use_everywhere.jpg",
  combo_starter: "/use_everywhere.jpg",
  combo_festive: "/use_everywhere.jpg",
  combo_spice: "/use_everywhere.jpg",
  explorer_moong: "/use_everywhere.jpg",
  explorer_masala: "/use_everywhere.jpg",
  explorer_garlic: "/use_everywhere.jpg",
  explorer_urad: "/use_everywhere.jpg",
  heritage: "/use_everywhere.jpg",
  login_bg: "/use_everywhere.jpg",
  signup_bg: "/use_everywhere.jpg",
  product_fallback: "/use_everywhere.jpg",
};

async function fetchSiteImages(): Promise<Record<string, string>> {
  if (cachedImages) return cachedImages;
  if (cachePromise) return cachePromise;

  cachePromise = fetch("/api/site-images")
    .then((r) => r.json())
    .then((data) => {
      cachedImages = { ...DEFAULTS, ...data };
      return cachedImages as Record<string, string>;
    })
    .catch(() => {
      cachedImages = { ...DEFAULTS };
      return cachedImages;
    });

  return cachePromise;
}

export function useSiteImages() {
  const [images, setImages] = useState<Record<string, string>>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSiteImages().then((imgs) => {
      setImages(imgs);
      setLoading(false);
    });
  }, []);

  const getImage = useCallback(
    (key: string, fallback?: string) => {
      return images[key] || fallback || DEFAULTS[key] || "/use_everywhere.jpg";
    },
    [images]
  );

  const refresh = useCallback(async () => {
    cachedImages = null;
    cachePromise = null;
    const imgs = await fetchSiteImages();
    setImages(imgs);
  }, []);

  return { images, getImage, loading, refresh };
}
