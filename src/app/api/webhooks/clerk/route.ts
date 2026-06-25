import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headerPayload = await headers();

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  let evt: any;

  try {
    evt = wh.verify(body, {
      "svix-id": headerPayload.get("svix-id")!,
      "svix-timestamp": headerPayload.get("svix-timestamp")!,
      "svix-signature": headerPayload.get("svix-signature")!,
    });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    await prisma.user.upsert({
      where: { clerkId: id },
      create: {
        clerkId: id,
        email: email_addresses[0]?.email_address ?? "",
        name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
        avatar: image_url,
      },
      update: {},
    });
  }

  if (evt.type === "user.deleted") {
    await prisma.user.deleteMany({ where: { clerkId: evt.data.id } });
  }

  return NextResponse.json({ ok: true });
}
