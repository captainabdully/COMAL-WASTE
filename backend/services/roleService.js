import { sql } from '../config/db.js';

class RoleService {
  async assertRoleExists(role) {
    const found = await sql`SELECT 1 FROM roles WHERE name = ${role}`;
    if (!found.length) throw new Error('Invalid role. Create it under Roles first.');
  }

  async createUserRole(user_id, role) {
    await this.assertRoleExists(role);

    const result = await sql`
      INSERT INTO user_roles (user_id, user_role)
      VALUES (${user_id}, ${role})
      RETURNING *
    `;
    
    
    return result[0];
  }

  async getAllRoles() {
    return await sql`SELECT * FROM user_roles ORDER BY id DESC`;
  }

  async updateUserRole(user_id, role) {
    await this.assertRoleExists(role);

    const updated = await sql`
      UPDATE user_roles
      SET user_role = ${role}
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
