import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { characterId } = await req.json();

  const character = await prisma.character.findUnique({ where: { id: characterId } });
  if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Create call log
  const callLog = await prisma.callLog.create({
    data: { userId: user.id, characterId, status: "INITIATED" },
  });

  // Forward to your voice provider
  let providerResponse: Record<string, any> | null = null;
  if (process.env.CALL_WEBHOOK_URL) {
    try {
      const res = await fetch(process.env.CALL_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CALL_API_KEY}`,
        },
        body: JSON.stringify({
          callId: callLog.id,
          userId: user.id,
          characterId,
          characterName: character.name,
          voiceId: character.voiceId,
        }),
      });
      providerResponse = await res.json() as Record<string, any>;

      if (providerResponse?.id) {
        await prisma.callLog.update({
          where: { id: callLog.id },
          data: { externalId: providerResponse.id, status: "ACTIVE" },
        });
      }
    } catch (e) {
      console.error("Call provider error:", e);
    }
  }

  return NextResponse.json({ callId: callLog.id, provider: providerResponse });
}

export async function PATCH(req: NextRequest) {
  const { callId, duration } = await req.json();

  await prisma.callLog.update({
    where: { id: callId },
    data: { status: "COMPLETED", duration, endedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
