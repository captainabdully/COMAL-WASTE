import express from 'express';
import priceController from '../controllers/priceController.js';
import { authMiddleware } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post('/', authMiddleware, allowRoles("admin", "manager"), priceController.createDailyPrice);
router.get('/today', priceController.getAllTodayPrices);
router.get('/today/:dropping_point_id', authMiddleware, allowRoles("admin", "manager"), priceController.getTodayPricesByDroppingPoint);
router.get('/history', authMiddleware, allowRoles("admin", "manager"), priceController.getAllPreviousPrices);
router.get('/history/:location_id', authMiddleware, allowRoles("admin", "manager"), priceController.getPreviousPricesByLocation);
router.get("/sort/category", authMiddleware, allowRoles("admin", "manager"), priceController.sortByCategory);
router.get("/filter/date-range",  authMiddleware, allowRoles("admin", "manager"), priceController.filterByDateRange);
router.get("/last-7-days", authMiddleware, allowRoles("admin", "manager"), priceController.last7Days);
router.get("/last-30-days", authMiddleware, allowRoles("admin", "manager"), priceController.last30Days);
router.get("/group-by-date", authMiddleware, allowRoles("admin", "manager"), priceController.groupByDate);

export default router;

//GET http://localhost:5001/api/daily-price/sort/category
//Example GET http://localhost:5001/api/daily-price/filter/date-range?start_date=2025-01-01&end_date=2025-01-31
//GET http://localhost:5001/api/daily-price/last-7-days
//GET http://localhost:5001/api/daily-price/last-30-days
//GET http://localhost:5001/api/daily-price/group-by-date