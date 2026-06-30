import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function checkAdmin(req: NextRequest) {
  return req.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;
}

function mask(key: string) {
  if (key.length <= 8) return "••••";
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

// List configured providers (API keys masked)
export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const keys = await prisma.providerKey.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(
    keys.map((k) => ({
      id: k.id,
      provider: k.provider,
      model: k.model,
      isDefault: k.isDefault,
      maskedKey: mask(k.apiKey),
    }))
  );
}

// Create or update a provider's key/model
export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { provider, apiKey, model, isDefault } = await req.json();
  if (!provider || !apiKey || !model) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const isFirst = (await prisma.providerKey.count()) === 0;

  const saved = await prisma.providerKey.upsert({
    where: { provider },
    create: { provider, apiKey, model, isDefault: isDefault ?? isFirst },
    update: { apiKey, model, ...(isDefault !== undefined ? { isDefault } : {}) },
  });

  // Ensure only one default
  if (saved.isDefault) {
    await prisma.providerKey.updateMany({
      where: { provider: { not: provider } },
      data: { isDefault: false },
    });
  }

  return NextResponse.json({ ok: true });
}

// Set a provider as the default
export async function PATCH(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { provider } = await req.json();
  await prisma.providerKey.updateMany({ data: { isDefault: false } });
  await prisma.providerKey.update({ where: { provider }, data: { isDefault: true } });
  return NextResponse.json({ ok: true });
}

// Delete a provider
export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { provider } = await req.json();
  await prisma.providerKey.delete({ where: { provider } });
  return NextResponse.json({ ok: true });
}
