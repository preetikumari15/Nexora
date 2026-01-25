import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {
  let payload;

  try {
    payload = await req.json();
    const { question, context } = payload;

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

  const systemPrompt = `
You are a smart travel assistant for a route-based hotel finder.

Journey:
${context.start} → ${context.end}
Distance: ${context.distance} km
Time: ${context.time} hours

Hotels on route:
${context.hotels
  .slice(0, 20)
  .map(
    (h, i) =>
      `${i + 1}. ${h.name}, ₹${h.price}, rating ${h.rating || "N/A"}`
  )
  .join("\n")}

Rules:
- Suggest budget hotels under ₹1200 when asked for cheap stays
- For "best night stop", recommend a hotel around the middle of the journey
- Keep answers short, friendly, and practical
- Never invent hotels that are not in the list
`;


    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.6,
    });

    const answer = completion.choices[0].message.content;
    return NextResponse.json({ answer });
  } catch (e) {
    // Fallback if AI fails
    const { question = "", context = {} } = payload || {};
    const q = question.toLowerCase();

    let answer = `You are travelling from ${context.start} to ${context.end}. You can ask me about stops, hotels, or arrival time.`;

    if (q.includes("best") || q.includes("stop")) {
      answer = "Try looking for a hotel around the middle of your journey for a comfortable night stop.";
    } else if (q.includes("time") || q.includes("reach")) {
      answer = `The total journey is about ${context.time} hours for ${context.distance} km.`;
    }

    return NextResponse.json({ answer });
  }
}
