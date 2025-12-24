import { sql } from '../config/db.js';

class RoleService {
  async createUserRole(user_id, role) {
    const validRoles = ['vendor', 'manager', 'admin'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role. Must be: vendor, manager, or admin');
    }

    const result = await sql`
      INSERT INTO user_roles (user_id, role) 
      VALUES (${user_id}, ${role})
      RETURNING *
    `;
    
    
    return result[0];
  }

  async getAllRoles() {
    return await sql`SELECT * FROM user_roles ORDER BY id DESC`;
  }

  async updateUserRole(user_id, role) {
    const validRoles = ["vendor", "manager", "admin"];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role. Must be: vendor, manager, or admin');
    }

    const updated = await sql`
      UPDATE user_roles
      SET role = ${role}
      WHERE user_id = ${user_id}
      RETURNING *
    `;
    
    return updated[0];
  }

  async deleteUserRole(user_id) {
    const deleted = await sql`
      DELETE FROM user_roles
      WHERE user_id = ${user_id}
      RETURNING *
    `;
    
    return deleted[0];
  }
}

export default new RoleService();