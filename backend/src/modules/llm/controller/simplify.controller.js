import { simplifyMedicalText } from "../llmservice.js";
import Simplification from "../models/Simplify.model.js";
import Analytics from "../models/analytics.model.js";
import fs from "fs/promises";
import path from "path";
import logger from "../../../utils/logger.js";
import { v4 as uuidv4 } from "uuid";
import PDFParser from "pdf2json";
import mammoth from "mammoth";

const historyFile = path.join(process.cwd(), "kpi", "dataanalytics", "history.json");

// Stop words to filter out junk
const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
  "is", "was", "are", "been", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "must", "can", "i", "you", "he",
  "she", "it", "we", "they", "this", "that", "these", "those", "there", "here",
  "now", "then", "ago", "patient", "has", "began", "that", "7", "days", "sputum"
]);

// Fallback medical term extraction
function extractFallbackTerms(text) {
  const terms = new Set();
  const patterns = [
    /\b(dry cough|wet cough|cough|fever|fatigue|sore throat|chest pain|shortness of breath|wheezing|dizziness|nausea|vomiting|diarrhea|headache|body aches)\b/gi,
    /\b(myocardial infarction|heart attack|stroke|hypertension|diabetes|asthma|bronchitis|pneumonia|tuberculosis|COVID-19|COPD|angina|arrhythmia)\b/gi,
    /\b(paracetamol|ibuprofen|amoxicillin|metformin|insulin|lisinopril|atorvastatin|omeprazole|salbutamol)\b/gi,
    /\b(sputum|edema|inflammation|infection|blood pressure|heart rate|respiratory rate|temperature)\b/gi,
  ];
  patterns.forEach(p => {
    let m;
    while ((m = p.exec(text))) {
      const clean = m[0].toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (!STOP_WORDS.has(clean)) terms.add(clean);
    }
  });
  return [...terms];
}

function isLikelyMisunderstood(term) {
  return term.length > 10 ? 1 : 0;
}

function hasUsageInstructions(term) {
  return /take|dose|daily|twice|three times|morning|night|with food|empty stomach|mg|tablet|capsule|ml|injection|as needed/i.test(term) ? 1 : 0;
}

// ======================================================
// Simplify Text Controller
// ======================================================
export const simplifyText = async (req, res) => {
  console.log(`[Start] simplifyText called at ${new Date().toISOString()}`);
  const userId = req.user?.id;
  const isGuest = !userId;
  const identifier = userId || `guest_${uuidv4()}_${req.ip.replace(/\./g, "_")}`;

  let inputText = req.body.text || "";
  let effectiveInputType = req.body.inputType || "text";

  // -------------------------------
  // Handle Uploaded File
  // -------------------------------
  if (req.file) {
    console.log("Received file:", req.file.originalname);
    effectiveInputType = req.file.mimetype === "application/pdf" ? "pdf" : "doc";

    try {
      const filePath = req.file.path;
      await fs.access(filePath);

      if (effectiveInputType === "pdf") {
        const dataBuffer = await fs.readFile(filePath);
        const pdfData = await new Promise((resolve, reject) => {
          const pdfParser = new PDFParser();
          pdfParser.on("pdfParser_dataError", reject);
          pdfParser.on("pdfParser_dataReady", (pdfData) => {
            const text = pdfData.Pages.map(page =>
              page.Texts.map(t => t.R[0].T).join(" ")
            ).join(" ");
            resolve({ text: decodeURIComponent(text.trim()) });
          });
          pdfParser.parseBuffer(dataBuffer);
        });
        inputText = pdfData.text.trim().replace(/\s(?=[a-zA-Z])/g, "");
      } else if (effectiveInputType === "doc") {
        const result = await mammoth.extractRawText({ path: filePath });
        inputText = result.value.trim();
      }

      console.log(`Extracted text (${effectiveInputType}):`, inputText.substring(0, 120));
    } catch (err) {
      logger.error("File processing error", { error: err.message });
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(500).json({ error: `Failed to process ${req.file.originalname}: ${err.message}` });
    }
  } else if (!inputText) {
    return res.status(400).json({ error: "Text or file is required" });
  }

  // -------------------------------
  // Simplification
  // -------------------------------
  try {
    const simplifyStart = Date.now();
    const simplified = await simplifyMedicalText(inputText);
    console.log(`Simplified in ${Date.now() - simplifyStart}ms`);

    res.json({ simplified });

    if (simplified.trim() === "Its not medical related") {
      logger.info("Non-medical content detected", { identifier });
      return;
    }

    // -------------------------------
    // Compute simpScore
    // -------------------------------
    const originalLen = inputText.split(/\s+/).length;
    const simplifiedLen = simplified.split(/\s+/).length;
    const simpScore = Math.min(10, Math.max(0, 10 * (1 - simplifiedLen / originalLen)));

    console.log(
      `simpScore computed: ${simpScore.toFixed(2)} (original ${originalLen} → simplified ${simplifiedLen})`
    );

    // -------------------------------
    // Save Simplification Record
    // -------------------------------
    try {
      const simplification = new Simplification({
        userId: identifier,
        isGuest,
        inputType: effectiveInputType,
        originalText: inputText,
        simplifiedText: simplified,
        simpScore,
        createdAt: new Date(),
      });
      await simplification.save();
    } catch (mongoErr) {
      logger.warn("MongoDB save failed, fallback to JSON", { error: mongoErr.message });
      let history = [];
      try {
        history = JSON.parse(await fs.readFile(historyFile, "utf8"));
      } catch {
        history = [];
      }
      history.push({
        userId: identifier,
        isGuest,
        inputType: effectiveInputType,
        originalText: inputText,
        simplifiedText: simplified,
        simpScore,
        timestamp: new Date().toISOString(),
      });
      await fs.writeFile(historyFile, JSON.stringify(history, null, 2));
    }

    // -------------------------------
    // Analytics Tracking (FILTERED: only medical terms)
    // -------------------------------
    try {
      // Extract [[term]] from LLM output
      const bracketed = new Set();
      const bracketRE = /\[\[([^\]]+)\]\]/g;
      let m;
      while ((m = bracketRE.exec(simplified))) {
        const term = m[1].trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
        if (term && !STOP_WORDS.has(term) && term.length > 2) bracketed.add(term);
      }

      // Fallback: high-value medical terms from original input
      let finalTerms = [...bracketed];
      if (finalTerms.length === 0) {
        finalTerms = extractFallbackTerms(inputText);
      }

      for (const term of finalTerms) {
        const existing = await Analytics.findOne({ term });

        if (existing) {
          existing.usagecount += 1;
          existing.simpScore = simpScore;
          existing.timestamp = new Date();
          await existing.save();
        } else {
          await Analytics.create({
            term,
            simpScore,
            misunderstood: isLikelyMisunderstood(term) ? 1 : 0,
            usageInstr: hasUsageInstructions(term) ? 1 : 0,
          });
        }
      }
      console.log(`Analytics updated (${finalTerms.length} medical terms saved)`);
    } catch (analyticErr) {
      logger.error("Analytics update failed", { error: analyticErr.message });
    }

    if (req.file) await fs.unlink(req.file.path).catch(() => {});
  } catch (err) {
    logger.error("Simplification error", { error: err.message });
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    return res.status(500).json({ error: err.message });
  }

  console.log(`[End] simplifyText completed`);
};

// ======================================================
// Get History
// ======================================================
export const getHistory = async (req, res) => {
  console.log(`[Start] getHistory`);
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ error: "Authentication required" });

  try {
    const history = await Simplification.find({ userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    logger.warn("MongoDB fetch failed, fallback JSON", { error: err.message });
    try {
      const data = JSON.parse(await fs.readFile(historyFile, "utf8"));
      const userHistory = data
        .filter((entry) => entry.userId === userId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      res.json(userHistory);
    } catch {
      res.json([]);
    }
  }
};

// ======================================================
// Get Report (Analytics Dashboard) - WITH ALL FIELDS
// ======================================================
export const getReport = async (req, res) => {
  console.log("[Start] getReport");

  try {
    const totalSimplifications = await Simplification.countDocuments();
    const uniqueUsers = await Simplification.distinct("userId");
    const totalUniqueUsers = uniqueUsers.length;

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const activeUsers = await Simplification.distinct("userId", {
      createdAt: { $gte: lastWeek },
    });
    const activeUserCount = activeUsers.length;

    const averageSimpScoreData = await Simplification.aggregate([
      { $group: { _id: null, avgScore: { $avg: "$simpScore" } } },
    ]);
    const averageSimpScore = averageSimpScoreData[0]?.avgScore || 0;

    // Get document type counts
    const documentCounts = await Simplification.aggregate([
      { $group: { _id: "$inputType", count: { $sum: 1 } } }
    ]);
    
    const docCounts = {
      pdf: documentCounts.find(d => d._id === 'pdf')?.count || 0,
      docx: documentCounts.find(d => d._id === 'doc')?.count || 0,
      text: documentCounts.find(d => d._id === 'text')?.count || 0,
    };

    // Get top misunderstood terms with ALL fields
    const topMisunderstood = await Analytics.find()
      .sort({ misunderstood: -1 })
      .limit(20)
      .select('term usagecount simpScore misunderstood usageInstr timestamp')
      .lean();

    const recentSimplifications = await Simplification.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Structure to match frontend expectations
    const reportData = {
      totalQueries: totalSimplifications,
      activeUsers: activeUserCount,
      summary: {
        totalSimplifications,
        totalUniqueUsers,
        activeUserCount,
        averageSimpScore: Number(averageSimpScore.toFixed(2)),
      },
      documentCounts: docCounts,
      topMisunderstood: topMisunderstood.map(t => ({ 
        term: t.term,
        usagecount: t.usagecount || 0,
        simpScore: t.simpScore || 0,
        misunderstood: t.misunderstood || 0,
        usageInstr: t.usageInstr || 0,
        timestamp: t.timestamp,
      })),
      recentSimplifications,
    };

    console.log("[getReport completed]");
    console.log("Sending report with fields:", Object.keys(reportData.topMisunderstood[0] || {}));

    return res.status(200).json(reportData);
  } catch (err) {
    console.error("getReport error:", err);
    return res.status(500).json({ error: "Failed to generate report", details: err.message });
  }
};