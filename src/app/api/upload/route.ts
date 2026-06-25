import { getUploadUrl } from "@/lib/storage";
import { requireAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

// Install nanoid: npm install nanoid
export async function POST(req: NextRequest) {
  // Admin-only: check secret header
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { filename, contentType, folder } = await req.json();
  const ext = filename.split(".").pop();
  const key = `${folder ?? "media"}/${nanoid()}.${ext}`;

  const { url } = await getUploadUrl(key, contentType);
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

  return NextResponse.json({ uploadUrl: url, publicUrl, key });
}
