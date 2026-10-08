import nodemailer from "nodemailer";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";
const SUPPORT_PHONE = process.env.SUPPORT_PHONE || "+91 98765 43210";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type OrderEmailItem = {
  name: string;
  quantity: number;
  price?: number | null;
  variant?: string | null;
};

export type OrderEmailData = {
  orderId: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  totalAmount: number;
  paymentType: string;
  status: string;
  items: OrderEmailItem[];
  courierName?: string | null;
  trackingId?: string | null;
  trackingUrl?: string | null;
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Accepted",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function formatOrderStatus(status: string): string {
  return ORDER_STATUS_LABELS[status] || status;
}

function formatPaymentType(paymentType: string): string {
  return paymentType === "COD" ? "Cash on Delivery" : paymentType;
}

function renderItemsHtml(items: OrderEmailItem[]): string {
  return items
    .map((item) => {
      const label = item.variant ? `${item.name} (${item.variant})` : item.name;
      const lineTotal =
        typeof item.price === "number" ? item.price * item.quantity : null;
      return `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #e5e5e5;color:#333;">
            <strong>${escapeHtml(label)}</strong>
            ${typeof item.price === "number" ? `<div style="font-size:12px;color:#888;margin-top:2px;">₹${item.price} each</div>` : ""}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #e5e5e5;color:#888;text-align:center;">× ${item.quantity}</td>
          <td style="padding:10px 0;border-bottom:1px solid #e5e5e5;color:#333;text-align:right;font-weight:600;">${lineTotal != null ? `₹${lineTotal}` : ""}</td>
        </tr>`;
    })
    .join("");
}

function itemsTable(items: OrderEmailItem[]): string {
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead>
              <tr>
                <th style="text-align:left;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;border-bottom:1px solid #e5e5e5;">Product</th>
                <th style="text-align:center;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;border-bottom:1px solid #e5e5e5;">Qty</th>
                <th style="text-align:right;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;border-bottom:1px solid #e5e5e5;">Amount</th>
              </tr>
            </thead>
            <tbody>${renderItemsHtml(items)}</tbody>
          </table>`;
}

export function buildOrderEmailData(order: {
  id: string;
  fullName: string;
  phone: string;
  address1: string;
  address2?: string | null;
  city: string;
  state: string;
  pincode: string;
  totalAmount: number;
  paymentType: string;
  status: string;
  courierName?: string | null;
  trackingId?: string | null;
  orderitem: {
    quantity: number;
    price?: number | null;
    product: { name: string };
    variantId?: string | null;
  }[];
}): OrderEmailData {
  return {
    orderId: order.id,
    fullName: order.fullName,
    phone: order.phone,
    address: order.address1 + (order.address2 ? `, ${order.address2}` : ""),
    city: order.city,
    state: order.state,
    pincode: order.pincode,
    totalAmount: order.totalAmount,
    paymentType: order.paymentType,
    status: order.status,
    courierName: order.courierName,
    trackingId: order.trackingId,
    items: order.orderitem.map((oi) => ({
      name: oi.product.name,
      quantity: oi.quantity,
      price: oi.price,
    })),
  };
}

function getTransporter() {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendAdminOrderNotification(data: OrderEmailData) {
  const transporter = getTransporter();
  if (!transporter) return;

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (adminEmails.length === 0) return;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#065f46;padding:24px;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:20px;">🛒 New Order Received!</h1>
      </div>
      <div style="background:#fff;border:1px solid #e5e5e5;border-top:0;padding:24px;border-radius:0 0 12px 12px;">
        <p style="color:#666;font-size:14px;">A new order has been placed on your store.</p>

        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Order ID</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;">#${escapeHtml(data.orderId.slice(0, 12).toUpperCase())}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Customer</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;">${escapeHtml(data.fullName)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Phone</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;">${escapeHtml(data.phone)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Address</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;">${escapeHtml(data.address)}, ${escapeHtml(data.city)}, ${escapeHtml(data.state)} - ${escapeHtml(data.pincode)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Payment</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;">${escapeHtml(data.paymentType)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Status</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;color:#065f46;">${escapeHtml(formatOrderStatus(data.status))}</td>
          </tr>
        </table>

        <h3 style="font-size:14px;margin:16px 0 8px;color:#333;">Items</h3>
        ${itemsTable(data.items)}

        <div style="border-top:2px solid #065f46;margin-top:16px;padding-top:12px;text-align:right;font-size:18px;font-weight:700;color:#065f46;">
          Total: ₹${data.totalAmount}
        </div>

        <p style="margin-top:20px;font-size:12px;color:#999;text-align:center;">
          <a href="${BASE_URL}/admin" style="color:#065f46;">View in Admin Panel →</a>
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: adminEmails.join(", "),
      subject: `🛒 New Order #${data.orderId.slice(0, 8).toUpperCase()} - ₹${data.totalAmount}`,
      html,
    });
  } catch (error) {
    console.error("Failed to send email notification:", error);
  }
}

export async function sendCustomerOrderConfirmation(
  email: string,
  data: OrderEmailData,
) {
  const transporter = getTransporter();
  if (!transporter || !email) return;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#065f46;padding:32px 24px;border-radius:16px 16px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Thank You, ${escapeHtml(data.fullName.split(" ")[0])}!</h1>
        <p style="color:#a7f3d0;font-size:14px;margin:8px 0 0;">Your order is ${escapeHtml(formatOrderStatus(data.status).toLowerCase())} and we're making it fresh.</p>
      </div>
      <div style="background:#fff;border:1px solid #e5e5e5;border-top:0;padding:32px;border-radius:0 0 16px 16px;">
        <p style="color:#333;font-size:15px;line-height:1.6;">
          Namaste <strong style="color:#065f46;">${escapeHtml(data.fullName)}</strong>,
        </p>
        <p style="color:#666;font-size:14px;line-height:1.6;">
          We're so glad you chose Shivshambho! Your order is now in our kitchen — we'll prepare it with the same love and care that's been our tradition since 1984.
        </p>
        <p style="color:#666;font-size:14px;line-height:1.6;">
          Here's what you ordered:
        </p>

        <div style="background:#faf8f5;border-radius:12px;padding:20px;margin:20px 0;">
          ${itemsTable(data.items)}
          <div style="border-top:2px solid #065f46;margin-top:12px;padding-top:12px;font-size:16px;font-weight:700;color:#065f46;text-align:right;">
            Total: ₹${data.totalAmount}
          </div>
        </div>

        <div style="background:#faf8f5;border-radius:12px;padding:16px;font-size:13px;margin:20px 0;">
          <p style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Shipment status</p>
          <p style="color:#065f46;margin:0 0 12px;font-weight:700;">${escapeHtml(formatOrderStatus(data.status))}</p>
          <p style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Delivering to</p>
          <p style="color:#333;margin:0;font-weight:600;">${escapeHtml(data.fullName)}</p>
          <p style="color:#666;margin:2px 0 0;">${escapeHtml(data.phone)}</p>
          <p style="color:#666;margin:2px 0 0;">${escapeHtml(data.address)}, ${escapeHtml(data.city)}, ${escapeHtml(data.state)} - ${escapeHtml(data.pincode)}</p>
          <p style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:12px 0 4px;">Payment</p>
          <p style="color:#333;margin:0;font-weight:600;">${escapeHtml(formatPaymentType(data.paymentType))}</p>
        </div>

        <div style="background:#fef3c7;border-radius:12px;padding:16px;text-align:center;margin:20px 0;border:1px solid #fde68a;">
          <p style="color:#92400e;font-size:13px;margin:0;line-height:1.6;">
            🏡 <strong>Handmade with love,</strong> sun-dried to perfection.<br>
            Your order will be dispatched within 24 hours.
          </p>
        </div>

        <div style="text-align:center;margin-top:24px;">
          <a href="${BASE_URL}/orders" style="display:inline-block;background:#065f46;color:#fff;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;">
            View My Order
          </a>
        </div>

        <p style="margin-top:24px;font-size:12px;color:#999;text-align:center;line-height:1.6;">
          Warm regards,<br>
          <strong style="color:#065f46;">The Shivshambho Family</strong><br>
          <span style="font-size:11px;">Crafted with tradition since 1984</span>
        </p>
        <p style="font-size:11px;color:#bbb;text-align:center;margin-top:16px;">
          Need help? Reply to this email or call ${SUPPORT_PHONE}<br>
          <a href="${BASE_URL}/privacy" style="color:#065f46;">Privacy Policy</a>
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `Order ${formatOrderStatus(data.status)} #${data.orderId.slice(0, 8).toUpperCase()} - Shivshambho`,
      html,
    });
  } catch (error) {
    console.error("Failed to send customer confirmation:", error);
  }
}

type ShippingEmailData = {
  orderId: string;
  fullName: string;
  courierName: string;
  trackingId: string;
  trackingUrl?: string | null;
  items: { name: string; quantity: number }[];
};

export async function sendCustomerShippingNotification(
  email: string,
  data: ShippingEmailData,
) {
  const transporter = getTransporter();
  if (!transporter || !email) return;

  const itemsHtml = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;color:#333;"><strong>${escapeHtml(item.name)}</strong></td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;color:#888;text-align:right;">× ${item.quantity}</td>
        </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#065f46;padding:32px 24px;border-radius:16px 16px 0 0;text-align:center;">
        <div style="font-size:48px;margin-bottom:12px;">🚚</div>
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Your Order is On Its Way!</h1>
        <p style="color:#a7f3d0;font-size:14px;margin:8px 0 0;">Packed fresh and handed over to ${escapeHtml(data.courierName)}.</p>
      </div>
      <div style="background:#fff;border:1px solid #e5e5e5;border-top:0;padding:32px;border-radius:0 0 16px 16px;">
        <p style="color:#333;font-size:15px;line-height:1.6;">
          Namaste <strong style="color:#065f46;">${escapeHtml(data.fullName)}</strong>,
        </p>
        <p style="color:#666;font-size:14px;line-height:1.6;">
          Great news! Your order has been carefully packed and handed over to ${escapeHtml(data.courierName)}. It's now on its way to your doorstep.
        </p>

        <div style="background:#065f46;border-radius:12px;padding:20px;margin:20px 0;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.2);color:#a7f3d0;width:100px;">Courier</td>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.2);color:#fff;font-weight:600;">${escapeHtml(data.courierName)}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#a7f3d0;">Tracking ID</td>
              <td style="padding:8px 0;color:#fff;font-weight:600;font-family:monospace;letter-spacing:1px;">${escapeHtml(data.trackingId)}</td>
            </tr>
          </table>
        </div>

        <div style="background:#faf8f5;border-radius:12px;padding:16px;margin:20px 0;font-size:13px;">
          <p style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Items in this shipment</p>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th style="text-align:left;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;border-bottom:1px solid #e5e5e5;">Product</th>
                <th style="text-align:right;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;border-bottom:1px solid #e5e5e5;">Qty</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
        </div>

        ${data.trackingUrl ? `
        <div style="text-align:center;margin-top:24px;">
          <a href="${escapeHtml(data.trackingUrl)}" style="display:inline-block;background:#065f46;color:#fff;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;">
            🚚 Track Your Order
          </a>
        </div>
        ` : ""}
        <p style="font-size:12px;color:#999;text-align:center;margin-top:12px;">
            Or track anytime at <a href="${BASE_URL}/track" style="color:#065f46;font-weight:600;">${BASE_URL}/track</a>
        </p>

        <p style="margin-top:24px;font-size:12px;color:#999;text-align:center;line-height:1.6;">
          Warm regards,<br>
          <strong style="color:#065f46;">The Shivshambho Family</strong><br>
          <span style="font-size:11px;">Crafted with tradition since 1984</span>
        </p>
        <p style="font-size:11px;color:#bbb;text-align:center;margin-top:16px;">
          Need help? Reply to this email or call ${SUPPORT_PHONE}<br>
          <a href="${BASE_URL}/privacy" style="color:#065f46;">Privacy Policy</a>
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `🚚 Order Shipped #${data.orderId.slice(0, 8).toUpperCase()} - Shivshambho`,
      html,
    });
  } catch (error) {
    console.error("Failed to send shipping notification:", error);
  }
}

const STATUS_EMAILS: Record<string, { title: string; message: string }> = {
  PENDING: {
    title: "Order Received",
    message: "We have received your order and it is pending confirmation.",
  },
  CONFIRMED: {
    title: "Order Accepted",
    message: "Your order has been accepted and we are preparing it fresh in our kitchen.",
  },
  SHIPPED: {
    title: "Order Shipped",
    message: "Your order has been packed and handed over to the courier partner.",
  },
  DELIVERED: {
    title: "Order Delivered",
    message: "Your order has been delivered. We hope you enjoy every bite!",
  },
  CANCELLED: {
    title: "Order Cancelled",
    message: "Your order has been cancelled. If you have any questions, please reach out.",
  },
};

export async function sendCustomerOrderStatusUpdate(
  email: string,
  data: OrderEmailData,
) {
  const transporter = getTransporter();
  if (!transporter || !email) return;

  const statusInfo = STATUS_EMAILS[data.status] || {
    title: `Order ${formatOrderStatus(data.status)}`,
    message: `Your order status has been updated to ${formatOrderStatus(data.status)}.`,
  };

  const shipmentBlock =
    data.status === "SHIPPED" && data.courierName
      ? `<div style="background:#065f46;border-radius:12px;padding:20px;margin:20px 0;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.2);color:#a7f3d0;width:100px;">Courier</td>
              <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.2);color:#fff;font-weight:600;">${escapeHtml(data.courierName)}</td>
            </tr>
            ${
              data.trackingId
                ? `<tr>
              <td style="padding:8px 0;color:#a7f3d0;">Tracking ID</td>
              <td style="padding:8px 0;color:#fff;font-weight:600;font-family:monospace;letter-spacing:1px;">${escapeHtml(data.trackingId)}</td>
            </tr>`
                : ""
            }
          </table>
        </div>`
      : "";

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#065f46;padding:32px 24px;border-radius:16px 16px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">${escapeHtml(statusInfo.title)}</h1>
        <p style="color:#a7f3d0;font-size:14px;margin:8px 0 0;">Shipment status: ${escapeHtml(formatOrderStatus(data.status))}</p>
      </div>
      <div style="background:#fff;border:1px solid #e5e5e5;border-top:0;padding:32px;border-radius:0 0 16px 16px;">
        <p style="color:#333;font-size:15px;line-height:1.6;">
          Namaste <strong style="color:#065f46;">${escapeHtml(data.fullName)}</strong>,
        </p>
        <p style="color:#666;font-size:14px;line-height:1.6;">${escapeHtml(statusInfo.message)}</p>

        <div style="background:#ecfdf5;border-radius:12px;padding:16px;margin:20px 0;text-align:center;">
          <p style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Current status</p>
          <p style="color:#065f46;margin:0;font-size:18px;font-weight:700;">${escapeHtml(formatOrderStatus(data.status))}</p>
        </div>

        ${shipmentBlock}

        <div style="background:#faf8f5;border-radius:12px;padding:20px;margin:20px 0;">
          ${itemsTable(data.items)}
          <div style="border-top:2px solid #065f46;margin-top:12px;padding-top:12px;font-size:16px;font-weight:700;color:#065f46;text-align:right;">
            Total: ₹${data.totalAmount}
          </div>
        </div>

        <div style="background:#faf8f5;border-radius:12px;padding:16px;font-size:13px;margin:20px 0;">
          <p style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Delivering to</p>
          <p style="color:#333;margin:0;font-weight:600;">${escapeHtml(data.fullName)}</p>
          <p style="color:#666;margin:2px 0 0;">${escapeHtml(data.phone)}</p>
          <p style="color:#666;margin:2px 0 0;">${escapeHtml(data.address)}, ${escapeHtml(data.city)}, ${escapeHtml(data.state)} - ${escapeHtml(data.pincode)}</p>
        </div>

        <div style="text-align:center;margin-top:24px;">
          <a href="${BASE_URL}/orders" style="display:inline-block;background:#065f46;color:#fff;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;">
            View My Orders
          </a>
        </div>

        <p style="margin-top:24px;font-size:12px;color:#999;text-align:center;line-height:1.6;">
          Warm regards,<br>
          <strong style="color:#065f46;">The Shivshambho Family</strong><br>
          <span style="font-size:11px;">Crafted with tradition since 1984</span>
        </p>
        <p style="font-size:11px;color:#bbb;text-align:center;margin-top:16px;">
          Need help? Reply to this email or call ${SUPPORT_PHONE}<br>
          <a href="${BASE_URL}/privacy" style="color:#065f46;">Privacy Policy</a>
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `${statusInfo.title} #${data.orderId.slice(0, 8).toUpperCase()} - Shivshambho`,
      html,
    });
  } catch (error) {
    console.error("Failed to send status update email:", error);
  }
}

export function resolveCustomerEmail(
  orderEmail?: string | null,
  userEmail?: string | null,
): string | null {
  const value = (orderEmail || userEmail || "").trim().toLowerCase();
  return value || null;
}
