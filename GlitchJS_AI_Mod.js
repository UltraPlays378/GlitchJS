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

      // system prompt changes depending on filter
      const systemPrompt = filterMode === "Aggressive"
        ? `You are a STRICT moderation classifier. Block profanity, insults, threats, hate speech, sexual content.
Respond ONLY with valid JSON: { "safe": true or false }`
        : `You are a RELAXED moderation classifier. Allow mild slang or playful insults. Only block hate speech, real threats, explicit sexual content.
Respond ONLY with valid JSON: { "safe": true or false }`;

      const ai = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0
      });

      const parsed = JSON.parse(ai.response);
      const result = parsed.safe ? text : "*****";

      return new Response(
        JSON.stringify({ mode: filterMode, safe: parsed.safe, result }),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON or AI failure", details: err.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};
