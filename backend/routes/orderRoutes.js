import express from 'express';
import orderController from '../controllers/orderController.js';
import { authMiddleware } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post('/', authMiddleware, allowRoles("vendor"), orderController.createPickupOrder);
router.get('/', authMiddleware, allowRoles("admin", "manager"), orderController.getAllOrders);
router.get('/:vendor_id', authMiddleware, allowRoles("admin", "manager", "vendor"), orderController.getVendorOrders);
router.put('/:id/status', authMiddleware, allowRoles("admin", "manager", "vendor"), orderController.updateOrderStatus);
router.post('/completion', authMiddleware, allowRoles("admin", "manager", "vendor"), orderController.recordOrderCompletion);
router.get('/order/:id', authMiddleware, allowRoles("admin", "manager", "vendor"), orderController.getOrderById);
router.get('/history/', authMiddleware, allowRoles("admin", "manager"), orderController.getOrderHistory);

export default router;

//GET http://localhost:5001/api/pickup-order/history?status=completed
//GET http://localhost:5001/api/pickup-order/history?status=completed
//GET http://localhost:5001/api/pickup-order/history?dropping_point_id=4
//GET http://localhost:5001/api/pickup-order/history?start_date=2025-02-01&end_date=2025-02-15
