import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Excel file is in the same folder as this script
const excelFilePath = path.join(__dirname, "medical_terms.xlsx");

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

// ====== TEST ======
if (process.argv[1].includes("excel.js")) {
  saveTermToExcel({ term: "Hypertension", description: "High blood pressure", frequency: 1 });
}
