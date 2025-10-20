import express from "express";
import { simplifyMedicalText } from "../llmservice.js"; // note the capital S in llmService.js

const router = express.Router();

/**
 * POST /api/llm/simplify
 * Body: { text: "medical text" }
 * Returns: { simplified: "simplified text" }
 */
router.post("/simplify", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    // Call LLM service (which also logs terms to Excel)
    const simplified = await simplifyMedicalText(text);
    res.json({ simplified });
  } catch (err) {
    console.error("LLM Route Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
