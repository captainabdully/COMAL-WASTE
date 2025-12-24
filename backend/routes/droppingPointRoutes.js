import express from 'express';
import droppingPointController from '../controllers/droppingPointController.js';
// import { isAdmin } from '../middleware/isAdmin.js';
// import { verifyToken } from '../middleware/verifyToken.js';
import { authMiddleware } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// router.post('/', isAdmin, droppingPointController.createDroppingPoint);
router.post("/dropping-point", authMiddleware, allowRoles("admin", "manager"), droppingPointController.createDroppingPoint);
router.get("/", droppingPointController.getAllDroppingPoints);
router.get("/:id", authMiddleware, allowRoles("admin", "manager"), droppingPointController.getDroppingPointById);
router.put("/:id",  authMiddleware, allowRoles("admin", "manager"), droppingPointController.updateDroppingPoint);
router.delete("/:id", authMiddleware, allowRoles("admin", "manager"), droppingPointController.deleteDroppingPoint);


export default router;