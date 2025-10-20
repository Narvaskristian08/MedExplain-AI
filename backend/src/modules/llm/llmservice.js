// llm/llmservice.js
import fetch from "node-fetch";
import { saveTermToExcel } from "../analytics/excel.js";

// Helper metrics
function isLikelyMisunderstood(term) {
  return term.length > 8 ? 1 : 0;
}

function hasUsageInstructions(text) {
  return /take|dosage|daily|per day/i.test(text) ? 1 : 0;
}

function calculateSimpScore(text) {
  const words = text.split(" ");
  return words.reduce((a, b) => a + b.length, 0) / words.length < 5 ? 5 : 3;
}

export async function simplifyMedicalText(text) {
  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-r1:1.5b",
        messages: [
          {
            role: "system",
            content:
              "You are MedExplain AI. Explain medical terms simply for older people. Use short, clear sentences. Example: 'Myocardial infarction means a heart attack.' Avoid long lectures. Just explain clearly and briefly.",
          },
          { role: "user", content: text },
        ],
      }),
    });

    const rawText = await response.text();
    console.log("Ollama raw response:", rawText);

    // Split streaming JSON lines and combine content
    const lines = rawText.split("\n").filter(Boolean);
    let combinedText = "";

    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        if (obj.message?.content) {
          combinedText += obj.message.content;
        }
      } catch {
        console.warn("Skipping invalid JSON line:", line);
      }
    }

    // Extract capitalized terms (medical terms)
    const terms = combinedText.match(/\b[A-Z][a-zA-Z-]{2,}\b/g) || [];

    // Save each term to Excel
    terms.forEach((term) =>
      saveTermToExcel({
        term,
        misunderstood: isLikelyMisunderstood(term),
        simpScore: calculateSimpScore(combinedText),
        usageInstr: hasUsageInstructions(combinedText),
        timestamp: new Date().toISOString(),
      })
    );

    return combinedText || "No valid content from Ollama.";
  } catch (err) {
    console.error("LLM Error:", err);
    throw new Error("Failed to simplify text: " + err.message);
  }
}
