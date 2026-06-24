import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/auth";
import { ChatInterface } from "@/components/chat/chat-interface";
import { notFound, redirect } from "next/navigation";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default async function ChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { userId } = await auth();

  const character = await prisma.character.findUnique({
    where: { slug, isPublished: true },
  });

  if (!character) notFound();

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[--background] px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-[--primary]/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">💬</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Sign in to chat</h2>
          <p className="text-[--muted-foreground] mb-6">
            Create a free account to start chatting with {character.name}.
          </p>
          <SignInButton mode="modal" fallbackRedirectUrl={`/chat/${slug}`}>
            <Button size="lg" className="w-full">Get Started Free</Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  const user = await getOrCreateUser();

  // Load conversation history
  let initialMessages: Array<{ role: "user" | "assistant"; content: string }> = [];
  if (user) {
    const conversation = await prisma.conversation.findUnique({
      where: { userId_characterId: { userId: user.id, characterId: character.id } },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 50 } },
    });
    if (conversation) {
      initialMessages = conversation.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
    }
  }

  return (
    <ChatInterface
      character={{
        id: character.id,
        name: character.name,
        tagline: character.tagline,
        avatarUrl: character.avatarUrl,
        slug: character.slug,
      }}
      initialMessages={initialMessages}
    />
  );
}
