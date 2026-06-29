"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { Trash2, Lock, Unlock, Upload, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminSecret } from "@/lib/admin-client";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
  isLocked: boolean;
  sortOrder: number;
}

interface MediaManagerProps {
  characterId: string;
  initialMedia: MediaItem[];
}

export function MediaManager({ characterId, initialMedia }: MediaManagerProps) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const topInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList) => {
    setUploading(true);
    const secret = getAdminSecret();

    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith("video/");
      try {
        // Upload the file to local storage
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "media");
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "x-admin-secret": secret },
          body: fd,
        });
        const { publicUrl } = await res.json();

        // Save to DB
        const mediaRes = await fetch("/api/admin/media", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-secret": secret },
          body: JSON.stringify({
            characterId,
            type: isVideo ? "VIDEO" : "IMAGE",
            url: publicUrl,
            isLocked: false,
            sortOrder: media.length,
          }),
        });
        const newMedia = await mediaRes.json();
        setMedia((prev) => [...prev, newMedia]);
      } catch (err) {
        console.error("Upload failed:", err);
        alert(`Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
  };

  const toggleLock = async (item: MediaItem) => {
    const res = await fetch("/api/admin/media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-secret": getAdminSecret() },
      body: JSON.stringify({ id: item.id, isLocked: !item.isLocked }),
    });
    const updated = await res.json();
    setMedia((prev) => prev.map((m) => (m.id === item.id ? updated : m)));
  };

  const deleteMedia = async (id: string) => {
    if (!confirm("Delete this media? This cannot be undone.")) return;
    await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-secret": getAdminSecret() },
      body: JSON.stringify({ id }),
    });
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const updateCaption = async (id: string, caption: string) => {
    await fetch("/api/admin/media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-secret": getAdminSecret() },
      body: JSON.stringify({ id, caption }),
    });
    setMedia((prev) => prev.map((m) => (m.id === id ? { ...m, caption } : m)));
  };

  const filtered = media.filter((m) => m.type === tab);

  return (
    <div className="space-y-6">
      {/* Tab + Upload */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(["IMAGE", "VIDEO"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                tab === t
                  ? "bg-[--primary] text-white"
                  : "text-[--muted-foreground] hover:text-[--foreground] hover:bg-white/5"
              )}
            >
              {t === "IMAGE" ? "📸 Photos" : "🎬 Videos"}{" "}
              <span className="opacity-60">({media.filter((m) => m.type === t).length})</span>
            </button>
          ))}
        </div>

        <div>
          <Button
            variant="outline"
            loading={uploading}
            type="button"
            onClick={() => topInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading..." : `Upload ${tab === "IMAGE" ? "Photos" : "Videos"}`}
          </Button>
          <input
            ref={topInputRef}
            type="file"
            multiple
            accept={tab === "IMAGE" ? "image/*" : "video/*"}
            className="hidden"
            onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          />
        </div>
      </div>

      {/* Media grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((item) => (
          <div key={item.id} className="group relative rounded-xl overflow-hidden bg-[--card] border border-[--border]">
            {/* Thumbnail */}
            <div className="relative aspect-square">
              {item.type === "IMAGE" ? (
                <Image src={item.url} alt={item.caption ?? ""} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-[--muted] flex items-center justify-center">
                  {item.thumbnailUrl ? (
                    <Image src={item.thumbnailUrl} alt="" fill className="object-cover" />
                  ) : (
                    <Play className="w-8 h-8 text-[--muted-foreground]" />
                  )}
                </div>
              )}

              {/* Lock badge */}
              {item.isLocked && (
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur text-xs text-white flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked
                </div>
              )}

              {/* Actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleLock(item)}
                  className="w-7 h-7 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white hover:bg-black/80"
                >
                  {item.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => deleteMedia(item.id)}
                  className="w-7 h-7 rounded-full bg-red-600/80 backdrop-blur flex items-center justify-center text-white hover:bg-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Caption */}
            <div className="p-2">
              <input
                defaultValue={item.caption ?? ""}
                placeholder="Caption..."
                onBlur={(e) => updateCaption(item.id, e.target.value)}
                className="w-full text-xs bg-transparent text-[--muted-foreground] placeholder:text-[--border] focus:outline-none focus:text-[--foreground]"
              />
            </div>
          </div>
        ))}

        {/* Drop zone */}
        <label className="cursor-pointer aspect-square rounded-xl border-2 border-dashed border-[--border] hover:border-[--primary]/50 flex flex-col items-center justify-center gap-2 text-[--muted-foreground] hover:text-[--primary] transition-colors">
          <Upload className="w-6 h-6" />
          <span className="text-xs">Add more</span>
          <input
            type="file"
            multiple
            accept={tab === "IMAGE" ? "image/*" : "video/*"}
            className="hidden"
            onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          />
        </label>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-[--muted-foreground] text-sm">
          No {tab.toLowerCase()}s yet. Upload some above.
        </div>
      )}
    </div>
  );
}
