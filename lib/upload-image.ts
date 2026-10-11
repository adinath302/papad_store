import { fetchCsrf } from "@/lib/csrf-client";
import { compressImage } from "@/lib/compress-image";

type SignPayload = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  error?: string;
};

export async function uploadImage(file: File): Promise<string> {
  const compressed = await compressImage(file);
  const signRes = await fetchCsrf("/api/upload/sign", { method: "POST" });
  const sign = (await signRes.json()) as SignPayload;
  if (!signRes.ok || !sign.signature || !sign.cloudName) {
    throw new Error(sign.error || "Could not start image upload");
  }

  const formData = new FormData();
  formData.append("file", compressed);
  formData.append("api_key", sign.apiKey);
  formData.append("timestamp", String(sign.timestamp));
  formData.append("signature", sign.signature);
  formData.append("folder", sign.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
    { method: "POST", body: formData },
  );
  const data = await res.json();
  if (!res.ok || !data.secure_url) {
    throw new Error(data.error?.message || "Upload failed");
  }
  return data.secure_url as string;
}
