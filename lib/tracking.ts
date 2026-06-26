const COURIER_TRACKING_URLS: Record<string, string> = {
  "indiapost": "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?ConsignmentNumber={trackingId}",
  "speed post": "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?ConsignmentNumber={trackingId}",
  "dtdc": "https://www.dtdc.com/track?tracking_number={trackingId}",
  "delhivery": "https://www.delhivery.com/track/package/{trackingId}",
  "bluedart": "https://www.bluedart.com/tracking?reference={trackingId}",
  "fedex": "https://www.fedex.com/fedextrack/?trknbr={trackingId}",
  "dhl": "https://www.dhl.com/in-en/home/tracking/tracking-ecommerce.html?tracking-id={trackingId}",
  "xpressbees": "https://ship.xpressbees.com/tracking?awb={trackingId}",
  "ecom express": "https://ecomexpress.in/tracking/?awb_field={trackingId}",
  "shadowfax": "https://track.shadowfax.in/{trackingId}",
};

export function getTrackingUrl(courierName: string | null, trackingId: string | null): string | null {
  if (!trackingId || trackingId === "PENDING") return null;
  if (!courierName) return null;

  const key = courierName.toLowerCase().trim();
  for (const [name, urlTemplate] of Object.entries(COURIER_TRACKING_URLS)) {
    if (key.includes(name)) {
      return urlTemplate.replace("{trackingId}", encodeURIComponent(trackingId));
    }
  }
  return null;
}

export function getOrderTrackingUrl(baseUrl: string, orderId: string): string {
  return `${baseUrl}/track?order=${orderId}`;
}
