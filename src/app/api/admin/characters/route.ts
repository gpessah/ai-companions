import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

function checkAdmin(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  return secret === process.env.ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const characters = await prisma.character.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { media: true, conversations: true } } },
  });

  return NextResponse.json(characters);
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data = await req.json();
  const slug = data.slug || slugify(data.name);

  const character = await prisma.character.create({
    data: {
      slug,
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      personality: data.personality,
      age: data.age ? parseInt(data.age) : null,
      interests: data.interests ?? [],
      avatarUrl: data.avatarUrl,
      coverUrl: data.coverUrl,
      voiceId: data.voiceId,
      aiProvider: data.aiProvider ?? "OPENAI",
      aiModel: data.aiModel ?? "gpt-4o",
      isPublished: data.isPublished ?? false,
      isFeatured: data.isFeatured ?? false,
      sortOrder: data.sortOrder ?? 0,
    },
  });

  return NextResponse.json(character);
}
