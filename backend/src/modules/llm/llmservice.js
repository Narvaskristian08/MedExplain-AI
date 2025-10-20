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
        "You are MedExplain AI. Your job is to explain medical terms simply, as if you're talking to an older person with no medical background. Use short sentences, calm and kind tone, and explain terms in plain English. Example: 'Myocardial infarction means a heart attack — when blood can’t reach part of your heart.' Avoid long lectures or advice. Just explain clearly and briefly.",
    },
    { role: "user", content: text },
  ],
}),

    });

    const data = await response.json();
    console.log("Ollama full response:", data);

    // Handle multiple response formats
    if (data.message?.content) return data.message.content;
    if (Array.isArray(data) && data[0]?.message?.content)
      return data[0].message.content;

    return "No valid content from Ollama.";
  } catch (err) {
    console.error(" LLM Error:", err);
    throw new Error("Failed to simplify text");
  }
}
