import { prisma } from "@/lib/prisma";
import { deleteFile, keyFromUrl } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function checkAdmin(req: NextRequest) {
  return req.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data = await req.json();

  const media = await prisma.media.create({
    data: {
      characterId: data.characterId,
      type: data.type,
      url: data.url,
      thumbnailUrl: data.thumbnailUrl,
      caption: data.caption,
      isLocked: data.isLocked ?? false,
      sortOrder: data.sortOrder ?? 0,
    },
  });

  return NextResponse.json(media);
}

export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await req.json();
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete from R2
  try {
    await deleteFile(keyFromUrl(media.url));
    if (media.thumbnailUrl) await deleteFile(keyFromUrl(media.thumbnailUrl));
  } catch {}

  await prisma.media.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, ...data } = await req.json();
  const media = await prisma.media.update({ where: { id }, data });
  return NextResponse.json(media);
}
