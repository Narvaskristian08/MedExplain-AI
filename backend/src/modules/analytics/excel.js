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

  if (fs.existsSync(excelFilePath)) {
    workbook = XLSX.readFile(excelFilePath);
  } else {
    workbook = XLSX.utils.book_new();
  }

  let sheet = workbook.Sheets["Terms"];
  let data = sheet ? XLSX.utils.sheet_to_json(sheet) : [];

  if (typeof termData !== "object" || Array.isArray(termData)) {
    console.error("[Excel] termData must be an object:", termData);
    return;
  }

  data.push(termData);

  const newSheet = XLSX.utils.json_to_sheet(data);
  workbook.Sheets["Terms"] = newSheet;

  if (!workbook.SheetNames.includes("Terms")) {
    workbook.SheetNames.push("Terms");
  }

  XLSX.writeFile(workbook, excelFilePath);
  console.log("[Excel] Saved term:", termData.term);
}
