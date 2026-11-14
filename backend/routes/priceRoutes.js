import express from 'express';
import priceController from '../controllers/priceController.js';
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.post('/', authMiddleware, requirePermission("prices.manage"), priceController.createDailyPrice);
router.get('/today', priceController.getAllTodayPrices);
router.get('/today/:dropping_point_id', authMiddleware, requirePermission("prices.manage"), priceController.getTodayPricesByDroppingPoint);
router.get('/history', authMiddleware, requirePermission("prices.manage"), priceController.getAllPreviousPrices);
router.get('/history/:location_id', authMiddleware, requirePermission("prices.manage"), priceController.getPreviousPricesByLocation);
router.get("/sort/category", authMiddleware, requirePermission("prices.manage"), priceController.sortByCategory);
router.get("/filter/date-range",  authMiddleware, requirePermission("prices.manage"), priceController.filterByDateRange);
router.get("/last-7-days", authMiddleware, requirePermission("prices.manage"), priceController.last7Days);
router.get("/last-30-days", authMiddleware, requirePermission("prices.manage"), priceController.last30Days);
router.get("/group-by-date", authMiddleware, requirePermission("prices.manage"), priceController.groupByDate);
router.delete("/:id", authMiddleware, requirePermission("prices.manage"), priceController.deletePrice);

export default router;

//GET http://localhost:5001/api/daily-price/sort/category
//Example GET http://localhost:5001/api/daily-price/filter/date-range?start_date=2025-01-01&end_date=2025-01-31
//GET http://localhost:5001/api/daily-price/last-7-days
//GET http://localhost:5001/api/daily-price/last-30-days
//GET http://localhost:5001/api/daily-price/group-by-date