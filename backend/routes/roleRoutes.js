import express from 'express';
import roleController from '../controllers/roleController.js';
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.post('/', authMiddleware, requirePermission("roles.manage"), roleController.createUserRole);
router.get('/', authMiddleware, requirePermission("roles.manage"), roleController.getAllRoles);
router.put('/:user_id', authMiddleware, requirePermission("roles.manage"), roleController.updateUserRole);
router.delete('/:user_id', authMiddleware, requirePermission("roles.manage"), roleController.deleteUserRole);

export default router;