import express from "express";
import { createAdminSetup } from "../controllers/userController.js";

const router = express.Router();

// Allow creating first admin without token
router.post("/admin", createAdminSetup);

export default router;
