import { AiProviderManager } from "@/components/admin/ai-provider-manager";

export const dynamic = "force-dynamic";

export default function AdminAiPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-1">AI Providers</h1>
      <p className="text-[--muted-foreground] text-sm mb-8">
        Add API keys for the AI providers you want to use. Test each one, then set a default.
        Characters use their selected provider, falling back to the default.
      </p>
      <AiProviderManager />
    </div>
  );
}
