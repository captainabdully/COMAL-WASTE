import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter for Gmail with better error handling
export const createTransporter = () => {
  const user = process.env.MAIL_USERNAME;
  let pass = process.env.MAIL_PASSWORD;

  console.log("📧 Email Config Check:");
  console.log("  User:", user ? "✓ Set (" + user.substring(0, 5) + "...)" : "✗ Missing");
  console.log("  Pass:", pass ? "✓ Set" : "✗ Missing");

  if (!user || !pass) {
    console.error("❌ Email credentials missing in .env!");
  }

  // Remove quotes if present in password
  pass = pass?.replace(/^["']|["']$/g, '');

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: user,
      pass: pass,
    },
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, resetLink) => {
  try {
    const transporter = createTransporter();

    // Verify connection before sending
    await new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          console.error("❌ Email transporter error:", error.message);
          reject(error);
        } else {
          console.log("✓ Email transporter verified");
          resolve(success);
        }
      });
    });
    
    const mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: email,
      subject: "Password Reset Request - COMAL WASTE",
      html: `
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Click the link below to proceed:</p>
        <p>
          <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetLink}</p>
        <p><strong>This link will expire in 1 hour.</strong></p>
        <p>If you did not request a password reset, please ignore this email or contact support.</p>
        <hr />
        <p><small>COMAL WASTE Management System</small></p>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✓ Password reset email sent successfully:", result.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending password reset email:", error.message);
    return false;
  }
};

// Send confirmation email
export const sendConfirmationEmail = async (email, name) => {
  try {
    const transporter = createTransporter();

    // Verify connection before sending
    await new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          console.error("❌ Email transporter error:", error.message);
          reject(error);
        } else {
          console.log("✓ Email transporter verified");
          resolve(success);
        }
      });
    });
    
    const mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: email,
      subject: "Password Reset Successful - COMAL WASTE",
      html: `
        <h2>Password Reset Successful</h2>
        <p>Hi ${name},</p>
        <p>Your password has been successfully reset.</p>
        <p>You can now log in with your new password.</p>
        <p>If you did not make this change, please contact support immediately.</p>
        <hr />
        <p><small>COMAL WASTE Management System</small></p>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✓ Confirmation email sent successfully:", result.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending confirmation email:", error.message);
    return false;
  }
};

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const STATUS_COPY = {
  assigned: { subject: 'Your pickup request was approved', line: 'Good news - your pickup request has been approved and a team will collect it.' },
  completed: { subject: 'Your pickup request is completed', line: 'Your pickup request has been completed. Thank you for working with us.' },
  cancelled: { subject: 'Your pickup request was rejected', line: 'Unfortunately your pickup request could not be accepted.' },
};

// Tell a vendor their request changed status. Never throws: a mail failure must not fail the order update.
export const sendOrderStatusEmail = async (order) => {
  try {
    const copy = STATUS_COPY[order.status];
    if (!copy || !order.vendor_email || !process.env.MAIL_USERNAME || !process.env.MAIL_PASSWORD) return false;
    const reason = order.status === 'cancelled' && order.rejection_comment
      ? `<p><strong>Reason:</strong> ${esc(order.rejection_comment)}</p>` : '';
    await createTransporter().sendMail({
      from: process.env.MAIL_USERNAME,
      to: order.vendor_email,
      subject: `${copy.subject} - COMAL WASTE`,
      html: `
        <h2>${esc(copy.subject)}</h2>
        <p>Hi ${esc(order.vendor_name || 'there')},</p>
        <p>${esc(copy.line)}</p>
        <p><strong>Order:</strong> #${esc(order.order_id ?? order.id)}<br />
           <strong>Category:</strong> ${esc(order.category)}<br />
           <strong>Quantity:</strong> ${esc(order.quantity)} ${esc(order.quantity_unit || 'kg')}<br />
           <strong>Dropping point:</strong> ${esc(order.location_name)}</p>
        ${reason}
        <hr /><p><small>COMAL WASTE Management System</small></p>`,
    });
    return true;
  } catch (error) {
    console.error('Error sending order status email:', error.message);
    return false;
  }
};
