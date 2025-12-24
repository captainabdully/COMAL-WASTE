import { sql } from '../config/db.js';

class DroppingPointService {
  createDroppingPoint(location_name, address, created_by) {
  return sql`
    INSERT INTO dropping_point (location_name, address, created_by)
    VALUES (${location_name}, ${address}, ${created_by})
    RETURNING *
  `;
}


  async getAllDroppingPoints() {
    return await sql`
      SELECT dp.*, u.name as created_by_name
      FROM dropping_point dp
      LEFT JOIN users u ON dp.created_by = u.user_id
      ORDER BY dp.id DESC
    `;
  }

  async getDroppingPointById(id) {
    const points = await sql`SELECT * FROM dropping_point WHERE id = ${id}`;
    return points[0];
  }

  async updateDroppingPoint(id, location_name) {
    const updated = await sql`
      UPDATE dropping_point
      SET location_name = ${location_name}
      WHERE id = ${id}
      RETURNING *
    `;
    
    return updated[0];
  }

  async deleteDroppingPoint(id) {
    const removed = await sql`
      DELETE FROM dropping_point
      WHERE id = ${id}
      RETURNING *
    `;
    
    return removed[0];
  }
}

export default new DroppingPointService();