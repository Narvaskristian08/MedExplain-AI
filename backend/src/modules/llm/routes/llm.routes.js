import express from "express";
import { authenticateToken } from "../../../middleware/auth.js";
import { optionalAuth } from "../../../middleware/optionalAuth.js"; // NEW
import multer from "multer";
import fs from "fs";
import path from "path";
import { simplifyText, getHistory, getReport } from "../controller/Simplify.controller.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory:", uploadsDir);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Routes
router.post(
  "/simplify",
  optionalAuth,           // Guests allowed
  upload.single("file"),
  simplifyText
);

router.get("/history", authenticateToken, getHistory);     // Login required
router.get("/report", authenticateToken, getReport);       // Login required

export default router;