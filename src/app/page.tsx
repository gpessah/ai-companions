import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";

export const dynamic = "force-dynamic";
import { CharacterCard } from "@/components/characters/character-card";
import { Sparkles, MessageCircle, Phone, Shield } from "lucide-react";

async function getCharacters() {
  return prisma.character.findMany({
    where: { isPublished: true },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
    include: {
      _count: { select: { favorites: true, conversations: true } },
    },
  });
}

export default async function HomePage() {
  const characters = await getCharacters();
  const featured = characters.filter((c) => c.isFeatured);
  const rest = characters.filter((c) => !c.isFeatured);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, #e91e8c 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, #7c3aed 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[--primary]/30 bg-[--primary]/10 text-[--primary] text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Companions
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Meet Your{" "}
            <span className="gradient-text">Perfect Match</span>
          </h1>
          <p className="text-[--muted-foreground] text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Chat with beautiful AI companions who remember you, understand you, and are always there for you — day or night.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-[--muted-foreground]">
            {[
              { icon: MessageCircle, label: "Intelligent Chat" },
              { icon: Phone, label: "AI Voice Calls" },
              { icon: Shield, label: "Private & Secure" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-[--primary]" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Characters grid */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        {featured.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[--primary]" />
              Featured Companions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
              {featured.map((char) => (
                <CharacterCard key={char.id} character={char} />
              ))}
            </div>
          </>
        )}

        {rest.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-6">All Companions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {rest.map((char) => (
                <CharacterCard key={char.id} character={char} />
              ))}
            </div>
          </>
        )}

        {characters.length === 0 && (
          <div className="text-center py-32 text-[--muted-foreground]">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No companions yet. Add some from the admin panel!</p>
          </div>
        )}
      </section>
    </div>
  );
}
