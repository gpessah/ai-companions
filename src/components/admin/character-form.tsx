"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAdminSecret } from "@/lib/admin-client";

interface CharacterData {
  id?: string;
  name?: string;
  tagline?: string;
  description?: string;
  personality?: string;
  age?: number | null;
  interests?: unknown;
  avatarUrl?: string;
  coverUrl?: string | null;
  voiceId?: string | null;
  aiProvider?: string;
  aiModel?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

interface CharacterFormProps {
  character?: CharacterData;
}

export function CharacterForm({ character }: CharacterFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: character?.name ?? "",
    tagline: character?.tagline ?? "",
    description: character?.description ?? "",
    personality:
      character?.personality ??
      "You are a warm, playful, and engaging AI companion. You love deep conversations, have a great sense of humor, and genuinely care about the person you're talking to.",
    age: character?.age?.toString() ?? "",
    interests: Array.isArray(character?.interests) ? (character.interests as string[]).join(", ") : "",
    avatarUrl: character?.avatarUrl ?? "",
    coverUrl: character?.coverUrl ?? "",
    voiceId: character?.voiceId ?? "",
    aiProvider: character?.aiProvider ?? "OPENAI",
    aiModel: character?.aiModel ?? "gpt-4o",
    isPublished: character?.isPublished ?? false,
    isFeatured: character?.isFeatured ?? false,
    sortOrder: character?.sortOrder?.toString() ?? "0",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const uploadFile = async (
    file: File,
    field: "avatarUrl" | "coverUrl",
    setUploading: (v: boolean) => void
  ) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "avatars");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-admin-secret": getAdminSecret() },
        body: fd,
      });
      const { publicUrl } = await res.json();
      setForm((f) => ({ ...f, [field]: publicUrl }));
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      age: form.age ? parseInt(form.age) : null,
      interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean),
      sortOrder: parseInt(form.sortOrder) || 0,
    };

    const url = character?.id
      ? `/api/admin/characters/${character.id}`
      : "/api/admin/characters";
    const method = character?.id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "x-admin-secret": getAdminSecret() },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/characters/${data.id}`);
      router.refresh();
    } else {
      alert("Error saving character");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={submit} className="space-y-6 max-w-2xl">
      {/* Basic info */}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Name *" value={form.name} onChange={set("name")} required />
        <Input label="Age" type="number" value={form.age} onChange={set("age")} />
      </div>

      <Input label="Tagline *" value={form.tagline} onChange={set("tagline")} required placeholder="e.g. Your adventurous travel buddy" />

      <Textarea label="Description" value={form.description} onChange={set("description")} rows={4} placeholder="Tell users about this character..." />

      <Textarea
        label="Personality Prompt *"
        value={form.personality}
        onChange={set("personality")}
        rows={6}
        required
        placeholder="This is the AI system prompt. Describe personality, tone, backstory..."
      />

      <Input label="Interests (comma separated)" value={form.interests} onChange={set("interests")} placeholder="travel, music, cooking, art" />

      {/* AI settings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[--muted-foreground]">AI Provider</label>
          <select
            value={form.aiProvider}
            onChange={set("aiProvider")}
            className="rounded-xl border border-[--border] bg-[--input] px-4 py-2.5 text-sm text-[--foreground] focus:outline-none focus:ring-2 focus:ring-[--primary]"
          >
            <option value="OPENAI">OpenAI</option>
            <option value="ANTHROPIC">Anthropic (Claude)</option>
          </select>
        </div>
        <Input
          label="Model ID"
          value={form.aiModel}
          onChange={set("aiModel")}
          placeholder={form.aiProvider === "OPENAI" ? "gpt-4o" : "claude-sonnet-4-6"}
        />
      </div>

      <Input label="Voice ID (optional)" value={form.voiceId} onChange={set("voiceId")} placeholder="ElevenLabs or other voice provider ID" />

      {/* Avatar */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[--muted-foreground]">Avatar Image *</label>
        {form.avatarUrl && (
          <img src={form.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
        )}
        <div className="flex gap-2 items-center">
          <Input
            value={form.avatarUrl}
            onChange={set("avatarUrl")}
            placeholder="https://... or upload below"
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            type="button"
            loading={uploadingAvatar}
            onClick={() => avatarInputRef.current?.click()}
          >
            Upload
          </Button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file, "avatarUrl", setUploadingAvatar);
            }}
          />
        </div>
      </div>

      {/* Cover */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[--muted-foreground]">Cover Image (optional)</label>
        {form.coverUrl && (
          <img src={form.coverUrl} alt="Cover" className="w-full h-32 rounded-xl object-cover" />
        )}
        <div className="flex gap-2 items-center">
          <Input
            value={form.coverUrl}
            onChange={set("coverUrl")}
            placeholder="https://..."
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            type="button"
            loading={uploadingCover}
            onClick={() => coverInputRef.current?.click()}
          >
            Upload
          </Button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file, "coverUrl", setUploadingCover);
            }}
          />
        </div>
      </div>

      {/* Flags */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
            className="w-4 h-4 accent-[--primary]"
          />
          <span className="text-sm">Published (visible to users)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
            className="w-4 h-4 accent-[--primary]"
          />
          <span className="text-sm">Featured</span>
        </label>
      </div>

      <Input label="Sort Order" type="number" value={form.sortOrder} onChange={set("sortOrder")} />

      <Button type="submit" size="lg" loading={loading}>
        {character?.id ? "Save Changes" : "Create Character"}
      </Button>
    </form>
  );
}
