import Razorpay from "razorpay";

let client: Razorpay | null = null;

// Lazily construct the client so that importing this module never throws
// during build / page-data collection when env vars are absent.
export function getRazorpay(): Razorpay {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay is not configured");
  }

  if (!client) {
    client = new Razorpay({ key_id, key_secret });
  }

  return client;
}

export function getRazorpayKeyId(): string {
  return process.env.RAZORPAY_KEY_ID || "";
}

export function isRazorpayConfigured(): boolean {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}
