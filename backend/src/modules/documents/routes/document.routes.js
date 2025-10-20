import express from "express";
const router = express.Router();
import multer from "multer";
import { uploadDocument, simplifyDocument, getStats, generateGlossary, exportReports, exportGlossary, exportDocumentsToXlsx } from "../../controller/document.controller.js";
import { authenticateToken, authorizeRole, requireVerified } from "../../../middleware/auth.js";


// Multer ulter for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or DOCX files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});


router.post("/upload", authenticateToken, upload.single('file'), uploadDocument); // pdf-kit, multer
router.post("/simplify", authenticateToken, simplifyDocument); // LLM
router.get("/stats", authenticateToken, authorizeRole(['admin, personnel']), requireVerified, getStats);
router.get("/export", authenticateToken, authorizeRole(['admin, personnel']), requireVerified, exportReports); //Medical Report
router.get("/glossary", authenticateToken, generateGlossary);
router.get("/glossary/export", authenticateToken, authorizeRole(['admin, personnel']), requireVerified, exportGlossary);
router.get("/export-xlsx", authenticateToken, authorizeRole(['admin, personnel']), requireVerified, exportDocumentsToXlsx);

export default router;