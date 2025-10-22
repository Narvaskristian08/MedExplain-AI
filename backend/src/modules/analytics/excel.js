import XLSX from "xlsx";
import fs from "fs";
import path from "path";

// New folder path
const excelFolder = path.join(process.cwd(), "dataanalytics");

// Ensure the folder exists
if (!fs.existsSync(excelFolder)) {
  fs.mkdirSync(excelFolder, { recursive: true });
}

// Full path to Excel file
const excelFilePath = path.join(excelFolder, "medical_terms.xlsx");

export function saveTermToExcel(termData) {
  let workbook;

  // Load existing workbook or create new
  if (fs.existsSync(excelFilePath)) {
    workbook = XLSX.readFile(excelFilePath);
  } else {
    workbook = XLSX.utils.book_new();
  }

  // Load existing sheet or create empty array
  let sheet = workbook.Sheets["Terms"];
  let data = sheet ? XLSX.utils.sheet_to_json(sheet) : [];

  if (typeof termData !== "object" || Array.isArray(termData)) {
    console.error("[Excel] termData must be an object:", termData);
    return;
  }

  // Check if the term already exists
  const existingIndex = data.findIndex(row => row.term === termData.term);

  if (existingIndex >= 0) {
    // Term exists: increment numeric fields
    data[existingIndex].misunderstood += termData.misunderstood || 0;
    data[existingIndex].simpScore += termData.simpScore || 0;
    data[existingIndex].usageInstr += termData.usageInstr || 0;
    data[existingIndex].timestamp = termData.timestamp; // update latest timestamp
  } else {
    // Term does not exist: add as new row
    data.push(termData);
  }

  // Convert back to sheet
  const newSheet = XLSX.utils.json_to_sheet(data);
  workbook.Sheets["Terms"] = newSheet;

  // Add sheet name if missing
  if (!workbook.SheetNames.includes("Terms")) {
    workbook.SheetNames.push("Terms");
  }

  // Write workbook to file
  XLSX.writeFile(workbook, excelFilePath);
  console.log("[Excel] Saved/Updated term:", termData.term);
}

