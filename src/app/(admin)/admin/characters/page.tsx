import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminCharactersPage() {
  const characters = await prisma.character.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { media: true, conversations: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Characters</h1>
        <Link href="/admin/characters/new">
          <Button>
            <Plus className="w-4 h-4" /> New Character
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {characters.map((char) => (
          <div
            key={char.id}
            className="flex items-center gap-4 bg-[--card] border border-[--border] rounded-2xl p-4"
          >
            <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
              <Image src={char.avatarUrl} alt={char.name} fill className="object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{char.name}</h3>
                {char.isFeatured && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[--primary]/20 text-[--primary]">
                    Featured
                  </span>
                )}
                {!char.isPublished && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                    Draft
                  </span>
                )}
              </div>
              <p className="text-sm text-[--muted-foreground] truncate">{char.tagline}</p>
              <div className="flex gap-4 mt-1 text-xs text-[--muted-foreground]">
                <span>🖼 {char._count.media} media</span>
                <span>💬 {char._count.conversations} chats</span>
                <span>AI: {char.aiProvider} / {char.aiModel}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/characters/${char.slug}`} target="_blank">
                <Button variant="ghost" size="icon">
                  {char.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
              </Link>
              <Link href={`/admin/characters/${char.id}`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" /> Edit
                </Button>
              </Link>
            </div>
          </div>
        ))}

        {characters.length === 0 && (
          <div className="text-center py-20 text-[--muted-foreground]">
            <p>No characters yet.</p>
            <Link href="/admin/characters/new" className="text-[--primary] hover:underline mt-2 inline-block">
              Create your first character →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
