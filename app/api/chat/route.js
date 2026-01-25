import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { question, context } = await req.json();

    const systemPrompt = `
You are a travel assistant.
Journey: ${context.start} → ${context.end}
Distance: ${context.distance} km
Time: ${context.time} hrs

Hotels on route:
${context.hotels
  .map((h) => `- ${h.name} (₹${h.price || "N/A"})`)
  .join("\n")}

Answer user questions about:
- best stops
- budget stays
- arrival time
- planning help
Be concise and helpful.
`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "RouteStay",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error(json);
      return NextResponse.json(
        { error: "AI service unavailable" },
        { status: 500 }
      );
    }

    const answer =
      json.choices?.[0]?.message?.content ||
      "I couldn't generate a response.";

    return NextResponse.json({ answer });
  } catch (e) {
    console.error("Chat error:", e);
    return NextResponse.json(
      { error: "Chat failed" },
      { status: 500 }
    );
  }
}

