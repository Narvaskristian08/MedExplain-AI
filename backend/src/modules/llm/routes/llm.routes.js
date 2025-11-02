import express from "express";
import { authenticateToken } from "../../../middleware/auth.js";
import { optionalAuth } from "../../../middleware/optionalAuth.js";
import { authorizeRole } from "../../../middleware/auth.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  simplifyText,
  getHistory,
  getReport,
} from "../controller/Simplify.controller.js";
import Analytics from "../models/analytics.model.js";

const router = express.Router();

/* ----------  UPLOADS  ---------- */
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

/* ----------  ROUTES  ---------- */
router.post(
  "/simplify",
  optionalAuth,  // This should set req.user if token exists
  upload.single("file"),
  simplifyText
);

router.get("/history", authenticateToken, getHistory);

router.get("/report", getReport);

router.delete(
  "/analytics/:term",
  authenticateToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    try {
      const { term } = req.params;
      const result = await Analytics.deleteOne({ term });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Term not found" });
      }

      res.json({ message: "Term deleted successfully" });
    } catch (err) {
      console.error("Delete term error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;