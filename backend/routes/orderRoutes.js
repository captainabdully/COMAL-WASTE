import express from 'express';
import orderController from '../controllers/orderController.js';
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.post('/', authMiddleware, requirePermission("orders.create"), orderController.createPickupOrder);
router.get('/', authMiddleware, requirePermission("orders.view_all"), orderController.getAllOrders);
// Static paths must be registered before '/:vendor_id' or they are swallowed by it.
router.get('/history/', authMiddleware, requirePermission("orders.view_all"), orderController.getOrderHistory);
router.get('/:vendor_id', authMiddleware, requirePermission("orders.view_own", "orders.view_all"), orderController.getVendorOrders);
router.put('/:id/status', authMiddleware, requirePermission("orders.manage"), orderController.updateOrderStatus);
router.post('/:id/cancel', authMiddleware, requirePermission("orders.cancel_own"), orderController.cancelOwnOrder);
router.post('/completion', authMiddleware, requirePermission("orders.manage"), orderController.recordOrderCompletion);
router.get('/order/:id', authMiddleware, requirePermission("orders.view_own", "orders.view_all"), orderController.getOrderById);

export default router;

//GET http://localhost:5001/api/pickup-order/history?status=completed
//GET http://localhost:5001/api/pickup-order/history?status=completed
//GET http://localhost:5001/api/pickup-order/history?dropping_point_id=4
//GET http://localhost:5001/api/pickup-order/history?start_date=2025-02-01&end_date=2025-02-15
