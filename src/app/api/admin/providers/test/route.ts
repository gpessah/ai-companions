import { generateText } from "ai";
import { getModel } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function checkAdmin(req: NextRequest) {
  return req.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;
}

// Validates a provider key by doing a tiny generation.
export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { provider, apiKey, model } = await req.json();
  if (!provider || !apiKey || !model) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  try {
    const { text } = await generateText({
      model: getModel(provider, model, apiKey),
      prompt: "Reply with the single word: ok",
      maxOutputTokens: 5,
    });
    return NextResponse.json({ ok: true, sample: text.trim().slice(0, 40) });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message.slice(0, 200) });
  }
}
