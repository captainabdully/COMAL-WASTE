import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { listRoles, createRole, updateRole, deleteRole } from '../controllers/rbacController.js';

const router = express.Router();

// Reading roles is needed by the user form, so user managers may read; only roles.manage may change them.
router.get('/', authMiddleware, requirePermission('roles.manage', 'users.manage', 'users.view'), listRoles);
router.post('/', authMiddleware, requirePermission('roles.manage'), createRole);
router.put('/:name', authMiddleware, requirePermission('roles.manage'), updateRole);
router.delete('/:name', authMiddleware, requirePermission('roles.manage'), deleteRole);

export default router;
