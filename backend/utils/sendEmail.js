import nodemailer from "nodemailer";
import { Resend } from "resend";

let resend = null;

// Only initialize Resend in production (Render / Vercel)
if (process.env.NODE_ENV === "production") {
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY missing in production");
  } else {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
}

export const sendOrderEmail = async (order) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    console.log("📨 Email Mode:", isProduction ? "Resend (Production)" : "Gmail SMTP (Localhost)");

    // ------------------------------------------------------------
    // 🔥 1. PRODUCTION (RENDER, VERCEL) → RESEND
    // ------------------------------------------------------------
    if (isProduction) {
      if (!resend) {
        console.error("❌ Resend not initialized");
        return { success: false };
      }

      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: order.user.email,
          subject: `Order Confirmation - #${order._id}`,
          html: generateEmailHtml(order),
        });

        console.log("✅ Resend email sent successfully!");
        return { success: true };
      } catch (error) {
        console.error("❌ Resend email error:", error);
        return { success: false, reason: error.message };
      }
    }

    // ------------------------------------------------------------
    // 🔥 2. LOCALHOST → GMAIL SMTP
    // ------------------------------------------------------------
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.warn("⚠️ Missing EMAIL_USER or EMAIL_PASS in local env");
      return { success: false };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    await transporter.sendMail({
      from: emailUser,
      to: order.user.email,
      subject: `Order Confirmation - #${order._id}`,
      html: generateEmailHtml(order),
    });

    console.log("✅ Gmail SMTP email sent successfully (Localhost)");
    return { success: true };

  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return { success: false, reason: error.message };
  }
};


// ------------------------------------------------------------
// ⭐ HTML TEMPLATE
// ------------------------------------------------------------
const generateEmailHtml = (order) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #333;">Thank you for your order!</h1>
    <p>Dear ${order.user.name},</p>
    <p>Your order has been confirmed. Here are your order details:</p>

    <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h3>Order Info</h3>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
      <p><strong>Total:</strong> ₹${order.totalPrice.toFixed(2)}</p>
    </div>

    <h3>Items Ordered:</h3>
    ${order.items.map(item => `
      <div style="padding: 10px; border-bottom: 1px solid #ddd;">
        <p><strong>${item.name}</strong></p>
        <p>Size: ${item.size}</p>
        <p>Qty: ${item.quantity}</p>
        <p>Price: ₹${item.price.toFixed(2)}</p>
      </div>
    `).join("")}

    <p style="margin-top: 20px;">We’ll notify you when your order ships.</p>
  </div>
`;
