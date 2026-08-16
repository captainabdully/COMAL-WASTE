import orderService from '../services/orderService.js';

class OrderController {
  async createPickupOrder(req, res) {
    try {
      const { dropping_point_id, category, phone_number, quantity, quantity_unit = "kg", comment, image } = req.body;

      if (!dropping_point_id || !category || !phone_number || !quantity) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }
      const parsedQuantity = Number(quantity);
      if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
        return res.status(400).json({ message: "Quantity must be greater than zero" });
      }
      if (!["kg", "tonne"].includes(quantity_unit)) {
        return res.status(400).json({ message: "Quantity unit must be kg or tonne" });
      }

      const unitPrice = await orderService.getCurrentPrice(dropping_point_id, category);
      if (unitPrice === null) {
        return res.status(400).json({ message: "No current price has been set for this dropping point and category" });
      }
      const quantityInKg = quantity_unit === "tonne" ? parsedQuantity * 1000 : parsedQuantity;
      const totalPrice = Number(unitPrice) * quantityInKg;

      await orderService.createPickupOrder({
        vendor_id: req.user.user_id,
        dropping_point_id,
        category,
        price: totalPrice,
        phone_number,
        quantity: parsedQuantity,
        quantity_unit,
        comment,
        image
      });

      res.status(201).json({ message: "Pickup order created successfully", price: totalPrice });
    } catch (error) {
      console.error("Error creating pickup order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getVendorOrders(req, res) {
    try {
      const { vendor_id } = req.params;

      const isPrivileged = req.user.roles?.some((role) => ["admin", "manager"].includes(role));
      if (!isPrivileged && req.user.user_id !== vendor_id) {
        return res.status(403).json({ message: "Forbidden: you can only view your own orders" });
      }

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

      const isPrivileged = req.user.roles?.some((role) => ["admin", "manager"].includes(role));
      if (!isPrivileged && order.vendor_id !== req.user.user_id) {
        return res.status(403).json({ message: "Forbidden: you can only view your own orders" });
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
      const { status, rejection_comment } = req.body;
      const allowedStatuses = new Set(["assigned", "completed", "cancelled"]);
      if (!allowedStatuses.has(status)) {
        return res.status(400).json({ message: "Invalid order status" });
      }
      if (status === "cancelled" && !rejection_comment?.trim()) {
        return res.status(400).json({ message: "A rejection comment is required when cancelling an order" });
      }
      let assigned_to = req.user.user_id;

      console.log('Update Status Request:', { id, status, body: req.body, user: req.user });

      // If assigning/accepting and no assignee provided, assign to the current user (admin/manager)
      if (!assigned_to && req.user && req.user.user_id) {
        assigned_to = req.user.user_id;
      }

      console.log('Assigned To:', assigned_to);

      const updated = await orderService.updateOrderStatus(
        id,
        status,
        assigned_to,
        status === "cancelled" ? rejection_comment.trim() : null,
        status === "cancelled" ? req.user.user_id : null
      );

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
      const { order_id, completion_notes } = req.body;

      if (!order_id) {
        return res.status(400).json({ message: "Order ID is required" });
      }

      await orderService.recordOrderCompletion({ order_id, completion_notes, completed_by: req.user.user_id });

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
