import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { CharacterProfile } from "@/components/characters/character-profile";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const char = await prisma.character.findUnique({ where: { slug, isPublished: true } });
  if (!char) return {};
  return { title: `${char.name} — AI Companions`, description: char.tagline };
}

export default async function CharacterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const character = await prisma.character.findUnique({
    where: { slug, isPublished: true },
    include: {
      media: { orderBy: [{ isLocked: "asc" }, { sortOrder: "asc" }] },
      _count: { select: { favorites: true, conversations: true } },
    },
  });

  if (!character) notFound();

  return (
    <div className="min-h-screen">
      <Navbar />
      <CharacterProfile character={character} />
    </div>
  );
}
