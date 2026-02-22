export default {
  async fetch(request, env) {
    const data = await request.json();

    // Call the Llama model
    const llamaResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: "You are GlitchAI, a friendly AI assistant." },
        { role: "user", content: data.message }
      ]
    });

    return new Response(JSON.stringify({
      reply: llamaResponse.output[0].content
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
