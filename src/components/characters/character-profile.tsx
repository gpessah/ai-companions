"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Phone, Heart, Lock, Play, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Media {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
  isLocked: boolean;
}

interface CharacterProfileProps {
  character: {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    description: string;
    age?: number | null;
    interests: unknown;
    avatarUrl: string;
    coverUrl?: string | null;
    voiceId?: string | null;
    media: Media[];
    _count: { favorites: number; conversations: number };
  };
}

export function CharacterProfile({ character }: CharacterProfileProps) {
  const [tab, setTab] = useState<"about" | "photos" | "videos">("about");
  const [isFavorited, setIsFavorited] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const photos = character.media.filter((m) => m.type === "IMAGE");
  const videos = character.media.filter((m) => m.type === "VIDEO");

  const toggleFavorite = async () => {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId: character.id }),
    });
    const data = await res.json();
    setIsFavorited(data.favorited);
  };

  const startCall = async () => {
    setIsCalling(true);
    try {
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: character.id }),
      });
      const data = await res.json();
      if (data.provider?.joinUrl) {
        window.open(data.provider.joinUrl, "_blank");
      } else {
        alert("Call initiated! Your voice provider will connect shortly.");
      }
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Cover + Avatar */}
      <div className="relative rounded-2xl overflow-hidden mb-16 bg-[--card]">
        <div className="h-48 md:h-64 relative">
          {character.coverUrl ? (
            <Image src={character.coverUrl} alt="" fill className="object-cover" />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: "linear-gradient(135deg, #e91e8c33, #7c3aed33)",
              }}
            />
          )}
        </div>

        <div className="absolute -bottom-12 left-6">
          <div className="relative">
            <Image
              src={character.avatarUrl}
              alt={character.name}
              width={96}
              height={96}
              className="rounded-full object-cover ring-4 ring-[--background] glow-pink"
            />
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[--background]" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {character.name}
            {character.age && (
              <span className="text-[--muted-foreground] font-normal text-2xl">, {character.age}</span>
            )}
          </h1>
          <p className="text-[--muted-foreground] mt-1">{character.tagline}</p>
          <div className="flex gap-4 mt-3 text-sm text-[--muted-foreground]">
            <span>❤️ {character._count.favorites} favorites</span>
            <span>💬 {character._count.conversations} conversations</span>
          </div>
        </div>

        <div className="flex gap-3 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={toggleFavorite}>
            <Heart className={cn("w-5 h-5", isFavorited && "fill-[--primary] text-[--primary]")} />
          </Button>
          <Button variant="outline" onClick={startCall} loading={isCalling}>
            <Phone className="w-4 h-4" /> Call
          </Button>
          <Link href={`/chat/${character.slug}`}>
            <Button>
              <MessageCircle className="w-4 h-4" /> Chat Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Interests */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(Array.isArray(character.interests) ? character.interests as string[] : []).map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 rounded-full border border-[--border] bg-[--card] text-sm text-[--muted-foreground]"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[--border]">
        {[
          { key: "about", label: "About" },
          { key: "photos", label: `Photos (${photos.length})` },
          { key: "videos", label: `Videos (${videos.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              tab === key
                ? "border-[--primary] text-[--primary]"
                : "border-transparent text-[--muted-foreground] hover:text-[--foreground]"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "about" && (
        <div className="prose prose-invert max-w-none">
          <p className="text-[--foreground] leading-relaxed whitespace-pre-line">{character.description}</p>
        </div>
      )}

      {tab === "photos" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => !photo.isLocked && setLightbox(photo.url)}
            >
              <Image
                src={photo.url}
                alt={photo.caption ?? ""}
                fill
                className={cn(
                  "object-cover transition-transform group-hover:scale-105",
                  photo.isLocked && "blur-md"
                )}
              />
              {photo.isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              )}
              {photo.caption && !photo.isLocked && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "videos" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group bg-[--card]"
            >
              {video.thumbnailUrl ? (
                <Image
                  src={video.thumbnailUrl}
                  alt={video.caption ?? ""}
                  fill
                  className={cn("object-cover", video.isLocked && "blur-md")}
                />
              ) : (
                <div className="w-full h-full bg-[--muted] flex items-center justify-center">
                  <Play className="w-8 h-8 text-[--muted-foreground]" />
                </div>
              )}
              {video.isLocked ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              ) : (
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-3xl max-h-full">
            <Image
              src={lightbox}
              alt=""
              width={800}
              height={1000}
              className="object-contain max-h-screen rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
