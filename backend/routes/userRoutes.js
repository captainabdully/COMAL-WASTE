
import express from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  // getUserWithRoles,
  createAdminSetup
} from '../controllers/userController.js';
import { authMiddleware } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { login, changePassword } from '../controllers/authController.js';

const router = express.Router();

// Admin setup (run only once)
router.post("/setup/admin", createAdminSetup);
router.post("/login", login);

// PROTECTED USER ROUTES
router.post("/", createUser);
router.get("/", authMiddleware, allowRoles("admin", "manager"), getAllUsers);
router.get("/:user_id", authMiddleware, getUserById);
router.put("/:user_id", authMiddleware, allowRoles("admin"), updateUser);
router.delete("/:user_id", authMiddleware, allowRoles("admin"), deleteUser);
router.post("/:user_id/change-password", authMiddleware, changePassword);
// router.get("/:user_id/with-roles", authMiddleware, getUserWithRoles);

export default router;
