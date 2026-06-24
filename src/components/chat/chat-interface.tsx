"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { Send, Phone, Heart, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  character: {
    id: string;
    name: string;
    tagline: string;
    avatarUrl: string;
    slug: string;
  };
  initialMessages?: Array<{ role: "user" | "assistant"; content: string }>;
}

export function ChatInterface({ character, initialMessages = [] }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { characterId: character.id },
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Prepend history messages on mount (AI SDK v6 doesn't have initialMessages in options)
  const [seeded, setSeeded] = useState(false);
  const allMessages = seeded || initialMessages.length === 0
    ? messages
    : [
        ...initialMessages.map((m, i) => ({
          id: `seed-${i}`,
          role: m.role as "user" | "assistant",
          parts: [{ type: "text" as const, text: m.content }],
          metadata: {} as Record<string, unknown>,
        })),
        ...messages,
      ];

  useEffect(() => {
    if (messages.length > 0) setSeeded(true);
  }, [messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    setSeeded(true);
    sendMessage({ text: inputValue });
    setInputValue("");
  };

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

  const getMessageText = (msg: any): string => {
    if (Array.isArray(msg.parts)) {
      return msg.parts
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("");
    }
    if (typeof msg.content === "string") return msg.content;
    return "";
  };

  return (
    <div className="flex flex-col h-screen bg-[--background]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[--border] bg-[--card]">
        <Link href="/" className="text-[--muted-foreground] hover:text-[--foreground] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="relative">
          <Image
            src={character.avatarUrl}
            alt={character.name}
            width={40}
            height={40}
            className="rounded-full object-cover ring-2 ring-[--primary]"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[--card]" />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm truncate">{character.name}</h2>
          <p className="text-xs text-[--muted-foreground] truncate">{character.tagline}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorite}
            className={cn(isFavorited && "text-[--primary]")}
          >
            <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} />
          </Button>
          <Button variant="outline" size="sm" onClick={startCall} loading={isCalling} className="gap-1.5">
            <Phone className="w-4 h-4" /> Call
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {allMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <Image
              src={character.avatarUrl}
              alt={character.name}
              width={80}
              height={80}
              className="rounded-full object-cover ring-4 ring-[--primary]/30 glow-pink"
            />
            <div>
              <h3 className="font-bold text-xl">{character.name}</h3>
              <p className="text-[--muted-foreground] text-sm mt-1">{character.tagline}</p>
            </div>
            <p className="text-[--muted-foreground] text-sm max-w-xs">Say hello to start the conversation! ✨</p>
          </div>
        )}

        {allMessages.map((message) => {
          const text = getMessageText(message);
          if (!text) return null;
          return (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 message-in",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {message.role === "assistant" && (
                <Image
                  src={character.avatarUrl}
                  alt={character.name}
                  width={32}
                  height={32}
                  className="rounded-full object-cover flex-shrink-0 self-end"
                />
              )}
              <div
                className={cn(
                  "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-[--primary] text-white rounded-br-sm"
                    : "bg-[--card] border border-[--border] text-[--foreground] rounded-bl-sm"
                )}
              >
                {text}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3">
            <Image
              src={character.avatarUrl}
              alt={character.name}
              width={32}
              height={32}
              className="rounded-full object-cover flex-shrink-0 self-end"
            />
            <div className="bg-[--card] border border-[--border] rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 bg-[--muted-foreground] rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-[--border] bg-[--card]">
        <form onSubmit={handleSend} className="flex gap-3 items-center">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Message ${character.name}...`}
            className="flex-1 bg-[--input] border border-[--border] rounded-xl px-4 py-3 text-sm text-[--foreground] placeholder:text-[--muted-foreground] focus:outline-none focus:ring-2 focus:ring-[--primary] transition-all"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!inputValue.trim() || isLoading} className="h-11 w-11">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
