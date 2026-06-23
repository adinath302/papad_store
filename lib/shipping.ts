export const FREE_SHIPPING_MIN = 599;

export const SHIPPING_FEES: Record<string, number> = {
  "Maharashtra": 50,
};

export const DEFAULT_SHIPPING_FEE = 100;

export function calculateShippingFee(
  subtotal: number,
  state?: string | null,
): number {
  if (subtotal >= FREE_SHIPPING_MIN) return 0;
  if (state && SHIPPING_FEES[state] !== undefined) return SHIPPING_FEES[state];
  return DEFAULT_SHIPPING_FEE;
}
