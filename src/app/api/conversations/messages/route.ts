import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const characterId = searchParams.get("characterId");
  if (!characterId) return NextResponse.json([]);

  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json([]);

  const conversation = await prisma.conversation.findUnique({
    where: { userId_characterId: { userId: user.id, characterId } },
    include: {
      messages: { orderBy: { createdAt: "asc" }, take: 100 },
    },
  });

  return NextResponse.json(conversation?.messages ?? []);
}
