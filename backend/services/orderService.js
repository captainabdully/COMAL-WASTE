import { sql } from '../config/db.js';

class OrderService {
  async createPickupOrder(orderData) {
    const { vendor_id, dropping_point_id, category, price, phone_number, quantity, comment, image } = orderData;
    
    const result = await sql`
      INSERT INTO pickup_order (vendor_id, dropping_point_id, category, price, phone_number, quantity, comment, image)
      VALUES (${vendor_id}, ${dropping_point_id}, ${category}, ${price}, ${phone_number}, ${quantity}, ${comment}, ${image})
      RETURNING *
    `;
    
    return result[0];
  }

  async getVendorOrders(vendor_id) {
    return await sql`
      SELECT po.*, dp.location_name, u.name as vendor_name
      FROM pickup_order po
      LEFT JOIN dropping_point dp ON po.dropping_point_id = dp.id
      LEFT JOIN users u ON po.vendor_id = u.user_id
      WHERE po.vendor_id = ${vendor_id}
      ORDER BY po.created_at DESC
    `;
  }

  async getAllOrders() {
    return await sql`
      SELECT 
        po.*, 
        dp.location_name,
        v.name as vendor_name,
        m.name as assigned_manager_name
      FROM pickup_order po
      LEFT JOIN dropping_point dp ON po.dropping_point_id = dp.id
      LEFT JOIN users v ON po.vendor_id = v.user_id
      LEFT JOIN users m ON po.assigned_to = m.user_id
      ORDER BY po.created_at DESC
    `;
  }

  async updateOrderStatus(id, status, assigned_to) {
    const updated = await sql`
      UPDATE pickup_order
      SET 
        status = ${status},
        assigned_to = ${assigned_to},
        completed_at = ${status === 'completed' ? new Date() : null}
      WHERE id = ${id}
      RETURNING *
    `;
    
    return updated[0];
  }

  async recordOrderCompletion(completionData) {
    const { order_id, completed_by, completion_notes } = completionData;
    
    const result = await sql`
      INSERT INTO order_completion (order_id, completed_by, completion_notes)
      VALUES (${order_id}, ${completed_by}, ${completion_notes})
      RETURNING *
    `;
    
    return result[0];
  }
  async getOrderById(id) {
    const order = await sql`
      SELECT 
        po.*, 
        dp.location_name,
        v.name as vendor_name,
        m.name as assigned_manager_name
      FROM pickup_order po
      LEFT JOIN dropping_point dp ON po.dropping_point_id = dp.id
      LEFT JOIN users v ON po.vendor_id = v.user_id
      LEFT JOIN users m ON po.assigned_to = m.user_id
      WHERE po.id = ${id}
    `;

    return order[0];
  }

async getOrderHistory({ vendor_id, status, start_date, end_date, dropping_point_id }) {
  return await sql`
    SELECT 
      o.*,
      dp.location_name,
      dp.address,
      u.name AS vendor_name
    FROM pickup_order o
    LEFT JOIN dropping_point dp ON dp.id = o.dropping_point_id
    LEFT JOIN users u ON u.user_id = o.vendor_id
    WHERE 
      (${vendor_id}::text IS NULL OR o.vendor_id = ${vendor_id}) AND
      (${status}::text IS NULL OR o.status = ${status}) AND
      (${dropping_point_id}::int IS NULL OR o.dropping_point_id = ${dropping_point_id}) AND
      (${start_date}::date IS NULL OR o.created_at::date >= ${start_date}) AND
      (${end_date}::date IS NULL OR o.created_at::date <= ${end_date})
    ORDER BY o.created_at DESC;
  `;
}
}

export default new OrderService();