"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Star, CheckCircle2, XCircle } from "lucide-react";
import { getAdminSecret } from "@/lib/admin-client";
import { AI_PROVIDERS, providerDefaultModel } from "@/lib/ai-providers";

interface ProviderRow {
  id: string;
  provider: string;
  model: string;
  isDefault: boolean;
  maskedKey: string;
}

export function AiProviderManager() {
  const [rows, setRows] = useState<ProviderRow[]>([]);
  const [provider, setProvider] = useState(AI_PROVIDERS[0].id);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(AI_PROVIDERS[0].defaultModel);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const secret = () => getAdminSecret();

  const load = async () => {
    const res = await fetch("/api/admin/providers", { headers: { "x-admin-secret": secret() } });
    if (res.ok) setRows(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const onProviderChange = (id: string) => {
    setProvider(id);
    setModel(providerDefaultModel(id));
    setResult(null);
  };

  const testAndSave = async () => {
    setTesting(true);
    setResult(null);
    try {
      // 1. Test the key
      const testRes = await fetch("/api/admin/providers/test", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": secret() },
        body: JSON.stringify({ provider, apiKey, model }),
      });
      const test = await testRes.json();
      if (!test.ok) {
        setResult({ ok: false, msg: test.error || "Test failed" });
        setTesting(false);
        return;
      }
      // 2. Save it
      await fetch("/api/admin/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": secret() },
        body: JSON.stringify({ provider, apiKey, model }),
      });
      setResult({ ok: true, msg: `Works! Replied: "${test.sample}"` });
      setApiKey("");
      await load();
    } finally {
      setTesting(false);
    }
  };

  const setDefault = async (p: string) => {
    await fetch("/api/admin/providers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret() },
      body: JSON.stringify({ provider: p }),
    });
    await load();
  };

  const remove = async (p: string) => {
    if (!confirm(`Remove ${p}?`)) return;
    await fetch("/api/admin/providers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret() },
      body: JSON.stringify({ provider: p }),
    });
    await load();
  };

  const meta = AI_PROVIDERS.find((p) => p.id === provider);

  return (
    <div className="space-y-8">
      {/* Add / update form */}
      <div className="rounded-2xl border border-[--border] bg-[--card] p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[--muted-foreground]">Provider</label>
            <select
              value={provider}
              onChange={(e) => onProviderChange(e.target.value)}
              className="rounded-xl border border-[--border] bg-[--input] px-4 py-2.5 text-sm text-[--foreground] focus:outline-none focus:ring-2 focus:ring-[--primary]"
            >
              {AI_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <Input
            label="API Key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={meta?.keyHint}
          />
          <Input
            label="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={meta?.defaultModel}
          />
        </div>

        {meta?.note && <p className="text-xs text-[--muted-foreground]">ℹ️ {meta.note}</p>}

        <div className="flex items-center gap-3">
          <Button type="button" onClick={testAndSave} loading={testing} disabled={!apiKey || !model}>
            Test + Save
          </Button>
          {result && (
            <span className={`text-sm flex items-center gap-1.5 ${result.ok ? "text-green-400" : "text-red-400"}`}>
              {result.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {result.msg}
            </span>
          )}
        </div>
        <p className="text-xs text-[--muted-foreground]">
          Default model: <code className="text-[--foreground]">{meta?.defaultModel}</code>
        </p>
      </div>

      {/* Configured providers */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-[--muted-foreground] uppercase tracking-wide">Configured</h2>
        {rows.length === 0 && (
          <p className="text-sm text-[--muted-foreground]">No providers yet. Add one above.</p>
        )}
        {rows.map((r) => {
          const name = AI_PROVIDERS.find((p) => p.id === r.provider)?.name ?? r.provider;
          return (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-[--border] bg-[--card] px-4 py-3">
              <div>
                <div className="flex items-center gap-2 font-medium">
                  {name}
                  {r.isDefault && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[--primary]/20 text-[--primary]">default</span>
                  )}
                </div>
                <div className="text-xs text-[--muted-foreground] mt-0.5">
                  {r.maskedKey} · model: {r.model}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!r.isDefault && (
                  <button
                    onClick={() => setDefault(r.provider)}
                    title="Set as default"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[--muted-foreground] hover:text-[--primary] hover:bg-white/5"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => remove(r.provider)}
                  title="Delete"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
