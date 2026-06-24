import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: { userId: user.id },
    include: {
      character: { select: { id: true, name: true, avatarUrl: true, slug: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(conversations);
}

export async function GET_MESSAGES(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const characterId = searchParams.get("characterId");
  if (!characterId) return NextResponse.json([], { status: 400 });

  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json([], { status: 401 });

  const conversation = await prisma.conversation.findUnique({
    where: { userId_characterId: { userId: user.id, characterId } },
    include: {
      messages: { orderBy: { createdAt: "asc" }, take: 100 },
    },
  });

  return NextResponse.json(conversation?.messages ?? []);
}
