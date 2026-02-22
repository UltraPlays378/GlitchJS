export default {
  async fetch(request, env) {
    try {
      const { message } = await request.json();

      if (!env.AI) throw new Error("AI binding missing!");

      const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        messages: [
          { role: "system", content: "You are GlitchAI, a friendly assistant." },
          { role: "user", content: message }
        ]
      });

      // Safe null check
      const reply = response?.output?.[0]?.content ?? "Sorry, no response from AI!";

      return new Response(JSON.stringify({ reply }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.toString() }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
