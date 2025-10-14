import express from "express";
const router = express.Router();
import multer from "multer";
import { uploadDocument, simplifyDocument, getStats, generateGlossary, exportReports, exportGlossary } from "../../controller/document.controller.js";
import { authenticateToken, authorizeRole } from "../../../middleware/auth.js";


// Multer ulter for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});


router.post("/upload", authenticateToken, upload.single('pdfFile'), uploadDocument);
router.post("/simplify", authenticateToken, simplifyDocument);
router.get("/stats", authenticateToken, authorizeRole(['admin']), getStats);
router.get("/export", authenticateToken, authorizeRole(['admin']), exportReports);
router.get("/glossary", authenticateToken, generateGlossary);
router.get("/glossary/export", authenticateToken, authorizeRole(['admin']), exportGlossary);

export default router;