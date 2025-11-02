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
    const result = await simplifyMedicalText(inputText);
    console.log(`Simplified in ${Date.now() - simplifyStart}ms`);

    // Handle both old string format and new object format
    let simplified, simpScore, bracketedTerms;
    
    if (typeof result === 'object' && result !== null) {
      // New format: object with patientPlainText, terms, score
      simplified = result.patientPlainText || "";
      simpScore = result.score || 0;
      bracketedTerms = result.terms || [];
      
      // Send response immediately
      res.json({ 
        simplified,
        score: simpScore,
        termsFound: bracketedTerms.length
      });
    } else {
      // Old format: string
      simplified = result || "";
      
      // Send response immediately
      res.json({ simplified });
      
      // Calculate simpScore the old way
      const originalLen = inputText.split(/\s+/).length;
      const simplifiedLen = simplified.split(/\s+/).length;
      simpScore = Math.min(10, Math.max(0, 10 * (1 - simplifiedLen / originalLen)));
      
      bracketedTerms = [];
    }

    // Check for non-medical content
    if (simplified.includes("does not appear to be medical-related") || 
        simplified.trim() === "Its not medical related") {
      logger.info("Non-medical content detected", { identifier });
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      return;
    }

    console.log(`simpScore: ${simpScore.toFixed(2)}`);

    // -------------------------------
    // Save Simplification Record (async, after response sent)
    // -------------------------------
    setImmediate(async () => {
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
      // Analytics Tracking
      // -------------------------------
      try {
        // If we have bracketedTerms from new format, use them
        let finalTerms = bracketedTerms;
        
        // Otherwise extract from simplified text
        if (!finalTerms || finalTerms.length === 0) {
          const bracketedSet = new Set();
          const bracketRE = /\[\[([^\]]+)\]\]/g;
          let m;
          while ((m = bracketRE.exec(simplified))) {
            const term = m[1].trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
            if (term && !STOP_WORDS.has(term) && term.length > 2) bracketedSet.add(term);
          }
          
          finalTerms = [...bracketedSet];
          
          // Fallback to pattern detection
          if (finalTerms.length === 0) {
            finalTerms = extractFallbackTerms(inputText);
          }
        }

        for (const term of finalTerms) {
          const existing = await Analytics.findOne({ term });

          if (existing) {
            existing.usagecount += 1;
            existing.simpScore = simpScore;
            existing.timestamp = new Date();
            existing.misunderstood += 1;
            await existing.save();
          } else {
            await Analytics.create({
              term,
              simpScore,
              usagecount: 1,
              misunderstood: 1,
              usageInstr: hasUsageInstructions(term) ? 1 : 0,
              timestamp: new Date(),
            });
          }
        }
        console.log(`Analytics updated (${finalTerms.length} terms)`);
      } catch (analyticErr) {
        logger.error("Analytics update failed", { error: analyticErr.message });
      }

      if (req.file) await fs.unlink(req.file.path).catch(() => {});
    });

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
  const userId = req.user?.id;
  const isAdmin = req.user?.role === "admin";

  if (!userId) return res.status(401).json({ error: "Authentication required" });

  try {
    const query = isAdmin ? {} : { userId };
    const history = await Simplification.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const activity = history.map(entry => {
      const base = {
        user: entry.isGuest ? `Guest (${entry.userId.slice(-6)})` : entry.userId,
        action:
          entry.inputType === "text" ? "Text Input" :
          entry.inputType === "pdf" ? "PDF Simplified" :
          entry.inputType === "doc" ? "DOCX Simplified" : "Simplified",
        document: entry.simplifiedText.substring(0, 35) + (entry.simplifiedText.length > 35 ? "..." : ""),
        time: new Date(entry.createdAt).toLocaleString("en-US", {
          hour: "2-digit", minute: "2-digit", hour12: true, day: "numeric", month: "short"
        }),
      };

      if (!isAdmin && entry.userId !== userId) return base;
      return { ...base, originalText: entry.originalText, simplifiedText: entry.simplifiedText };
    });

    res.json(activity);
  } catch (err) {
    logger.warn("MongoDB fetch failed, fallback JSON", { error: err.message });
    try {
      const data = JSON.parse(await fs.readFile(historyFile, "utf8"));
      const filtered = isAdmin ? data : data.filter(e => e.userId === userId);
      const userHistory = filtered
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10)
        .map(entry => {
          const base = {
            user: entry.isGuest ? `Guest (${entry.userId.slice(-6)})` : entry.userId,
            action:
              entry.inputType === "text" ? "Text Input" :
              entry.inputType === "pdf" ? "PDF Simplified" :
              entry.inputType === "doc" ? "DOCX Simplified" : "Simplified",
            document: entry.simplifiedText.substring(0, 35) + (entry.simplifiedText.length > 35 ? "..." : ""),
            time: new Date(entry.timestamp).toLocaleString("en-US", {
              hour: "2-digit", minute: "2-digit", hour12: true, day: "numeric", month: "short"
            }),
          };
          if (!isAdmin && entry.userId !== userId) return base;
          return { ...base, originalText: entry.originalText, simplifiedText: entry.simplifiedText };
        });
      res.json(userHistory);
    } catch {
      res.json([]);
    }
  }
};

// ======================================================
// Get Report (Analytics Dashboard)
// ======================================================
export const getReport = async (req, res) => {
  console.log("[Start] getReport");

  try {
    const totalQueries = await Simplification.countDocuments();

    // Fetch all tracked terms
    const allTerms = await Analytics.find()
      .select("term usagecount simpScore misunderstood usageInstr timestamp")
      .sort({ usagecount: -1 })
      .lean();

    const totalTerms = allTerms.length;
    const misunderstoodCount = allTerms.reduce((a, t) => a + (t.misunderstood || 0), 0);
    const instrCount = allTerms.reduce((a, t) => a + (t.usageInstr || 0), 0);

    const topMisunderstood = allTerms
      .sort((a, b) => b.misunderstood - a.misunderstood)
      .slice(0, 10);

    const docBreakdown = await Simplification.aggregate([
      {
        $group: { _id: "$inputType", count: { $sum: 1 } },
      },
      {
        $project: {
          _id: 0,
          name: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", "pdf"] }, then: "PDF" },
                { case: { $eq: ["$_id", "doc"] }, then: "DOCX" },
                { case: { $eq: ["$_id", "text"] }, then: "Text Input" },
              ],
              default: "Other",
            },
          },
          value: "$count",
        },
      },
    ]);

    const docTypeBreakdown = [
      { name: "PDF", value: 0 },
      { name: "DOCX", value: 0 },
      { name: "Text Input", value: 0 },
    ];

    docBreakdown.forEach(item => {
      const match = docTypeBreakdown.find(d => d.name === item.name);
      if (match) match.value = item.value;
    });

    // ✅ Combine everything
    const report = {
      totalQueries,
      totalTerms,
      misunderstoodCount,
      instrCount,
      allTerms,
      topMisunderstood,
      docTypeBreakdown,
    };

    console.log("[getReport] Success →", {
      totalQueries,
      totalTerms,
      misunderstoodCount,
      instrCount,
      docTypes: docTypeBreakdown,
    });

    return res.json(report);
  } catch (err) {
    console.error("getReport error:", err);
    return res.status(500).json({ error: "Failed to generate report" });
  }
};
