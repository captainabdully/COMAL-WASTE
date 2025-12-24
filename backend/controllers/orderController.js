import orderService from '../services/orderService.js';

class OrderController {
  async createPickupOrder(req, res) {
    try {
      const { vendor_id, dropping_point_id, category, price, phone_number, quantity, comment, image } = req.body;

      if (!vendor_id || !dropping_point_id || !category || price === undefined || !phone_number || !quantity) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }

      await orderService.createPickupOrder(req.body);

      res.status(201).json({ message: "Pickup order created successfully" });
    } catch (error) {
      console.error("Error creating pickup order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getVendorOrders(req, res) {
    try {
      const { vendor_id } = req.params;

      if (!vendor_id) {
        return res.status(400).json({ message: "vendor_id is required" });
      }

      const orders = await orderService.getVendorOrders(vendor_id);

      res.status(200).json({ data: orders });
    } catch (error) {
      console.error("Error fetching pickup orders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllOrders(req, res) {
    try {
      const orders = await orderService.getAllOrders();

      res.status(200).json({
        message: "Pickup orders fetched successfully",
        data: orders
      });
    } catch (error) {
      console.error("Error fetching pickup orders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);

      if (!order) {
        return res.status(404).json({ message: "Pickup order not found" });
      }
      res.status(200).json({ data: order });
    } catch (error) {
      console.error("Error fetching pickup order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      let assigned_to = req.body.assigned_to || null;

      console.log('Update Status Request:', { id, status, body: req.body, user: req.user });

      // If assigning/accepting and no assignee provided, assign to the current user (admin/manager)
      if (!assigned_to && req.user && req.user.user_id) {
        assigned_to = req.user.user_id;
      }

      console.log('Assigned To:', assigned_to);

      const updated = await orderService.updateOrderStatus(id, status, assigned_to);

      if (!updated) {
        return res.status(404).json({ message: "Pickup order not found" });
      }

      res.status(200).json({
        message: "Pickup order updated successfully",
        data: updated
      });
    } catch (error) {
      console.error("Error updating pickup order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async recordOrderCompletion(req, res) {
    try {
      const { order_id, completed_by, completion_notes } = req.body;

      if (!order_id || !completed_by) {
        return res.status(400).json({ message: "Order ID and completed_by are required" });
      }

      await orderService.recordOrderCompletion(req.body);

      res.status(201).json({ message: "Order completion recorded successfully" });
    } catch (error) {
      console.error("Error recording order completion:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getOrderHistory(req, res) {
    try {
      const { vendor_id, status, start_date, end_date, dropping_point_id } = req.query;

      const data = await orderService.getOrderHistory({
        vendor_id,
        status,
        start_date,
        end_date,
        dropping_point_id
      });

      res.status(200).json({
        message: "Order history fetched successfully",
        data
      });

    } catch (error) {
      console.error("Error fetching order history:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

}


export default new OrderController();