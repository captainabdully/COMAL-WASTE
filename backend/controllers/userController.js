
import bcrypt from "bcryptjs";
import { sql } from "../config/db.js";
import { clearPermissionCache } from "../middleware/permissionMiddleware.js";

/* ============================================================
    1. INITIAL ADMIN CREATION (RUN ONCE)
============================================================ */
export const createAdminSetup = async (req, res) => {
  try {
    const setupSecret = req.get("x-setup-secret");
    if (!process.env.BOOTSTRAP_SECRET || setupSecret !== process.env.BOOTSTRAP_SECRET) {
      return res.status(403).json({ message: "Admin setup is not authorized" });
    }

    if (!process.env.BOOTSTRAP_ADMIN_EMAIL || !process.env.BOOTSTRAP_ADMIN_PASSWORD) {
      return res.status(503).json({ message: "Admin bootstrap is not configured" });
    }

    const exists = await sql`
      SELECT * FROM user_roles WHERE user_role = 'admin' LIMIT 1
    `;

    if (exists.length > 0) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const adminId = `USR-${Date.now()}`;
    const hashedPwd = await bcrypt.hash(process.env.BOOTSTRAP_ADMIN_PASSWORD, 12);

    await sql`
      INSERT INTO users (user_id, name, email, phone_number, password, user_category)
      VALUES (${adminId}, 'System Admin', ${process.env.BOOTSTRAP_ADMIN_EMAIL}, '0000000000', ${hashedPwd}, 'system')
    `;

    await sql`
      INSERT INTO user_roles (user_id, user_role)
      VALUES (${adminId}, 'admin')
    `;

    res.status(201).json({ message: "Admin created successfully", user_id: adminId });

  } catch (error) {
    console.error("Admin setup error:", error);
    res.status(500).json({ message: "Error creating admin" });
  }
};


/* ============================================================
    2. CREATE STANDARD USER (Vendor by default)
============================================================ */
export const createUser = async (req, res) => {
  try {
    const { name, email, phone_number, password } = req.body;

    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({ message: "Name, email, and a password of at least 8 characters are required" });
    }

    const exists = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;

    if (exists.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    const userId = `USR-${Date.now()}`;
    const hashed = await bcrypt.hash(password, 12);

    await sql`
      INSERT INTO users (user_id, name, email, phone_number, password)
      VALUES (${userId}, ${name}, ${email}, ${phone_number}, ${hashed})
    `;

    await sql`
      INSERT INTO user_roles (user_id, user_role)
      VALUES (${userId}, 'vendor')
    `;

    res.status(201).json({
      message: "User created successfully",
      user_id: userId,
      name: name,
      email: email,
      phone_number: phone_number,
      default_role: 'vendor',
    });

  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ============================================================
    3. GET ALL USERS (Admin / Manager)
    Returns: id, user_id, name, email, phone_number, created_at, roles[]
============================================================ */
export const getAllUsers = async (req, res) => {
  try {
    const rows = await sql`
      SELECT 
        u.id,
        u.user_id,
        u.name,
        u.email,
        u.phone_number,
        u.created_at,
        u.is_active,
        COALESCE(json_agg(ur.user_role) FILTER (WHERE ur.user_role IS NOT NULL), '[]') AS user_roles
      FROM users u
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      GROUP BY u.id, u.user_id, u.name, u.email, u.phone_number, u.created_at, u.is_active
      ORDER BY u.id DESC;
    `;

    res.status(200).json({
      success: true,
      users: rows
    });

  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
};




/* ============================================================
    4. GET SPECIFIC USER (with roles)
============================================================ */
export const getUserById = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!req.permissions.has("users.view") && !req.permissions.has("users.manage") && req.user.user_id !== user_id) {
      return res.status(403).json({ message: "Forbidden: you can only view your own profile" });
    }

    const user = await sql`
      SELECT * FROM users WHERE user_id = ${user_id} LIMIT 1
    `;

    if (user.length === 0)
      return res.status(404).json({ message: "User not found" });

    const roles = await sql`
      SELECT user_role FROM user_roles WHERE user_id = ${user_id}
    `;

    res.status(200).json({
      ...user[0],
      roles: roles.map(r => r.user_role)
    });

  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ============================================================
    5. UPDATE USER INFO
============================================================ */
export const updateUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const isAdmin = req.permissions.has("users.manage");
    if (!isAdmin && req.user.user_id !== user_id) {
      return res.status(403).json({ message: "Forbidden: you can only edit your own profile" });
    }

    // Apps send `phone`; the API field is `phone_number`. Omitted fields keep their value.
    const clean = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);
    const name = clean(req.body.name);
    const phone = clean(req.body.phone_number ?? req.body.phone);
    const email = clean(req.body.email)?.toLowerCase() ?? null;
    // Category is an admin-only attribute.
    const category = isAdmin ? clean(req.body.user_category) : null;

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }
    if (email) {
      const taken = await sql`SELECT 1 FROM users WHERE LOWER(email) = ${email} AND user_id <> ${user_id} LIMIT 1`;
      if (taken.length > 0) return res.status(400).json({ message: "Email already exists" });
    }

    const updated = await sql`
      UPDATE users SET
        name = COALESCE(${name}, name),
        phone_number = COALESCE(${phone}, phone_number),
        email = COALESCE(${email}, email),
        user_category = COALESCE(${category}, user_category)
      WHERE user_id = ${user_id}
      RETURNING user_id, name, email, phone_number, user_category
    `;
    if (updated.length === 0) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User updated successfully", user: updated[0] });

  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ============================================================
    6. UPDATE USER ROLES (Admin only)
============================================================ */
export const updateUserRoles = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { roles } = req.body; // array → ["manager", "vendor"]

    await sql`DELETE FROM user_roles WHERE user_id = ${user_id}`;

    for (const role of roles) {
      await sql`
        INSERT INTO user_roles (user_id, user_role)
        VALUES (${user_id}, ${role})
      `;
    }

    res.status(200).json({ message: "Roles updated successfully" });

  } catch (error) {
    console.error("Role update error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ============================================================
    7. DELETE USER + ROLES
============================================================ */
export const deleteUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (user_id === req.user.user_id) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }
    const guard = await guardLastAdmin(user_id);
    if (guard) return res.status(400).json({ message: guard });

    await sql`DELETE FROM user_roles WHERE user_id = ${user_id}`;
    const deleted = await sql`DELETE FROM users WHERE user_id = ${user_id} RETURNING user_id`;
    if (!deleted.length) return res.status(404).json({ message: "User not found" });
    clearPermissionCache();

    res.status(200).json({ message: "User deleted successfully" });

  } catch (error) {
    // 23503 = foreign key violation: the user still owns pickup orders or other records.
    if (error.code === "23503") {
      return res.status(409).json({ message: "This user has pickup orders or other records. Deactivate the account instead of deleting it." });
    }
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ============================================================
    8. ADMIN USER MANAGEMENT (create with roles, roles, status, password)
============================================================ */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// True when removing the admin role from / deactivating / deleting this user would leave no active admin.
async function guardLastAdmin(user_id) {
  const [target] = await sql`
    SELECT 1 AS is_admin FROM user_roles ur JOIN users u ON u.user_id = ur.user_id
    WHERE ur.user_id = ${user_id} AND ur.user_role = 'admin' AND u.is_active
  `;
  if (!target) return null;
  const [{ count }] = await sql`
    SELECT COUNT(*)::int AS count FROM user_roles ur JOIN users u ON u.user_id = ur.user_id
    WHERE ur.user_role = 'admin' AND u.is_active AND ur.user_id <> ${user_id}
  `;
  return count === 0 ? "This is the last active admin. Make another user an admin first." : null;
}

// Validates role names and enforces that the caller can only hand out roles whose
// permissions they already hold (no privilege escalation).
async function checkAssignableRoles(req, roles) {
  if (!Array.isArray(roles) || roles.length === 0) return "Select at least one role";
  const unique = [...new Set(roles)];
  const found = await sql`SELECT name FROM roles WHERE name = ANY(${unique})`;
  if (found.length !== unique.length) return "Unknown role selected";
  const perms = await sql`SELECT DISTINCT permission FROM role_permissions WHERE role_name = ANY(${unique})`;
  if (perms.some((p) => !req.permissions.has(p.permission))) {
    return "You cannot assign a role that has more permissions than you do";
  }
  return null;
}

export const adminCreateUser = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const phone = String(req.body.phone_number || "").trim() || null;
    const { password, roles } = req.body;

    if (!name || !EMAIL_RE.test(email)) return res.status(400).json({ message: "A name and a valid email are required" });
    if (typeof password !== "string" || password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
    const roleError = await checkAssignableRoles(req, roles);
    if (roleError) return res.status(400).json({ message: roleError });

    const exists = await sql`SELECT 1 FROM users WHERE LOWER(email) = ${email} LIMIT 1`;
    if (exists.length) return res.status(409).json({ message: "Email already exists" });

    const userId = `USR-${Date.now()}`;
    const hashed = await bcrypt.hash(password, 12);
    await sql`INSERT INTO users (user_id, name, email, phone_number, password) VALUES (${userId}, ${name}, ${email}, ${phone}, ${hashed})`;
    for (const role of [...new Set(roles)]) {
      await sql`INSERT INTO user_roles (user_id, user_role) VALUES (${userId}, ${role})`;
    }
    res.status(201).json({ message: "User created successfully", user_id: userId });
  } catch (error) {
    console.error("Admin create user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const setUserRoles = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { roles } = req.body;
    if (user_id === req.user.user_id) return res.status(400).json({ message: "You cannot change your own roles" });
    const exists = await sql`SELECT 1 FROM users WHERE user_id = ${user_id}`;
    if (!exists.length) return res.status(404).json({ message: "User not found" });

    const roleError = await checkAssignableRoles(req, roles);
    if (roleError) return res.status(400).json({ message: roleError });

    if (!roles.includes("admin")) {
      const guard = await guardLastAdmin(user_id);
      if (guard) return res.status(400).json({ message: guard });
    }
    // A caller must also be allowed to take away what the user currently has.
    const currentPerms = await sql`
      SELECT DISTINCT rp.permission FROM user_roles ur JOIN role_permissions rp ON rp.role_name = ur.user_role WHERE ur.user_id = ${user_id}
    `;
    if (currentPerms.some((p) => !req.permissions.has(p.permission))) {
      return res.status(403).json({ message: "You cannot change a user who has more permissions than you do" });
    }

    await sql`DELETE FROM user_roles WHERE user_id = ${user_id}`;
    for (const role of [...new Set(roles)]) {
      await sql`INSERT INTO user_roles (user_id, user_role) VALUES (${user_id}, ${role})`;
    }
    clearPermissionCache();
    res.status(200).json({ message: "Roles updated successfully" });
  } catch (error) {
    console.error("Set user roles error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const setUserStatus = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { is_active } = req.body;
    if (typeof is_active !== "boolean") return res.status(400).json({ message: "is_active must be true or false" });
    if (user_id === req.user.user_id) return res.status(400).json({ message: "You cannot deactivate your own account" });
    if (!is_active) {
      const guard = await guardLastAdmin(user_id);
      if (guard) return res.status(400).json({ message: guard });
    }
    const updated = await sql`UPDATE users SET is_active = ${is_active} WHERE user_id = ${user_id} RETURNING user_id`;
    if (!updated.length) return res.status(404).json({ message: "User not found" });
    clearPermissionCache();
    res.status(200).json({ message: is_active ? "User activated" : "User deactivated" });
  } catch (error) {
    console.error("Set user status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { newPassword } = req.body;
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    const hashed = await bcrypt.hash(newPassword, 12);
    const updated = await sql`UPDATE users SET password = ${hashed} WHERE user_id = ${user_id} RETURNING user_id`;
    if (!updated.length) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
