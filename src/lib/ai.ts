import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { PROVIDER_BASE_URLS, providerDefaultModel } from "./ai-providers";

// Returns a LanguageModel for the given provider, using the provided API key.
// All OpenAI-compatible providers go through the OpenAI client with a custom
// base URL; Anthropic uses its own SDK.
export function getModel(provider: string, modelId: string, apiKey: string) {
  const model = modelId || providerDefaultModel(provider);

  if (provider === "ANTHROPIC") {
    return createAnthropic({ apiKey })(model);
  }

  const baseURL = PROVIDER_BASE_URLS[provider] ?? PROVIDER_BASE_URLS.OPENAI;
  // .chat() forces the chat-completions endpoint, which every OpenAI-compatible
  // provider supports (the default callable uses the Responses API).
  return createOpenAI({ apiKey, baseURL }).chat(model);
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
