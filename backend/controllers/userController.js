
import bcrypt from "bcryptjs";
import { sql } from "../config/db.js";

/* ============================================================
    1. INITIAL ADMIN CREATION (RUN ONCE)
============================================================ */
export const createAdminSetup = async (req, res) => {
  try {
    const exists = await sql`
      SELECT * FROM user_roles WHERE user_role = 'admin' LIMIT 1
    `;

    if (exists.length > 0) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const adminId = `USR-${Date.now()}`;
    const hashedPwd = bcrypt.hashSync("Admin@123", 10);

    await sql`
      INSERT INTO users (user_id, name, email, phone_number, password, user_category)
      VALUES (${adminId}, 'System Admin', 'admin@system.com', '0000000000', ${hashedPwd}, 'system')
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
    const { name, email, phone_number, password, role = "vendor" } = req.body;

    const exists = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;

    if (exists.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    const userId = `USR-${Date.now()}`;
    const hashed = bcrypt.hashSync(password, 10);

    await sql`
      INSERT INTO users (user_id, name, email, phone_number, password)
      VALUES (${userId}, ${name}, ${email}, ${phone_number}, ${hashed})
    `;

    await sql`
      INSERT INTO user_roles (user_id, user_role)
      VALUES (${userId}, ${role})
    `;

    res.status(201).json({
      message: "User created successfully",
      user_id: userId,
      name: name,
      email: email,
      phone_number: phone_number,
      default_role: role,
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
        COALESCE(json_agg(ur.user_role) FILTER (WHERE ur.user_role IS NOT NULL), '[]') AS user_roles
      FROM users u
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      GROUP BY u.id, u.user_id, u.name, u.email, u.phone_number, u.created_at
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
    const { name, phone_number, user_category } = req.body;

    await sql`
      UPDATE users SET
        name = ${name},
        phone_number = ${phone_number},
        user_category = ${user_category}
      WHERE user_id = ${user_id}
    `;

    res.status(200).json({ message: "User updated successfully" });

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

    await sql`DELETE FROM user_roles WHERE user_id = ${user_id}`;
    await sql`DELETE FROM users WHERE user_id = ${user_id}`;

    res.status(200).json({ message: "User deleted successfully" });

  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
