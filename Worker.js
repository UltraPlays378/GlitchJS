export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const { pathname } = url;

      const { message } = await request.json();

      if (!env.AI) throw new Error("AI binding missing!");

      let responseContent;

      if (pathname === "/chat") {
        // Chat endpoint using Llama
        const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
          messages: [
            { role: "system", content: "You are GlitchAI, a friendly and helpful assistant." },
            { role: "user", content: message }
          ]
        });

        responseContent = response?.output?.[0]?.content ?? "Sorry, I didn't get a response from the AI!";
      } 
      else if (pathname === "/moderation") {
        // Moderation endpoint using Llama Guard
        const response = await env.AI.run("@cf/meta/llama-guard-3-8b", {
          input: message
        });

        responseContent = response?.output?.[0]?.content ?? "Could not classify the content!";
      } 
      else {
        return new Response(JSON.stringify({
          error: "Unknown endpoint. Use /chat or /moderation"
        }), { status: 404, headers: { "Content-Type": "application/json" }});
      }

      return new Response(JSON.stringify({ reply: responseContent }), {
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
