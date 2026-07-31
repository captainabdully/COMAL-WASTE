import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sql } from "../config/db.js";
import { sendPasswordResetEmail, sendConfirmationEmail } from "../config/email.js";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config(); // load environment variables


// ===============================
// USER LOGIN
// ===============================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Fetch user by email
    const rows = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    // Compare passwords
    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Fetch assigned roles
    const roles = await sql`
      SELECT user_role FROM user_roles WHERE user_id = ${user.user_id}
    `;

    const userRoles = roles.map(r => r.user_role);

    // Validate token secrets
    if (!process.env.JWT_SECRET) {
      console.error("❌ Missing JWT_SECRET in .env");
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      console.error("❌ Missing JWT_REFRESH_SECRET in .env");
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    // Create Access Token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        roles: userRoles
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Create Refresh Token
    const refreshToken = jwt.sign(
      { user_id: user.user_id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      refreshToken,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        roles: userRoles
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// REFRESH TOKEN CONTROLLER
// ===============================
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      // Create new access token
      const newAccessToken = jwt.sign(
        { user_id: decoded.user_id },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      res.status(200).json({
        message: "Token refreshed",
        token: newAccessToken
      });
    });

  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { currentPassword, newPassword } = req.body;

    const isPrivileged = req.user.roles?.some((role) => ["admin", "manager"].includes(role));
    if (!isPrivileged && req.user.user_id !== user_id) {
      return res.status(403).json({ message: "Forbidden: you can only change your own password" });
    }

    if (!user_id || !currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "Current password and a new password of at least 8 characters are required" });
    }

    // 1. Fetch user to check existence
    const rows = await sql`
      SELECT * FROM users WHERE user_id = ${user_id} LIMIT 1
    `;

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // 3. Hash new password
    const hashedNewInfo = await bcrypt.hash(newPassword, 12);

    // 4. Update password in DB
    await sql`
      UPDATE users 
      SET password = ${hashedNewInfo}
      WHERE user_id = ${user_id}
    `;

    res.status(200).json({ message: "Password changed successfully" });

  } catch (error) {  
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Check if user exists
    const rows = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;

    if (rows.length === 0) {
      return res.status(200).json({ message: "If the email exists, a password reset link has been sent." });
    }

    const user = rows[0];
    console.log("✓ User found:", user.email);

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Store token in database
    try {
      console.log("📝 Storing reset token in database...");
      
      await sql`
        DELETE FROM password_reset_tokens WHERE email = ${email}
      `;
      
      await sql`
        INSERT INTO password_reset_tokens (user_id, email, reset_token, expires_at)
        VALUES (${user.user_id}, ${email}, ${hashedToken}, ${expiresAt})
      `;
      
      console.log("✓ Token stored successfully");
    } catch (dbError) {
      console.error("❌ Database error storing reset token:", dbError);
      return res.status(500).json({ message: "Failed to generate reset token: " + dbError.message });
    }

    const resetBaseUrl = process.env.PASSWORD_RESET_URL;
    if (!resetBaseUrl) {
      console.error("PASSWORD_RESET_URL is not configured");
      return res.status(503).json({ message: "Password reset is temporarily unavailable" });
    }
    const resetLink = `${resetBaseUrl}?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    // Send email
    console.log("📧 Sending password reset email to:", email);
    const emailSent = await sendPasswordResetEmail(email, resetToken, resetLink);
    
    if (!emailSent) {
      console.error("❌ Failed to send email");
      return res.status(500).json({ message: "Failed to send reset email. Please try again." });
    }

    console.log("✓ Password reset email sent successfully");

    res.status(200).json({ message: "If the email exists, a password reset link has been sent." });

  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, resetToken } = req.body;
    
    if (!email || !newPassword || !resetToken) {
      return res.status(400).json({ message: "Email, password, and reset token are required" });
    }

    // Hash the provided token to match what's in the database
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Check if token exists and is valid
    const tokenRows = await sql`
      SELECT * FROM password_reset_tokens 
      WHERE email = ${email} AND reset_token = ${hashedToken} LIMIT 1
    `;

    if (tokenRows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const tokenRecord = tokenRows[0];

    // Check if token has expired
    if (new Date() > new Date(tokenRecord.expires_at)) {
      // Delete the expired token
      await sql`DELETE FROM password_reset_tokens WHERE id = ${tokenRecord.id}`;
      return res.status(400).json({ message: "Reset token has expired" });
    }

    // Verify user exists
    const userRows = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userRows[0];

    // Hash new password
    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);

    // Update password
    await sql`
      UPDATE users 
      SET password = ${hashedNewPassword}
      WHERE email = ${email}
    `;

    // Delete the used token
    await sql`DELETE FROM password_reset_tokens WHERE id = ${tokenRecord.id}`;

    // Send confirmation email
    await sendConfirmationEmail(email, user.name);

    res.status(200).json({ message: "Password reset successfully" });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Test email configuration endpoint
export const testEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    console.log("🧪 Testing email configuration for:", email);

    const testLink = "https://example.com/reset-password?token=test123";
    const result = await sendPasswordResetEmail(email, "test_token", testLink);

    if (result) {
      res.status(200).json({ 
        message: "✓ Test email sent successfully",
        email: email
      });
    } else {
      res.status(500).json({ 
        message: "✗ Failed to send test email - check backend logs for details"
      });
    }
  } catch (error) {
    console.error("❌ Test email error:", error);
    res.status(500).json({ 
      message: "Test email error: " + error.message 
    });
  }
};

export default {
  login,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  testEmail
};
