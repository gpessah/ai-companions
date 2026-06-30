import { prisma } from "./prisma";
import { getModel } from "./ai";

// Resolves the LanguageModel for a character: looks up the API key for the
// character's provider, falling back to the configured default provider.
export async function resolveModelForCharacter(character: {
  aiProvider: string;
  aiModel: string;
}) {
  let key = await prisma.providerKey.findUnique({
    where: { provider: character.aiProvider },
  });

  // Fall back to the default provider if the character's provider has no key
  if (!key) {
    key = await prisma.providerKey.findFirst({ where: { isDefault: true } });
  }
  if (!key) {
    throw new Error(
      "No AI provider is configured. Add one in Admin → AI Providers."
    );
  }

  // If we fell back to a different provider, use that provider's own model.
  const model =
    key.provider === character.aiProvider
      ? character.aiModel || key.model
      : key.model;

  return getModel(key.provider, model, key.apiKey);
}
