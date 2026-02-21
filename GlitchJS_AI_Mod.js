export default {
  async fetch(request, env) {
    if (request.method !== "POST") 
      return new Response("Use POST", { status: 405 });

    const body = await request.json();
    const text = body.text || "";
    const filterMode = body.Filter || "Chill";

    // Layer 1: Hardcoded word filter
    const bannedWords = ["n-word", "slut", "kill", "rape"];
    let censoredText = text;
    bannedWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      censoredText = censoredText.replace(regex, "*****");
    });

    // Layer 2: Llama Guard contextual moderation
    let flaggedAI = [];
    if (env.AI) {
      const systemPrompt = filterMode === "Aggressive"
        ? "You are a STRICT content classifier. Return ONLY JSON: { flagged_words: [] }"
        : "You are a RELAXED content classifier. Return ONLY JSON: { flagged_words: [] }";

      const ai = await env.AI.run('@cf/meta/llama-guard-2-8b', {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        temperature: 0
      });

      // Safely extract JSON from AI output
      const jsonMatch = ai.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          flaggedAI = JSON.parse(jsonMatch[0]).flagged_words || [];
        } catch {}
      }

      // Censor AI-flagged words
      flaggedAI.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        censoredText = censoredText.replace(regex, "*****");
      });
    }

    return new Response(JSON.stringify({
      mode: filterMode,
      flagged: bannedWords.concat(flaggedAI),
      result: censoredText,
      rawAI: env.AI ? ai.response : null
    }), { headers: { "Content-Type": "application/json" } });
  }
};
