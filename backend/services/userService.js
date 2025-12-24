

import { sql } from "../config/db.js";
import bcrypt from "bcrypt";

class UserService {
  async createUser(data) {
    const hashed = await bcrypt.hash(data.password, 10);

    const [result] = await sql`
      INSERT INTO users (name, email, password, user_category, user_role)
       VALUES (${data.name}, ${data.email}, ${hashed}, ${data.user_category}, ${data.user_role})
    `;

    return { user_id: result.insertId, ...data, password: undefined };
  }

  async getAllUsers() {
    const [rows] = await sql`SELECT * FROM users`;
    return rows;
  }

  async getUserById(user_id) {
    const [rows] = await sql`
      SELECT * FROM users WHERE id = ${user_id}
    `;
    return rows[0];
  }

  async updateUser(id, data) {
    await sql`
      UPDATE users
      SET name = ${data.name}, email = ${data.email}, user_category = ${data.user_category}, role = ${data.role}
      WHERE id = ${id}
    `;
    return this.getUserById(id);
  }

  async deleteUser(id) {
    return sql`DELETE FROM users WHERE id = ${id}`;
  }

  async getUserWithRoles(user_id) {
    const [rows] = await sql`
      SELECT users.*, user_role.role_category
       FROM users 
       LEFT JOIN user_role ON users.id = user_role.user_id
       WHERE users.id = ${user_id}
    `;
    return rows;
  }


  async login(email, password) {
    const [rows] = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;  
    const user = rows[0];
    if (!user) return null;
    const match = await bcrypt.compare(password, user.password);  
    if (!match) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      user_role: user.user_role,
      user_category: user.user_category
    };
  }
}

export default new UserService();