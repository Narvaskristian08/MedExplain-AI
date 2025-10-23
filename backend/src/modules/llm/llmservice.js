import fetch from "node-fetch";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { saveTermToExcel, logAllMedicalTermsToExcel } from "../analytics/excel.js";

// ─────── 1. Paths & folder creation ───────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const excelFolderPath = path.join(path.resolve(process.cwd(), "kpi"), "dataanalytics");

if (!fs.existsSync(excelFolderPath)) {
  fs.mkdirSync(excelFolderPath, { recursive: true });
  console.log("Created folder:", excelFolderPath);
}

// ─────── 2. Helper metrics ───────────────────────────────────────────────
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

// ─────── 3. Main LLM service ─────────────────────────────────────────────
export async function simplifyMedicalText(text) {
  try {
    console.log("\n=== FULL INPUT DOCUMENT ===");
    console.log(text);

    // ---- 1. LOG ALL TERMS IMMEDIATELY (placeholder score = 0) ----
    await logAllMedicalTermsToExcel(text, 0, excelFolderPath);
    console.log("[Step 1] Logged all medical terms with placeholder score");

    // ---- 2. Ask LLM to rewrite the whole document ----
    const systemPrompt = `
You are MedExplain AI – a kind nurse explaining to an older patient.

Your job:
- Read the entire medical document below.
- Rewrite it **in simple, everyday English**.
- Replace every medical term, drug name, dosage, diagnosis, and instruction with **plain words**.
- Keep the meaning 100% accurate.
- Use short sentences.
- Be warm and clear.

For tracking only:
- When you explain a term for the first time, write: [[original term]]
- Example: "Take [[Aspirin 81 mg]] once daily" → "Take one small aspirin pill every morning."

Return ONLY the simplified version. No headings. No notes.

Document:
"""${text}"""
`.trim();

    const resp = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-r1:1.5b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
      }),
    });

    const raw = await resp.text();
    console.log("\n=== OLLAMA RAW ===");
    console.log(raw);

    // ---- 3. Combine streamed chunks ----
    const lines = raw.split("\n").filter(Boolean);
    let combined = "";
    for (const line of lines) {
      try {
        const obj = JSON.parse(line.replace(/^data:\s*/, ""));
        if (obj.message?.content) combined += obj.message.content + " ";
      } catch {}
    }
    combined = combined.trim();
    if (!combined) throw new Error("Empty response from LLM");

    console.log("\n=== SIMPLIFIED (with [[term]]) ===");
    console.log(combined);

    // ---- 4. Extract [[terms]] that the LLM actually explained ----
    const bracketed = new Set();
    const re = /\[\[([^\]]+)\]\]/g;
    let m;
    while ((m = re.exec(combined))) bracketed.add(m[1].trim());

    // ---- 5. UPDATE EXCEL WITH FINAL SIMP SCORE ----
    const finalScore = calculateSimpScore(combined, bracketed.size);
    await logAllMedicalTermsToExcel(text, finalScore, excelFolderPath);
    console.log(`[Step 5] Updated all terms with final simpScore: ${finalScore}`);

    // ---- 6. Save only the bracketed terms (for extra analytics) ----
    if (bracketed.size > 0) {
      const entries = [...bracketed].map(term => ({
        term,
        usagecount: 1,
        simpScore: finalScore,
        misunderstood: isLikelyMisunderstood(term),
        usageInstr: hasUsageInstructions(term) ? 1 : 0,
        timestamp: new Date().toISOString(),
      }));
      await saveTermToExcel(entries, excelFolderPath);
      console.log(`[Excel] Saved ${entries.length} bracketed term(s)`);
    }

    // ---- 7. Return clean patient version ----
    const clean = combined.replace(/\[\[|\]\]/g, "").trim();
    console.log("\n=== FINAL PATIENT VERSION ===");
    console.log(clean);
    return clean;

  } catch (err) {
    console.error("ERROR:", err);
    throw new Error("Failed to simplify document: " + err.message);
  }
}