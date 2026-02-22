export default {
  async fetch(request, env) {
    try {
      const { message } = await request.json();

      // Run model
      const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        messages: [
          { role: "system", content: "You are GlitchAI, a friendly assistant." },
          { role: "user", content: message }
        ]
      });

      return new Response(JSON.stringify({
        reply: response.output[0].content
      }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({
        error: err.toString()
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
