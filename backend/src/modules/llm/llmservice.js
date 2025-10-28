import fetch from "node-fetch";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { saveTermToExcel, logAllMedicalTermsToExcel } from "../analytics/excel.js";
import Analytics from "./models/analytics.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const excelFolderPath = path.join(path.resolve(process.cwd(), "kpi"), "dataanalytics");

if (!fs.existsSync(excelFolderPath)) {
  fs.mkdirSync(excelFolderPath, { recursive: true });
  console.log("Created folder:", excelFolderPath);
}

// Common medical term typos and corrections
const medicalTypos = {
  "infraction": "infarction",
  "mycardial": "myocardial",
  "myocardal": "myocardial",
  "diabetis": "diabetes",
  "pnemonia": "pneumonia",
  "asma": "asthma",
  "bronchities": "bronchitis",
  "hipertension": "hypertension",
};

function correctMedicalTypos(text) {
  let corrected = text;
  Object.entries(medicalTypos).forEach(([typo, correct]) => {
    const regex = new RegExp(`\\b${typo}\\b`, 'gi');
    corrected = corrected.replace(regex, correct);
  });
  return corrected;
}

function isLikelyMisunderstood(term) {
  const clean = term.replace(/[^a-z0-9]/gi, "");
  return clean.length > 10 ? 1 : 0;
}

function hasUsageInstructions(text) {
  return /take|dose|daily|twice|three times|morning|night|with food|empty stomach|mg|tablet|capsule|ml|injection|as needed/i.test(text);
}

function syllableCount(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  return (word.match(/[aeiouy]{1,2}/g) || []).length || 1;
}

function calculateSimpScore(text, bracketedTerms = 0) {
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return 0;

  const totalSyllables = words.reduce((s, w) => s + syllableCount(w), 0);
  const avgSyllables = totalSyllables / words.length;
  const avgWordsPerSentence = words.length / (sentences.length || 1);
  const fkGrade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllables - 15.59;

  let score = Math.max(0, 10 - fkGrade * 0.8);
  score = Math.min(10, score);
  score = Math.max(0, score - Math.min(3, bracketedTerms * 0.5));

  const friendly = /(you|please|easy|simple|just|let|we|us|friend|take|with food|at bedtime)/gi;
  const friendlyCount = (text.match(friendly) || []).length;
  score = Math.min(10, score + Math.min(3, friendlyCount * 0.4));

  return Math.round(score * 2) / 2;
}

function cleanLLMOutput(text) {
  let cleaned = text.replace(/\s{2,}/g, " ").trim();
  const medicalTerms = {
    "short ness": "shortness",
    "bron ch itis": "bronchitis",
    "respir atory": "respiratory",
    "rh on chi": "rhonchi",
    "ery th ema": "erythema",
    "ex ud ates": "exudates",
    "par acet am ol": "paracetamol",
    "di agn oses": "diagnoses",
    "vir al": "viral",
    "pneum onia": "pneumonia",
    "infarction": "infarction",
    "my oc ardial": "myocardial",
    "hyper tension": "hypertension",
    "tem perature": "temperature",
    "di ar rhea": "diarrhea",
  };
  Object.keys(medicalTerms).forEach((key) => {
    const regex = new RegExp(`\\b${key.replace(/\s+/g, "\\s+")}\\b`, "gi");
    cleaned = cleaned.replace(regex, medicalTerms[key]);
  });
  cleaned = cleaned.replace(/\s+/g, " ");
  return cleaned;
}

// Enhanced fallback term detection
function extractFallbackTerms(text) {
  const terms = new Set();
  
  // Comprehensive medical patterns
  const patterns = [
    // Symptoms
    /\b(dry cough|wet cough|cough|fever|low-grade fever|fatigue|sore throat|chest pain|shortness of breath|difficulty breathing|wheezing|dizziness|nausea|vomiting|diarrhea|headache|body aches)\b/gi,
    // Conditions
    /\b(myocardial infarction|heart attack|stroke|hypertension|diabetes|asthma|bronchitis|pneumonia|tuberculosis|COVID-19|COPD|angina|arrhythmia)\b/gi,
    // Medications
    /\b(aspirin|paracetamol|ibuprofen|amoxicillin|metformin|insulin|lisinopril|atorvastatin|omeprazole|salbutamol)\b/gi,
    // Dosages
    /\b\d+\s*(mg|ml|tablet|capsule|dose|daily|twice daily|three times daily)\b/gi,
    // Medical terms
    /\b(sputum|edema|inflammation|infection|vital signs|blood pressure|heart rate|respiratory rate|temperature)\b/gi,
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text))) {
      terms.add(match[0].toLowerCase());
    }
  });

  return [...terms];
}

export async function simplifyMedicalText(text) {
  try {
    console.log("\n=== FULL INPUT DOCUMENT ===");
    console.log(text);

    // Correct common typos BEFORE processing
    const correctedText = correctMedicalTypos(text);
    console.log("\n=== CORRECTED TEXT ===");
    console.log(correctedText);

    await logAllMedicalTermsToExcel(correctedText, 0, excelFolderPath);
    console.log("[Step 1] Logged all medical terms with placeholder score");

    const systemPrompt = `
You are MedExplain AI – a kind nurse explaining to an older patient.

Your job:
- Read the entire medical document below.
- Rewrite it in simple, everyday English.
- Replace EVERY medical term, drug name, dosage, diagnosis, and instruction with plain words and bracket the original term like [[original term]].
- IMPORTANT: Even if the input has typos, recognize the medical intent and bracket the term. For example:
  * "myocardial infraction" → "[[myocardial infarction]]" (correct spelling)
  * "what is mycardial infraction" → "A [[myocardial infarction]] is..."
- Keep the meaning 100% accurate.
- Use short sentences.
- Be warm and clear.
- Do not add extra spaces within words.

Examples:
- Input: "Patient has dry cough"
  Output: "The patient has a [[dry cough]] - a cough without mucus."

- Input: "what is myocardial infraction" 
  Output: "A [[myocardial infarction]] (heart attack) happens when blood flow to part of the heart is blocked."

Return ONLY the simplified version with [[bracketed terms]]. No headings. No notes.
- If it's not medical related, say "Its not medical related"

Document:
"""${correctedText}"""
`.trim();

    const fetchStart = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    const resp = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-r1:1.5b",
        messages: [{ role: "system", content: systemPrompt }],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    console.log(`Fetch completed in ${Date.now() - fetchStart}ms`);

    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`HTTP error! Status: ${resp.status}, Body: ${errorText}`);
    }

    const raw = await resp.text();
    console.log("\n=== OLLAMA RAW ===");
    console.log(raw);

    const lines = raw.split("\n").filter(Boolean);
    let combined = "";
    for (const line of lines) {
      try {
        const obj = JSON.parse(line.replace(/^data:\s*/, ""));
        if (obj.message?.content) combined += obj.message.content;
      } catch (e) {
        console.error("Parse error:", e.message, "Line:", line);
      }
    }
    combined = combined.trim();
    if (!combined) throw new Error("Empty response from LLM");

    console.log("\n=== SIMPLIFIED (with [[term]]) ===");
    console.log(combined);

    combined = cleanLLMOutput(combined);
    console.log("\n=== CLEANED SIMPLIFIED ===");
    console.log(combined);

    const bracketed = new Set();
    const re = /\[\[([^\]]+)\]\]/g;
    let m;
    while ((m = re.exec(combined))) bracketed.add(m[1].trim());
    console.log("\n=== EXTRACTED BRACKETED TERMS ===");
    console.log([...bracketed]);

    // Enhanced fallback: use both bracketed terms AND fallback detection
    let termsToSave = [...bracketed];
    if (termsToSave.length === 0) {
      console.log("[FALLBACK] No bracketed terms found, using pattern detection...");
      termsToSave = extractFallbackTerms(correctedText);
    }
    
    console.log("\n=== TERMS TO SAVE ===");
    console.log(termsToSave);

    const finalScore = calculateSimpScore(combined, termsToSave.length);
    await logAllMedicalTermsToExcel(correctedText, finalScore, excelFolderPath);
    console.log(`[Step 5] Updated all terms with final simpScore: ${finalScore}`);

    const entries = termsToSave.map((term) => ({
      term: term.toLowerCase(),
      usagecount: 1,
      simpScore: finalScore,
      misunderstood: isLikelyMisunderstood(term),
      usageInstr: hasUsageInstructions(term) ? 1 : 0,
      timestamp: new Date(),
    }));

    if (entries.length > 0) {
      await Analytics.insertMany(entries);
      console.log(`[MongoDB] Saved ${entries.length} analytics entry(ies)`);
      
      await saveTermToExcel(entries, excelFolderPath);
      console.log(`[Excel] Saved ${entries.length} analytics entry(ies)`);
    } else {
      console.log(`[MongoDB] No terms to save (non-medical or empty)`);
    }

    const clean = combined.replace(/\[\[|\]\]/g, "").trim();
    console.log("\n=== FINAL PATIENT VERSION ===");
    console.log(clean);
    return clean;

  } catch (err) {
    console.error("ERROR in simplifyMedicalText:", err.message, err.stack);
    throw new Error("Failed to simplify document: " + err.message);
  }
}