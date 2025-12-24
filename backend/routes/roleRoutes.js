import express from 'express';
import roleController from '../controllers/roleController.js';
import { authMiddleware } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post('/', authMiddleware, allowRoles("admin"), roleController.createUserRole);
router.get('/', authMiddleware, allowRoles("admin"), roleController.getAllRoles);
router.put('/:user_id', authMiddleware, allowRoles("admin"), roleController.updateUserRole);
router.delete('/:user_id', authMiddleware, allowRoles("admin"), roleController.deleteUserRole);

export default router;