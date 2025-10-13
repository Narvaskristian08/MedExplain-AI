import { Router } from "express";
import { uploadDocument, simplifyDocument, getStats, generateGlossary, exportReports } from "../../controller/document.controller.js";
import { authenticateToken, authorizeRole } from "../../../middleware/auth.js";

const router = Router();
router.post("/upload", authenticateToken, uploadDocument);
router.post("/simplify", authenticateToken, simplifyDocument);
router.get("/stats", authenticateToken, authorizeRole(['admin']), getStats);
router.get("/glossary", authenticateToken, authorizeRole(['admin']), generateGlossary);
router.get("/export", authenticateToken, authorizeRole(['admin']), exportReports);

export default router;