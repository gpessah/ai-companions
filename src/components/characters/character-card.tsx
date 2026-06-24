"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CharacterCardProps {
  character: {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    age?: number | null;
    interests: unknown;
    avatarUrl: string;
    isFeatured: boolean;
    _count?: { favorites: number; conversations: number };
  };
}

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <Link href={`/characters/${character.slug}`}>
      <div className="group relative rounded-2xl overflow-hidden bg-[--card] border border-[--border] card-hover cursor-pointer">
        {/* Avatar */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={character.avatarUrl}
            alt={character.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Featured badge */}
          {character.isFeatured && (
            <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-[--primary] text-white text-xs font-semibold">
              ✨ Featured
            </div>
          )}

          {/* Stats */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-xs text-white">
            <Heart className="w-3 h-3 text-[--primary]" />
            {character._count?.favorites ?? 0}
          </div>

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-bold text-lg leading-tight">
              {character.name}
              {character.age ? <span className="font-normal text-base">, {character.age}</span> : null}
            </h3>
            <p className="text-white/70 text-sm mt-0.5 line-clamp-2">{character.tagline}</p>

            {/* Interests */}
            <div className="flex flex-wrap gap-1 mt-2">
              {(Array.isArray(character.interests) ? character.interests as string[] : []).slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-white/10 text-white/80 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action row */}
        <div className="p-3 flex gap-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/chat/${character.slug}`;
            }}
          >
            <MessageCircle className="w-4 h-4" /> Chat
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/characters/${character.slug}#call`;
            }}
          >
            <Phone className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
}
