import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CharacterForm } from "@/components/admin/character-form";
import { MediaManager } from "@/components/admin/media-manager";

export default async function EditCharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const character = await prisma.character.findUnique({
    where: { id },
    include: { media: { orderBy: { sortOrder: "asc" } } },
  });

  if (!character) notFound();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-8">Edit — {character.name}</h1>
        <CharacterForm character={character} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Media</h2>
        <MediaManager characterId={character.id} initialMedia={character.media} />
      </div>
    </div>
  );
}
