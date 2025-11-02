// ---------------------------------------------------------------
// simplifyMedicalText.js   (FINAL: PLAIN ENGLISH ONLY FOR PATIENT)
// ---------------------------------------------------------------
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { saveTermToExcel, logAllMedicalTermsToExcel } from "../analytics/excel.js";
import Analytics from "./models/analytics.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const excelFolderPath = path.join(process.cwd(), "kpi", "dataanalytics");
fs.mkdirSync(excelFolderPath, { recursive: true });

// ---------------------------------------------------------------
// 0. NON-MEDICAL GUARD
// ---------------------------------------------------------------
const medicalKeywords = new Set([
  "fever","fatigue","pain","cough","dyspnea","edema","swelling","tender","stiffness",
  "nausea","vomiting","headache","dizziness","palpitation","arrhythmia","chestpain",
  "hypertension","diabetes","asthma","copd","pneumonia","tuberculosis","stroke",
  "myocardial","infarction","heart","failure","arthritis","rheumatoid","osteopenia",
  "crp","esr","ana","rf","anti-ccp","cbc","plt","hgb","ecg","x-ray","echo",
  "mg","ml","tablet","capsule","daily","weekly","methotrexate","prednisone","furosemide",
  "losartan","salbutamol","omeprazole","atorvastatin","lisinopril","insulin","metformin",
  "amoxicillin","ibuprofen","paracetamol","cephalexin","cellulitis","migraine","sumatriptan",
  "blood pressure","heart rate","temperature","dose","prescription","diagnosis",
  "infection","respiratory","tract","upper","lower","viral","bacterial","sinus","throat","nose",
  "ear","skin","urinary","uti","lungs","bronchi","pharynx","larynx","tonsil"
]);

const medicalPhrases = [
  "upper respiratory tract infection",
  "lower respiratory tract infection",
  "urinary tract infection",
  "respiratory infection",
  "sinus infection",
  "ear infection",
  "skin infection",
  "viral infection",
  "bacterial infection"
];

function looksMedical(txt) {
  const lower = txt.toLowerCase();
  let hits = [...medicalKeywords].filter(k => lower.includes(k)).length;
  for (const phrase of medicalPhrases) {
    if (lower.includes(phrase)) hits += 2;
  }
  const dosePattern = /\d+\s*(mg|ml|mmhg|bpm)/i.test(lower);
  return hits >= 1 || dosePattern;
}

// ---------------------------------------------------------------
// 1. Typos
// ---------------------------------------------------------------
const medicalTypos = {
  infraction: "infarction",
  mycardial: "myocardial",
  myocardal: "myocardial",
  diabetis: "diabetes",
  pnemonia: "pneumonia",
  asma: "asthma",
  bronchities: "bronchitis",
  hipertension: "hypertension",
  SGRAPIN: "ANA",
  pericardial: "periarticular",
  LANAPositive: "ANA",
  "NegativeRFNegativeNegativeAnti": "RF",
  CCPPositiveNegativeCBCWBC: "Anti-CCP",
};

function correctMedicalTypos(txt) {
  let s = txt;
  for (const [bad, good] of Object.entries(medicalTypos)) {
    s = s.replace(new RegExp(`\\b${bad}\\b`, "gi"), good);
  }
  return s;
}

// ---------------------------------------------------------------
// 2. Chunking
// ---------------------------------------------------------------
function chunkText(text, maxWords = 200) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  let cur = "", wc = 0;
  for (const s of sentences) {
    const sw = s.trim().split(/\s+/).filter(Boolean).length;
    if (wc + sw > maxWords && cur) {
      chunks.push(cur.trim());
      cur = s; wc = sw;
    } else {
      cur += " " + s; wc += sw;
    }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
}

// ---------------------------------------------------------------
// 3. LLM CALL
// ---------------------------------------------------------------
async function simplifyChunk(chunk) {
  const system = `You are a medical simplification expert.
RULES:
1. Replace EVERY medical term with: [[Term]] (simple English meaning)
2. Use SHORT, EASY words.
3. Keep ALL facts.
4. Output ONLY the simplified text.`;

  const fewShot = `
Input: Acute bronchitis with fever.
Output: You have [[bronchitis]] (lung infection) with [[fever]] (high body temperature).

Input: Take paracetamol 500 mg.
Output: Take [[paracetamol]] (pain and fever medicine) 500 mg.

Input: Rhonchi in right lower lobe.
Output: Crackling sound [[rhonchi]] in lower right lung.`;

  const prompt = `${system}\n${fewShot}\n\nSimplify:\n${chunk}\n\nOutput:`;

  try {
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemma2:2b",
        prompt,
        stream: false,
        options: { temperature: 0.1, num_predict: 1500, top_p: 0.9, top_k: 40 },
      }),
    });

    if (!res.ok) throw new Error(`LLM ${res.status}`);
    const { response = "" } = await res.json();
    let output = response.trim() || chunk;

    // === FORCE BRACKETS IF MISSING ===
    const forceMap = {
      "bronchitis": "lung infection",
      "fever": "high body temperature",
      "paracetamol": "pain and fever medicine",
      "rhonchi": "crackling lung sound",
      "erythema": "redness",
      "tuberculosis": "TB lung disease",
      "respiratory": "breathing",
      "diagnosis": "what the doctor thinks is wrong",
      "assessment": "doctor's check",
      "symptomatic": "to help symptoms",
      "hydration": "drink water"
    };

    for (const [term, plain] of Object.entries(forceMap)) {
      const regex = new RegExp(`\\b${term}\\b`, "gi");
      if (regex.test(output) && !output.includes(`[[${term}]]`)) {
        output = output.replace(regex, `[[${term}]] (${plain})`);
      }
    }

    return output;

  } catch (e) {
    console.warn("LLM failed:", e.message);
    return chunk;
  }
}

// ---------------------------------------------------------------
// 4. SHORTEN SENTENCES
// ---------------------------------------------------------------
function shortenSentences(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const result = [];
  for (const s of sentences) {
    const words = s.trim().split(/\s+/);
    if (words.length <= 15) {
      result.push(s.trim());
      continue;
    }
    for (let i = 0; i < words.length; i += 13) {
      const chunk = words.slice(i, i + 13).join(" ");
      const end = (i + 13 < words.length) ? "." : (s.match(/[.!?]$/)?.[0] || ".");
      result.push(chunk + end);
    }
  }
  return result.join(" ").replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------
// 5. EXTRACT TERMS
// ---------------------------------------------------------------
function extractBracketed(text) {
  const set = new Set();
  const re = /\[\[([^[\]]+?)\]\]/g;
  let m;
  while ((m = re.exec(text))) {
    const term = m[1].split("(")[0].trim();
    if (term) set.add(term);
  }
  return [...set];
}

function fallbackTerms(text) {
  const pats = [
    /infection|respiratory|tract|upper|lower|viral|bacterial|sinus|throat|nose|ear|skin|uti/gi
  ];
  const set = new Set();
  pats.forEach(p => {
    let m;
    while ((m = p.exec(text))) set.add(m[0].toLowerCase());
  });
  return [...set];
}

// ---------------------------------------------------------------
// 6. Simplicity Score
// ---------------------------------------------------------------
function syllableCount(w) {
  w = w.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  return (w.match(/[aeiouy]{1,2}/g) || []).length || 1;
}

function calculateSimpScore(text, termCount) {
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  if (!words.length) return 0;
  const avgSyl = words.reduce((s, w) => s + syllableCount(w), 0) / words.length;
  const avgWPS = words.length / (sentences.length || 1);
  const fk = 0.39 * avgWPS + 11.8 * avgSyl - 15.59;
  let score = Math.max(0, 10 - fk * 0.7);
  score = Math.min(10, score);
  if (termCount > 8) score = Math.max(4, score - (termCount - 8) * 0.15);
  return Math.round(score * 10) / 10;
}

// ---------------------------------------------------------------
// 7. MAIN EXPORT – PATIENT GETS ONLY PLAIN ENGLISH
// ---------------------------------------------------------------
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function simplifyMedicalText(original) {
  console.log("\n=== START SIMPLIFICATION ===");

  if (!looksMedical(original)) {
    return {
      patientPlainText: "This text does not appear to be medical-related.",
      simplifiedWithBrackets: "",
      terms: [],
      score: 0
    };
  }

  const text = correctMedicalTypos(original);
  await logAllMedicalTermsToExcel(text, 0, excelFolderPath);

  const chunks = chunkText(text);
  const simplified = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`Chunk ${i + 1}/${chunks.length}...`);
    const out = await simplifyChunk(chunks[i]);
    simplified.push(out);
    await new Promise(r => setTimeout(r, 250));
  }

  let combined = simplified.join(" ").replace(/\s+/g, " ").trim();
  combined = shortenSentences(combined);

  console.log("\n=== WITH PLAIN ENGLISH ===");
  console.log(combined.slice(0, 600) + "...");

  // === EXTRACT TERMS + MEANINGS ===
  const termMeanings = new Map();
  const bracketRE = /\[\[([^\]]+)\]\]\s*\(([^)]+)\)/g;
  let match;
  while ((match = bracketRE.exec(combined))) {
    const term = match[1].trim();
    const meaning = match[2].trim();
    termMeanings.set(term.toLowerCase(), meaning);
  }

  // === FALLBACK: Extract terms if no brackets ===
  let terms = [...termMeanings.keys()];
  if (!terms.length) {
    console.warn("[FALLBACK] Using pattern detection");
    terms = fallbackTerms(text);
  }

  // === BUILD PATIENT VERSION: REPLACE TERMS WITH MEANINGS ONLY ===
  let patientText = combined;
  for (const [term, meaning] of termMeanings) {
    const regex = new RegExp(`\\[\\[${escapeRegExp(term)}\\]\\]\\s*\\([^)]+\\)`, "gi");
    patientText = patientText.replace(regex, meaning);
  }

  // Clean leftover brackets
  patientText = patientText
    .replace(/\[\[[^\]]+\]\]/g, "")
    .replace(/\(\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Capitalize first letter
  if (patientText) {
    patientText = patientText.charAt(0).toUpperCase() + patientText.slice(1);
  }

  const finalScore = calculateSimpScore(patientText, terms.length);
  await logAllMedicalTermsToExcel(text, finalScore, excelFolderPath);

  // Analytics
  const analytics = terms.map(t => ({
    term: t.toLowerCase(),
    usagecount: 1,
    simpScore: finalScore,
    misunderstood: t.length > 12 ? 1 : 0,
    usageInstr: /take|dose|daily|mg|weekly/i.test(t) ? 1 : 0,
    timestamp: new Date(),
  }));

  if (analytics.length) {
    try { await Analytics.insertMany(analytics); } catch (e) { console.error("Mongo:", e); }
    try { await saveTermToExcel(analytics, excelFolderPath); } catch (e) { console.error("Excel:", e); }
    console.log(`[Mongo+Excel] ${analytics.length} terms saved`);
  }

  console.log("\n=== FINAL PATIENT VERSION (CLEAN) ===");
  console.log(patientText);
  console.log(`\nSimplicity Score: ${finalScore}/10`);

  return {
    simplifiedWithBrackets: combined,
    patientPlainText: patientText,  // ← ONLY PLAIN ENGLISH
    terms: terms,
    score: finalScore
  };
}