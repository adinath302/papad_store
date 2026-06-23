import nodemailer from "nodemailer";

type OrderEmailData = {
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
  items: { name: string; quantity: number }[];
};

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
    secure: false,
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

  const itemsHtml = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;color:#333;">${item.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;color:#333;text-align:center;">${item.quantity}</td>
        </tr>`,
    )
    .join("");

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
            <td style="padding:8px 0;font-weight:600;font-size:13px;">#${data.orderId.slice(0, 12).toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Customer</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;">${data.fullName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Phone</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;">${data.phone}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Address</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;">${data.address}, ${data.city}, ${data.state} - ${data.pincode}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Payment</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;">${data.paymentType}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Status</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;color:#065f46;">${data.status}</td>
          </tr>
        </table>

        <h3 style="font-size:14px;margin:16px 0 8px;color:#333;">Items</h3>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#666;">Product</th>
              <th style="padding:8px 12px;text-align:center;font-size:12px;color:#666;">Qty</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="border-top:2px solid #065f46;margin-top:16px;padding-top:12px;text-align:right;font-size:18px;font-weight:700;color:#065f46;">
          Total: ₹${data.totalAmount}
        </div>

        <p style="margin-top:20px;font-size:12px;color:#999;text-align:center;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/admin" style="color:#065f46;">View in Admin Panel →</a>
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

  const itemsHtml = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;color:#333;">${item.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;color:#333;text-align:center;">${item.quantity}</td>
        </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#065f46;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
        <div style="font-size:40px;margin-bottom:8px;">✅</div>
        <h1 style="color:#fff;margin:0;font-size:20px;">Order Confirmed!</h1>
      </div>
      <div style="background:#fff;border:1px solid #e5e5e5;border-top:0;padding:24px;border-radius:0 0 12px 12px;">
        <p style="color:#333;font-size:14px;">Thank you for your order, <strong>${data.fullName}</strong>!</p>
        <p style="color:#666;font-size:13px;">We'll process your order and notify you when it ships.</p>

        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Order ID</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;">#${data.orderId.slice(0, 12).toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Payment</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;">${data.paymentType === "COD" ? "Cash on Delivery" : data.paymentType}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;font-size:13px;">Delivery</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;">${data.address}, ${data.city}, ${data.state} - ${data.pincode}</td>
          </tr>
        </table>

        <h3 style="font-size:14px;margin:16px 0 8px;color:#333;">Items Ordered</h3>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#666;">Product</th>
              <th style="padding:8px 12px;text-align:center;font-size:12px;color:#666;">Qty</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="border-top:2px solid #065f46;margin-top:16px;padding-top:12px;text-align:right;font-size:18px;font-weight:700;color:#065f46;">
          Total: ₹${data.totalAmount}
        </div>

        <p style="margin-top:20px;font-size:12px;color:#999;text-align:center;">
          Need help? Reply to this email or contact us.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `✅ Order Confirmed #${data.orderId.slice(0, 8).toUpperCase()} - Shivshambho`,
      html,
    });
  } catch (error) {
    console.error("Failed to send customer confirmation:", error);
  }
}
