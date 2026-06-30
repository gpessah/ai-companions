// Shared provider metadata — safe to import in both client and server code
// (no SDK imports here).

export interface ProviderMeta {
  id: string;
  name: string;
  defaultModel: string;
  keyHint: string;
  /** Marketing note shown in the admin UI */
  note?: string;
}

export const AI_PROVIDERS: ProviderMeta[] = [
  { id: "GROQ", name: "Groq (free tier)", defaultModel: "llama-3.3-70b-versatile", keyHint: "gsk_...", note: "Fast, free tier. Content-filtered." },
  { id: "OPENROUTER", name: "OpenRouter (uncensored models)", defaultModel: "nousresearch/hermes-3-llama-3.1-70b", keyHint: "sk-or-...", note: "Access many models incl. uncensored/roleplay-tuned. Best for adult content." },
  { id: "OPENAI", name: "OpenAI", defaultModel: "gpt-4o", keyHint: "sk-...", note: "Prohibits explicit content." },
  { id: "ANTHROPIC", name: "Anthropic Claude", defaultModel: "claude-sonnet-4-6", keyHint: "sk-ant-...", note: "Prohibits explicit content." },
  { id: "GOOGLE", name: "Google Gemini (free tier)", defaultModel: "gemini-2.0-flash", keyHint: "AIza...", note: "Free tier. Strong filters." },
  { id: "XAI", name: "xAI Grok", defaultModel: "grok-2-latest", keyHint: "xai-...", note: "More lenient than most." },
  { id: "PERPLEXITY", name: "Perplexity", defaultModel: "sonar", keyHint: "pplx-..." },
  { id: "ZAI", name: "Z.AI (GLM) (free tier)", defaultModel: "glm-4-flash", keyHint: "...", note: "Free tier." },
  { id: "MISTRAL", name: "Mistral", defaultModel: "mistral-large-latest", keyHint: "..." },
  { id: "DEEPSEEK", name: "DeepSeek", defaultModel: "deepseek-chat", keyHint: "..." },
];

// OpenAI-compatible chat-completions base URLs. Anthropic uses its own SDK.
export const PROVIDER_BASE_URLS: Record<string, string> = {
  GROQ: "https://api.groq.com/openai/v1",
  OPENAI: "https://api.openai.com/v1",
  GOOGLE: "https://generativelanguage.googleapis.com/v1beta/openai",
  XAI: "https://api.x.ai/v1",
  PERPLEXITY: "https://api.perplexity.ai",
  ZAI: "https://api.z.ai/api/paas/v4",
  MISTRAL: "https://api.mistral.ai/v1",
  DEEPSEEK: "https://api.deepseek.com",
  OPENROUTER: "https://openrouter.ai/api/v1",
};

export function providerDefaultModel(provider: string): string {
  return AI_PROVIDERS.find((p) => p.id === provider)?.defaultModel ?? "gpt-4o";
}
