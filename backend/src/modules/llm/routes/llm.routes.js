import express from "express";
import { simplifyMedicalText } from "../llmservice.js";

const router = express.Router();

router.post("/simplify", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    const simplified = await simplifyMedicalText(text);
    res.json({ simplified });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
