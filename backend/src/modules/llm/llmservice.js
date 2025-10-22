// llm/llmservice.js
import fetch from "node-fetch";
import { saveTermToExcel } from "../analytics/excel.js";

// --- Helper metrics ---
function isLikelyMisunderstood(term) {
  return term.length > 8 ? 1 : 0;
}

function hasUsageInstructions(text) {
  return /take|dosage|daily|per day/i.test(text);
}

function calculateSimpScore(text) {
  const words = text.split(" ");
  return words.reduce((a, b) => a + b.length, 0) / words.length < 5 ? 5 : 3;
}

// --- Simple fallback keyword check ---
function isProbablyMedical(text) {
  return /(disease|syndrome|disorder|heart|infection|treatment|pain|therapy|blood|diagnosed|symptom|virus|bacteria|injury|doctor|hospital|nurse|medicine|surgery|fever|cough|allergy|pill|tablet|dose|cyst|lump|bump)/i.test(
    text
  );
}

// --- Main LLM Function ---
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
            content: `
You are MedExplain AI — a friendly medical assistant that helps explain health-related terms and conditions clearly.

Your purpose:
Explain any medical, biological, or health-related text simply and kindly, as if speaking to a patient.

When you detect a medical or scientific term, enclose it in double brackets [[like this]].
Example: "You have [[Myocardial infarction]], which means a heart attack. It happens when blood flow to the heart is blocked."

Rules:
- If the user's message is NOT about medicine, health, or biology, REPLY EXACTLY:
"This topic isn’t medical related, Please try again."
(Do NOT say anything else in that case.)
- If it IS medical, explain clearly using simple everyday words.
- NEVER say "[something]" or placeholders.
- Be warm and compassionate.
- Include short usage instructions if relevant (like dosage or care advice).
- Speak in a way that feels kind and human.
- End every medical explanation with this line:
"Note: This is for understanding only, not a medical diagnosis."
            `,
          },
          { role: "user", content: text },
        ],
      }),
    });

    const rawText = await response.text();
    console.log("Ollama raw response:", rawText);

    // Combine streaming lines
    const lines = rawText.split("\n").filter(Boolean);
    let combinedText = "";

    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        if (obj.message?.content) combinedText += obj.message.content;
      } catch {
        console.warn("Skipping invalid JSON line:", line);
      }
    }

    // --- Extract [[medical terms]] ---
    const bracketRegex = /\[\[([^\]]+)\]\]/g;
    const termsSet = new Set();
    let match;
    while ((match = bracketRegex.exec(combinedText)) !== null) {
      termsSet.add(match[1].trim());
    }

    // --- Fallback: detect capitalized medical terms if LLM misses ---
    if (termsSet.size === 0) {
      const possibleTerms = text.match(/\b[A-Z][a-zA-Z-]{3,}\b/g);
      if (possibleTerms) possibleTerms.forEach((t) => termsSet.add(t));
    }

    // --- If not medical related ---
    const isMedical = isProbablyMedical(text) || termsSet.size > 0;
    if (!isMedical) {
      return "This topic isn’t medical related, Please try again.";
    }

    // --- Save to Excel (upsert) ---
    termsSet.forEach((term) =>
      saveTermToExcel({
        term,
        misunderstood: isLikelyMisunderstood(term),
        simpScore: calculateSimpScore(combinedText),
        usageInstr: hasUsageInstructions(combinedText),
        timestamp: new Date().toISOString(),
      })
    );

    // --- Clean output ---
    const cleanText = combinedText.replace(/\[\[|\]\]/g, "");

    return cleanText || "No valid content from Ollama.";
  } catch (err) {
    console.error("LLM Error:", err);
    throw new Error("Failed to simplify text: " + err.message);
  }
}
