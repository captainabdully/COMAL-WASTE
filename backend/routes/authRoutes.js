import express from "express";
import authController from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { login } from "../controllers/authController.js";


const router = express.Router();

router.post("/login", login);
router.post("/refresh-token", authController.refreshToken);
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


export default router;
