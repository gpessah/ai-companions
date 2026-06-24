import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { userId } = await auth();

  const character = await prisma.character.findUnique({
    where: { slug, isPublished: true },
    include: {
      media: { orderBy: [{ isLocked: "asc" }, { sortOrder: "asc" }] },
      _count: { select: { favorites: true } },
    },
  });

  if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let isFavorited = false;
  if (userId) {
    const user = await getOrCreateUser();
    if (user) {
      const fav = await prisma.favorite.findUnique({
        where: { userId_characterId: { userId: user.id, characterId: character.id } },
      });
      isFavorited = !!fav;
    }
  }

  return NextResponse.json({ ...character, isFavorited });
}
