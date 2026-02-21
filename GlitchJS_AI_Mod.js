export default {
  async fetch(request, env) {
    try {
      // Only allow POST
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Use POST only" }), {
          status: 405,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Parse request JSON safely
      let body = {};
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

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
      let rawAI = null;

      if (env.AI) {
        const systemPrompt = filterMode === "Aggressive"
          ? "You are a STRICT content classifier. Return ONLY JSON: { flagged_words: [] }"
          : "You are a RELAXED content classifier. Return ONLY JSON: { flagged_words: [] }";

        try {
          const ai = await env.AI.run('@cf/meta/llama-guard-2-8b', {
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: text }
            ],
            temperature: 0
          });

          rawAI = ai.response;

          // Safely extract JSON from AI response
          const jsonMatch = rawAI.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              flaggedAI = JSON.parse(jsonMatch[0]).flagged_words || [];
            } catch {}
          }

          // Censor flagged AI words
          flaggedAI.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, "gi");
            censoredText = censoredText.replace(regex, "*****");
          });
        } catch (aiErr) {
          // If AI fails, continue with hardcoded filter only
          rawAI = `AI error: ${aiErr.message}`;
        }
      }

      // Combine flagged words
      const allFlagged = [...new Set([...bannedWords, ...flaggedAI])];

      // Return clean JSON response
      return new Response(JSON.stringify({
        mode: filterMode,
        flagged: allFlagged,
        result: censoredText,
        rawAI
      }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      // Catch-all to prevent Worker from throwing
      return new Response(JSON.stringify({
        error: "Worker failure",
        details: err.message,
        stack: err.stack
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
