import express from "express";
import authController from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { login } from "../controllers/authController.js";
import { authLimiter, passwordRecoveryLimiter } from "../middleware/rateLimiter.js";


const router = express.Router();

router.post("/login", authLimiter, login);
router.post("/refresh-token", authLimiter, authController.refreshToken);
router.get(
  "/admin-only",
  authMiddleware,
  authorizeRoles("admin")
//   authController.adminPage
);

router.get(
  "/manager-or-admin",
  authMiddleware,
  authorizeRoles("admin", "manager")
//   authController.somePage
);

router.get(
  "/vendor",
  authMiddleware,
  authorizeRoles("vendor")
//   authController.vendorPage
);

// router.post("/login", login);
router.post("/forgot-password", passwordRecoveryLimiter, authController.forgotPassword);
router.post("/reset-password", passwordRecoveryLimiter, authController.resetPassword);
router.post("/test-email", authMiddleware, authorizeRoles("admin"), authController.testEmail);

export default router;
