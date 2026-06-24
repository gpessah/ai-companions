import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function checkAdmin(req: NextRequest) {
  return req.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const character = await prisma.character.findUnique({
    where: { id },
    include: { media: { orderBy: { sortOrder: "asc" } } },
  });

  if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(character);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const data = await req.json();

  const character = await prisma.character.update({
    where: { id },
    data: {
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      personality: data.personality,
      age: data.age ? parseInt(data.age) : null,
      interests: data.interests,
      avatarUrl: data.avatarUrl,
      coverUrl: data.coverUrl,
      voiceId: data.voiceId,
      aiProvider: data.aiProvider,
      aiModel: data.aiModel,
      isPublished: data.isPublished,
      isFeatured: data.isFeatured,
      sortOrder: data.sortOrder,
    },
  });

  return NextResponse.json(character);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  await prisma.character.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
