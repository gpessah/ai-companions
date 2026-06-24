import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function ChatsPage() {
  const user = await requireUser();

  const conversations = await prisma.conversation.findMany({
    where: { userId: user.id },
    include: {
      character: { select: { id: true, name: true, avatarUrl: true, slug: true, tagline: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <MessageCircle className="w-7 h-7 text-[--primary]" />
          Your Chats
        </h1>

        {conversations.length === 0 ? (
          <div className="text-center py-20 text-[--muted-foreground]">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No conversations yet.</p>
            <Link href="/" className="text-[--primary] hover:underline mt-2 inline-block">
              Browse companions →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => {
              const lastMsg = conv.messages[0];
              return (
                <Link key={conv.id} href={`/chat/${conv.character.slug}`}>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-[--card] border border-[--border] hover:border-[--primary]/30 transition-colors">
                    <div className="relative flex-shrink-0">
                      <Image
                        src={conv.character.avatarUrl}
                        alt={conv.character.name}
                        width={52}
                        height={52}
                        className="rounded-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[--card]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{conv.character.name}</span>
                        {lastMsg && (
                          <span className="text-xs text-[--muted-foreground]">
                            {formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[--muted-foreground] truncate">
                        {lastMsg ? lastMsg.content : conv.character.tagline}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
