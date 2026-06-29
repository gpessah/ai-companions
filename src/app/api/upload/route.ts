import { saveFile, getPublicUrl } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Admin-only: check secret header
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "media";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "bin";
  const key = `${folder}/${nanoid()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await saveFile(key, buffer);

  const publicUrl = getPublicUrl(key);
  return NextResponse.json({ publicUrl, key });
}
