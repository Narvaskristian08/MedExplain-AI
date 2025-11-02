// src/routes/admin.routes.js
import { Router } from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { getAdminStats } from "../controller/admin.controller.js";

const router = Router();

// Protect all admin routes
router.use(authenticateToken, authorizeRole(["admin"]));

router.get("/stats", getAdminStats);

export default router;