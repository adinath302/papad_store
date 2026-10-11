const TARGET_BYTES = 1.2 * 1024 * 1024;
const MAX_EDGE = 1600;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Image compression failed"));
        else resolve(blob);
      },
      type,
      quality,
    );
  });
}

function drawScaled(
  img: HTMLImageElement,
  maxEdge: number,
): HTMLCanvasElement {
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image compression failed");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }
  if (file.type === "image/gif") return file;

  const img = await loadImage(file);
  let maxEdge = MAX_EDGE;
  let quality = 0.82;
  let blob: Blob | null = null;
  const type = "image/webp";

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const canvas = drawScaled(img, maxEdge);
    blob = await canvasToBlob(canvas, type, quality);
    if (blob.size <= TARGET_BYTES) break;
    if (quality > 0.68) quality -= 0.06;
    else maxEdge = Math.round(maxEdge * 0.82);
  }

  if (!blob) return file;

  const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], name, { type, lastModified: Date.now() });
}
