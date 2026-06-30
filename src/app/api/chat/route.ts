import { streamText } from "ai";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { buildSystemPrompt } from "@/lib/ai";
import { resolveModelForCharacter } from "@/lib/resolve-model";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { messages, characterId } = await req.json();

  const [user, character] = await Promise.all([
    getOrCreateUser(),
    prisma.character.findUnique({ where: { id: characterId } }),
  ]);

  if (!user || !character) return new Response("Not found", { status: 404 });

  const conversation = await prisma.conversation.upsert({
    where: { userId_characterId: { userId: user.id, characterId } },
    create: { userId: user.id, characterId },
    update: { updatedAt: new Date() },
  });

  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.role === "user") {
    const content =
      typeof lastMessage.content === "string"
        ? lastMessage.content
        : (lastMessage.content?.[0]?.text ?? "");
    await prisma.message.create({
      data: { conversationId: conversation.id, role: "user", content },
    });
  }

  let model;
  try {
    model = await resolveModelForCharacter(character);
  } catch (e) {
    return new Response((e as Error).message, { status: 400 });
  }

  const result = streamText({
    model,
    system: buildSystemPrompt(character),
    messages,
    maxOutputTokens: 500,
    onFinish: async ({ text }) => {
      await prisma.message.create({
        data: { conversationId: conversation.id, role: "assistant", content: text },
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
