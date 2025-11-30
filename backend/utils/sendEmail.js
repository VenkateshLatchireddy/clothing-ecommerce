import nodemailer from 'nodemailer';

const sendOrderEmail = async (order) => {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (!emailUser || !emailPass) {
      console.warn('⚠️ Email credentials not set; skipping email send (EMAIL_USER/EMAIL_PASS)');
      return { success: false, reason: 'Missing email credentials' };
    }

    // Allow configuration by service or host/port
    const transporterConfig = {};
    if (process.env.EMAIL_SERVICE) {
      transporterConfig.service = process.env.EMAIL_SERVICE; // e.g. 'gmail', 'hotmail'
    }
    if (process.env.SENDGRID_API_KEY && !process.env.EMAIL_HOST && !process.env.EMAIL_SERVICE) {
      transporterConfig.host = 'smtp.sendgrid.net';
      transporterConfig.port = Number(process.env.EMAIL_PORT) || 587;
      transporterConfig.secure = false;
      transporterConfig.auth = {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      };
    } else if (process.env.EMAIL_HOST) {
      transporterConfig.host = process.env.EMAIL_HOST;
      transporterConfig.port = Number(process.env.EMAIL_PORT) || 587;
      transporterConfig.secure = process.env.EMAIL_SECURE === 'true';
    }

    // If SendGrid API key was set, auth was configured earlier; only set auth from EMAIL_USER/PASS if not already set
    if (!transporterConfig.auth) {
      transporterConfig.auth = {
        user: emailUser,
        pass: emailPass
      };
    }

    // If no email service or host is configured, fall back to Gmail service as a convenience
    // NOTE: this fallback is not recommended for production — configure a proper SMTP/SendGrid provider
    if (!transporterConfig.service && !transporterConfig.host) {
      transporterConfig.service = 'gmail';
      console.warn('⚠️ No email service/host configured; defaulting to Gmail as a fallback. Configure EMAIL_HOST or EMAIL_SERVICE for production.');
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.user.email,
      subject: `Order Confirmation - #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Thank you for your order!</h1>
          <p>Dear ${order.user.name},</p>
          <p>Your order has been confirmed. Here are your order details:</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Order Information</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong>₹  ${order.totalPrice.toFixed(2)}</p>
          </div>

          <h3>Items Ordered:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #333; color: white;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: left;">Size</th>
                <th style="padding: 10px; text-align: left;">Qty</th>
                <th style="padding: 10px; text-align: left;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 10px;">${item.name}</td>
                  <td style="padding: 10px;">${item.size}</td>
                  <td style="padding: 10px;">${item.quantity}</td>
                  <td style="padding: 10px;">₹ ${item.price.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 20px; padding: 20px; background: #e8f5e8; border-radius: 5px;">
            <h3 style="margin: 0; color: #2d5016;">Total: ₹ ${order.totalPrice.toFixed(2)}</h3>
          </div>

          <p style="margin-top: 30px;">We'll notify you when your order ships.</p>
          <p>Thank you for shopping with us!</p>
        </div>
      `
    };

    // Retry logic with exponential backoff (3 attempts)
    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent successfully (attempt', attempt, ')');
        return { success: true };
      } catch (err) {
        lastError = err;
        console.warn(`Email send attempt ${attempt} failed:`, err?.message || err);
        // backoff: 1s, 2s, 4s
        const delay = 1000 * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    console.error('All email attempts failed:', lastError);
    // Return error info so caller may decide what to do; do not throw here to avoid breaking order creation
    return { success: false, reason: lastError?.message || 'Unknown error', error: lastError };
  } catch (error) {
    // Log full stack for troubleshooting and return an error result to avoid throwing
    console.error('Email sending error (unexpected):', error);
    return { success: false, reason: error?.message || 'Unexpected error', error };
  }
};

export { sendOrderEmail };
export const verifyTransporter = async () => {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (!emailUser || !emailPass) {
      console.warn('⚠️ Email credentials (EMAIL_USER/EMAIL_PASS) not set; transporter verify skipped');
      return false;
    }
    const transporterConfig = {};
    if (process.env.EMAIL_SERVICE) transporterConfig.service = process.env.EMAIL_SERVICE;
    if (process.env.SENDGRID_API_KEY && !process.env.EMAIL_HOST && !process.env.EMAIL_SERVICE) {
      transporterConfig.host = 'smtp.sendgrid.net';
      transporterConfig.port = Number(process.env.EMAIL_PORT) || 587;
      transporterConfig.secure = false;
    } else if (process.env.EMAIL_HOST) {
      transporterConfig.host = process.env.EMAIL_HOST;
      transporterConfig.port = Number(process.env.EMAIL_PORT) || 587;
      transporterConfig.secure = process.env.EMAIL_SECURE === 'true';
    }
    // Default fallback to Gmail if nothing configured
    if (!transporterConfig.service && !transporterConfig.host) {
      transporterConfig.service = 'gmail';
      console.warn('⚠️ Email verifier fallback to Gmail service; consider configuring EMAIL_HOST or EMAIL_SERVICE for production');
    }
    // For verifyTransporter: if SENDGRID_API_KEY specified and auth isn't set, use that; otherwise use EMAIL_USER/PASS
    if (!transporterConfig.auth) {
      if (process.env.SENDGRID_API_KEY && !process.env.EMAIL_USER) {
        transporterConfig.auth = { user: 'apikey', pass: process.env.SENDGRID_API_KEY };
      } else {
        transporterConfig.auth = { user: emailUser, pass: emailPass };
      }
    }
    const transporter = nodemailer.createTransport(transporterConfig);
    try {
      console.log('🔧 Email transporter config:', { service: transporterConfig.service, host: transporterConfig.host, port: transporterConfig.port, secure: transporterConfig.secure });
      await transporter.verify();
      console.log('✅ Email transporter verified successfully');
      return true;
    } catch (verifyErr) {
      console.error('Email transporter verify failed:', verifyErr);
      return false;
    }
  } catch (err) {
    console.error('❌ Email transporter verification failed:', err);
    return false;
  }
};