import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const characters = await prisma.character.findMany({
    where: { isPublished: true },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { favorites: true, conversations: true } },
      media: {
        where: { isLocked: false, type: "IMAGE" },
        orderBy: { sortOrder: "asc" },
        take: 3,
      },
    },
  });

  return NextResponse.json(characters);
}
