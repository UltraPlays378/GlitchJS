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
        ? `You are a STRICT moderation engine.
Return ONLY valid JSON:
{ "flagged_words": ["word1", "word2"] }
Flag profanity, hate speech, sexual terms, threats.`
        : `You are a RELAXED moderation engine.
Return ONLY valid JSON:
{ "flagged_words": ["word1", "word2"] }
Only flag strong profanity, hate speech, real threats, explicit sexual content.`;

      const ai = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        temperature: 0
      });

      const parsed = JSON.parse(ai.response);
      const flagged = parsed.flagged_words || [];

      let censoredText = text;

      flagged.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        censoredText = censoredText.replace(regex, "*****");
      });

      return new Response(
        JSON.stringify({
          mode: filterMode,
          flagged,
          result: censoredText
        }),
        { headers: { "Content-Type": "application/json" } }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({ error: "AI or JSON failure", details: err.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};
