import express from "express";
import { authenticateToken } from "../../../middleware/auth.js";
import { getAnalyticsOverview, getTermTrends } from "../controller/Analytics.controller.js";

const router = express.Router();

// 📊 Get aggregated analytics data (for dashboard)
router.get("/overview", authenticateToken, getAnalyticsOverview);

// 📈 Get term trends (for regression/trend visualization)
router.get("/trends", authenticateToken, getTermTrends);

export default router;
