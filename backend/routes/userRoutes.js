
import express from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  // getUserWithRoles,
  createAdminSetup,
  adminCreateUser,
  setUserRoles,
  setUserStatus,
  resetUserPassword
} from '../controllers/userController.js';
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";
import { login, changePassword } from '../controllers/authController.js';

const router = express.Router();

// Admin setup (run only once)
router.post("/setup/admin", createAdminSetup);
router.post("/login", login);

// PROTECTED USER ROUTES
router.post("/", createUser); // public self-registration: always a vendor
router.post("/admin-create", authMiddleware, requirePermission("users.manage"), adminCreateUser);
router.get("/", authMiddleware, requirePermission("users.view", "users.manage"), getAllUsers);
router.get("/:user_id", authMiddleware, requirePermission(), getUserById);
// users.manage may edit anyone; other users may edit only themselves (enforced in the controller).
router.put("/:user_id", authMiddleware, requirePermission(), updateUser);
router.put("/:user_id/roles", authMiddleware, requirePermission("users.manage"), setUserRoles);
router.put("/:user_id/status", authMiddleware, requirePermission("users.manage"), setUserStatus);
router.post("/:user_id/reset-password", authMiddleware, requirePermission("users.manage"), resetUserPassword);
router.delete("/:user_id", authMiddleware, requirePermission("users.manage"), deleteUser);
router.post("/:user_id/change-password", authMiddleware, requirePermission(), changePassword);

export default router;
