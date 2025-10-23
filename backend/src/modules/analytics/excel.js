// ─────────────────────────────────────────────────────────────────────────────
//  excel.js  (FULL FILE – REPLACE YOUR OLD ONE)
// ─────────────────────────────────────────────────────────────────────────────
import XLSX from "xlsx";
import fs from "fs";
import path from "path";

/**
 * Save or update term data in backend/dataanalytics/medical_terms.xlsx
 * - Merges by term (case-insensitive)
 * - Increments usagecount
 * - Averages simpScore
 * - Preserves misunderstood, usageInstr
 */
export function saveTermToExcel(termDataList, customFolderPath = null) {
  try {
    const excelFolder = customFolderPath
      ? path.resolve(customFolderPath)
      : path.join(path.resolve(process.cwd(), "backend"), "dataanalytics"); // Updated to "backend"

    // Ensure folder exists
    if (!fs.existsSync(excelFolder)) {
      fs.mkdirSync(excelFolder, { recursive: true });
      console.log(`[Excel] Created folder: ${excelFolder}`);
    }

    const excelFilePath = path.join(excelFolder, "medical_terms.xlsx");

    let workbook;
    let data = [];

    if (fs.existsSync(excelFilePath)) {
      workbook = XLSX.readFile(excelFilePath);
      const sheet = workbook.Sheets["Terms"];
      if (sheet) {
        data = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      }
    } else {
      workbook = XLSX.utils.book_new();
      console.log(`[Excel] Created new workbook: ${excelFilePath}`);
    }

    const termArray = Array.isArray(termDataList) ? termDataList : [termDataList];
    let added = 0;
    let updated = 0;

    for (const entry of termArray) {
      if (!entry || !entry.term) {
        console.warn("[Excel] Skipping invalid entry:", entry);
        continue;
      }

      const termKey = entry.term.trim().toLowerCase();
      const existingIndex = data.findIndex(
        (row) => row.term?.toString().trim().toLowerCase() === termKey
      );

      if (existingIndex >= 0) {
        // UPDATE existing
        const old = data[existingIndex];
        const oldCount = Number(old.usagecount) || 0;
        const newCount = oldCount + 1;

        const oldScore = Number(old.simpScore) || 0;
        const newScore = Number(entry.simpScore) || 0;
        const avgScore = oldCount > 0
          ? ((oldScore * oldCount) + newScore) / newCount
          : newScore;

        data[existingIndex] = {
          term: entry.term.trim(),
          usagecount: newCount,
          simpScore: Number(avgScore.toFixed(2)),
          misunderstood: Number(entry.misunderstood) || 0,
          usageInstr: Number(entry.usageInstr) || 0,
          timestamp: entry.timestamp || new Date().toISOString(),
        };
        updated++;
        console.log(`[Excel] Updated: ${entry.term} → count: ${newCount}, avgScore: ${avgScore.toFixed(2)}`);
      } else {
        // ADD new
        data.push({
          term: entry.term.trim(),
          usagecount: 1,
          simpScore: Number(entry.simpScore?.toFixed(2)) || 0,
          misunderstood: Number(entry.misunderstood) || 0,
          usageInstr: Number(entry.usageInstr) || 0,
          timestamp: entry.timestamp || new Date().toISOString(),
        });
        added++;
        console.log(`[Excel] Added: ${entry.term}`);
      }
    }

    // Rebuild sheet
    const newSheet = XLSX.utils.json_to_sheet(data);
    workbook.Sheets["Terms"] = newSheet;
    if (!workbook.SheetNames.includes("Terms")) {
      workbook.SheetNames.push("Terms");
    }

    XLSX.writeFile(workbook, excelFilePath);
    console.log(
      `[Excel] Saved: ${excelFilePath}\n` +
      `[Excel] Summary: +${added} new | Updated ${updated} | Total ${data.length} rows`
    );
  } catch (err) {
    console.error("[Excel] Save failed:", err);
  }
}

/**
 * Create a NEW timestamped Excel file: medical_terms_YYYYMMDD_HHMMSS.xlsx
 * Full data preserved, no merging
 */
export function saveTermToNewExcel(termDataList, customFolderPath = null) {
  try {
    const excelFolder = customFolderPath
      ? path.resolve(customFolderPath)
      : path.join(path.resolve(process.cwd(), "backend"), "dataanalytics");

    if (!fs.existsSync(excelFolder)) {
      fs.mkdirSync(excelFolder, { recursive: true });
      console.log(`[Excel] Created folder: ${excelFolder}`);
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const filePath = path.join(excelFolder, `medical_terms_${ts}.xlsx`);

    const termArray = Array.isArray(termDataList) ? termDataList : [termDataList];
    const valid = termArray
      .filter((t) => t && t.term)
      .map((t) => ({
        term: t.term.trim(),
        usagecount: Number(t.usagecount) || 1,
        simpScore: Number(t.simpScore?.toFixed(2)) || 0,
        misunderstood: Number(t.misunderstood) || 0,
        usageInstr: Number(t.usageInstr) || 0,
        timestamp: t.timestamp || new Date().toISOString(),
      }));

    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(valid);
    XLSX.utils.book_append_sheet(workbook, sheet, "Terms");
    XLSX.writeFile(workbook, filePath);

    console.log(`[Excel] New file: ${filePath} (${valid.length} rows)`);
    return filePath;
  } catch (err) {
    console.error("[Excel] New file failed:", err);
    return null;
  }
}

/* ────────────────────────────────────────────────────────────────────────
   NEW: Extract & Log EVERY medical term from raw text
   → Guarantees Excel rows even if LLM skips [[term]]
   → Works with simplifyMedicalText.js
   --------------------------------------------------------------------- */
export async function logAllMedicalTermsToExcel(rawText, placeholderScore = 0, customFolderPath = null) {
  try {
    const excelFolder = customFolderPath
      ? path.resolve(customFolderPath)
      : path.join(path.resolve(process.cwd(), "backend"), "dataanalytics");

    if (!fs.existsSync(excelFolder)) {
      fs.mkdirSync(excelFolder, { recursive: true });
    }

    // ---- 1. Known medical keywords (expand anytime) ----
    const known = [
      "hypertension","diabetes","infarction","bronchitis","indigestion",
      "cough","fever","fatigue","shortness of breath","chest pain",
      "auscultation","wheezing","crackles","murmur","erythema",
      "antibiotics","OTC","cough suppressant","fluid intake","rest",
      "vital signs","BP","HR","Temp","S1","S2","ENT","diagnosis","plan",
      "prescription","symptom","treatment","procedure","surgery","injection",
      "tablet","capsule","ml","mg","daily","twice","three times","morning","night",
      "with food","empty stomach","as needed","follow-up"
    ];

    // ---- 2. Multi-word phrases ----
    const phrases = [
      /myocardial infarction/gi,
      /congestive heart failure/gi,
      /chronic obstructive pulmonary/gi,
      /deep vein thrombosis/gi,
      /pulmonary embolism/gi,
      /atrial fibrillation/gi,
      /coronary artery disease/gi,
      /type [12] diabetes/gi,
      /post[- ]?traumatic stress/gi,
      /blood pressure/gi,
      /heart rate/gi,
      /acute bronchitis/gi,
      /viral/gi,
      /OTC cough suppressant/gi,
      /follow-up/gi,
      /as needed/gi
    ];

    // ---- 3. Collect all matches ----
    const found = new Set();

    // Known single words
    known.forEach(k => {
      const re = new RegExp(`\\b${k}\\b`, "gi");
      const m = rawText.match(re);
      if (m) m.forEach(t => found.add(t));
    });

    // Multi-word phrases
    phrases.forEach(re => {
      const m = rawText.match(re);
      if (m) found.add(m[0]);
    });

    // Drug names: e.g., "Aspirin 81 mg"
    const drugs = rawText.match(/\b[A-Z][a-z]+ \d+[mg]*\b/g) || [];
    drugs.forEach(d => found.add(d));

    // Long unknown medical words (≥10 letters)
    const long = rawText.match(/\b[a-zA-Z]{10,}\b/g) || [];
    long.forEach(w => {
      if (!known.includes(w.toLowerCase())) found.add(w);
    });

    if (found.size === 0) {
      console.log("[Excel] No medical terms found in text.");
      return;
    }

    // ---- 4. Build Excel rows ----
    const rows = [...found].map(term => ({
      term,
      usagecount: 1,
      simpScore: Number(placeholderScore.toFixed(2)),
      misunderstood: term.replace(/[^a-z]/gi, "").length > 10 ? 1 : 0,
      usageInstr: /take|dose|daily|twice|mg|tablet|capsule|ml|injection|as needed/i.test(term) ? 1 : 0,
      timestamp: new Date().toISOString(),
    }));

    // ---- 5. Save to master Excel (averages later) ----
    await saveTermToExcel(rows, excelFolder);
    console.log(`[Excel] Logged ${rows.length} term(s) from document`);

    // ---- 6. Optional: Create timestamped copy (uncomment if needed) ----
    // saveTermToNewExcel(rows, excelFolder);

  } catch (err) {
    console.error("[Excel] logAllMedicalTermsToExcel failed:", err);
  }
}