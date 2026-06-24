import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGroq } from "@ai-sdk/groq";

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export function getModel(provider: "OPENAI" | "ANTHROPIC" | "GROQ", modelId: string) {
  if (provider === "ANTHROPIC") return anthropic(modelId || "claude-sonnet-4-6");
  if (provider === "GROQ") return groq(modelId || "llama-3.3-70b-versatile");
  return openai(modelId || "gpt-4o");
}

export function buildSystemPrompt(character: {
  name: string;
  personality: string;
  age?: number | null;
  interests: unknown;
}) {
  return `You are ${character.name}, an AI companion.${character.age ? ` You are ${character.age} years old.` : ""}

${character.personality}

Your interests include: ${(Array.isArray(character.interests) ? character.interests : []).join(", ")}.

Guidelines:
- Stay fully in character as ${character.name} at all times
- Be warm, engaging, and genuinely interested in the user
- Ask thoughtful follow-up questions
- Remember details the user shares within this conversation
- Keep responses conversational — 1-3 sentences unless the user asks for more
- Never break character or mention being an AI unless directly asked
- Be flirty and playful when appropriate, but always respectful`;
}
