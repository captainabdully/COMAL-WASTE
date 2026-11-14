import express from 'express';
import droppingPointController from '../controllers/droppingPointController.js';
// import { isAdmin } from '../middleware/isAdmin.js';
// import { verifyToken } from '../middleware/verifyToken.js';
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// router.post('/', isAdmin, droppingPointController.createDroppingPoint);
router.post("/dropping-point", authMiddleware, requirePermission("dropping_points.manage"), droppingPointController.createDroppingPoint);
router.get("/", droppingPointController.getAllDroppingPoints);
router.get("/:id", authMiddleware, requirePermission("dropping_points.manage"), droppingPointController.getDroppingPointById);
router.put("/:id",  authMiddleware, requirePermission("dropping_points.manage"), droppingPointController.updateDroppingPoint);
router.delete("/:id", authMiddleware, requirePermission("dropping_points.manage"), droppingPointController.deleteDroppingPoint);


export default router;