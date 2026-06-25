import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { characterId } = await req.json();

  const existing = await prisma.favorite.findUnique({
    where: { userId_characterId: { userId: user.id, characterId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({ data: { userId: user.id, characterId } });
  return NextResponse.json({ favorited: true });
}
