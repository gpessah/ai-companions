import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { Navbar } from "@/components/layout/navbar";
import { CharacterCard } from "@/components/characters/character-card";
import { Heart } from "lucide-react";
import Link from "next/link";

export default async function FavoritesPage() {
  const user = await requireUser();

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      character: {
        include: { _count: { select: { favorites: true, conversations: true } } },
      },
    },
  });

  const characters = favorites.map((f) => f.character);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <Heart className="w-7 h-7 text-[--primary] fill-current" />
          Favorites
        </h1>

        {characters.length === 0 ? (
          <div className="text-center py-20 text-[--muted-foreground]">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No favorites yet.</p>
            <Link href="/" className="text-[--primary] hover:underline mt-2 inline-block">
              Browse companions →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {characters.map((char) => (
              <CharacterCard key={char.id} character={char} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
