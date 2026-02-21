export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Use POST", { status: 405 });
    }

    try {
      const body = await request.json();
      const text = body.text;
      const filterMode = body.Filter || "Chill";

      if (!text) {
        return new Response("Missing text field", { status: 400 });
      }

      const systemPrompt = filterMode === "Aggressive"
        ? `Return ONLY JSON:
{ "flagged_words": ["word1", "word2"] }
Do not explain anything.`
        : `Return ONLY JSON:
{ "flagged_words": ["word1", "word2"] }
Do not explain anything. Only flag serious profanity or hate speech.`;

      const ai = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        temperature: 0
      });

      let raw = ai.response;

      // 🛡 Extract JSON safely
      const jsonMatch = raw.match(/\{[\s\S]*\}/);

      let flagged = [];
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          flagged = parsed.flagged_words || [];
        } catch {
          flagged = [];
        }
      }

      let censoredText = text;

      flagged.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        censoredText = censoredText.replace(regex, "*****");
      });

      return new Response(
        JSON.stringify({
          mode: filterMode,
          flagged,
          result: censoredText,
          rawAI: raw // optional debug, remove in production
        }),
        { headers: { "Content-Type": "application/json" } }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Worker failure", details: err.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};
