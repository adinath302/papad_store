const PICKUP_STATE = "Maharashtra";
const PICKUP_PINCODE = process.env.STORE_PINCODE || "413709";

const METRO_CITIES = new Set([
  "Mumbai", "Delhi", "Kolkata", "Chennai", "Bengaluru", "Bangalore",
  "Hyderabad", "Ahmedabad", "Pune", "Surat", "Jaipur", "Lucknow",
  "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam",
  "Vadodara", "Nashik",
]);

type Zone = "local" | "metro" | "same_state" | "rest_of_india";

const RATE_SLABS: { maxWeight: number; local: number; metro: number; sameState: number; restOfIndia: number }[] = [
  { maxWeight: 50,   local: 22, metro: 29, sameState: 26, restOfIndia: 35 },
  { maxWeight: 200,  local: 30, metro: 38, sameState: 34, restOfIndia: 45 },
  { maxWeight: 500,  local: 45, metro: 55, sameState: 50, restOfIndia: 65 },
];

const ADDITIONAL_PER_500 = { local: 20, metro: 25, sameState: 22, restOfIndia: 30 };

const ETD: Record<Zone, string> = {
  local: "1-2 days",
  metro: "2-3 days",
  same_state: "2-4 days",
  rest_of_india: "3-6 days",
};

const ZONE_LABELS: Record<Zone, string> = {
  local: "Local",
  metro: "Metro",
  same_state: "Same State",
  rest_of_india: "Rest of India",
};

export type IndiaPostOption = {
  service: string;
  rate: number;
  estimated_delivery: string;
  zone: Zone;
};

export async function checkPincode(pincode: string): Promise<{
  valid: boolean;
  city?: string;
  state?: string;
}> {
  try {
    const url = `https://www.indiapost.gov.in/_layouts/15/DOP.PinSearch.Web/PinSearchService.svc/GetPinDetails?PinCode=${pincode}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const text = await res.text();

    const match = text.match(/<PlaceName>([^<]+)<\/PlaceName>/);
    const stateMatch = text.match(/<StateName>([^<]+)<\/StateName>/);
    const city = match?.[1]?.trim();
    const state = stateMatch?.[1]?.trim();

    if (city && state) {
      return { valid: true, city, state };
    }
    return { valid: false };
  } catch (err) {
    console.error("IndiaPost pincode lookup failed:", err);
    return { valid: false };
  }
}

export function estimateZone(state: string): Zone {
  if (state === PICKUP_STATE) return "same_state";
  return "rest_of_india";
}

function determineZone(deliveryState: string, deliveryCity: string): Zone {
  if (deliveryState === PICKUP_STATE) {
    const isDeliveryMetro = METRO_CITIES.has(deliveryCity);
    if (isDeliveryMetro) return "metro";
    return "same_state";
  }

  if (METRO_CITIES.has(deliveryCity)) return "metro";
  return "rest_of_india";
}

export function calculateSpeedPostRate(weightGrams: number, zone: Zone): number {
  if (typeof weightGrams !== "number" || !isFinite(weightGrams) || weightGrams < 0) {
    weightGrams = 500;
  }

  const zoneKey = zone === "same_state" ? "sameState" : zone === "rest_of_india" ? "restOfIndia" : zone;
  const slab = RATE_SLABS.find((s) => weightGrams <= s.maxWeight);

  if (slab) {
    return slab[zoneKey as keyof typeof slab] as number;
  }

  const lastSlab = RATE_SLABS[RATE_SLABS.length - 1];
  let cost = lastSlab[zoneKey as keyof typeof lastSlab] as number;
  const remaining = weightGrams - lastSlab.maxWeight;
  const addlKey = zoneKey as keyof typeof ADDITIONAL_PER_500;
  const extraUnits = Math.ceil(remaining / 500);
  cost += ADDITIONAL_PER_500[addlKey] * extraUnits;
  return cost;
}

export async function getIndiaPostOptions(params: {
  deliveryPincode: string;
  totalWeight: number;
}): Promise<{
  options: IndiaPostOption[];
  pincodeInfo: { city?: string; state?: string } | null;
}> {
  const pincodeInfo = await checkPincode(params.deliveryPincode);

  if (!pincodeInfo.valid || !pincodeInfo.state || !pincodeInfo.city) {
    // Fallback: return a flat-rate estimate when IndiaPost API is unavailable
    return { options: [], pincodeInfo: null };
  }

  const zone = determineZone(pincodeInfo.state, pincodeInfo.city);
  const rate = calculateSpeedPostRate(params.totalWeight, zone);

  return {
    options: [
      {
        service: "Speed Post",
        rate,
        estimated_delivery: ETD[zone],
        zone,
      },
    ],
    pincodeInfo,
  };
}

export function generateOrderReference(orderId: string): string {
  const short = orderId.slice(-8).toUpperCase();
  return `SP-${short}`;
}
