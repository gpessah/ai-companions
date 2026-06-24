"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Verify by calling a protected endpoint
    const res = await fetch("/api/admin/characters", {
      headers: { "x-admin-secret": secret },
    });
    if (res.ok) {
      // Store in cookie (httpOnly not possible from client, so use Secure cookie via API)
      document.cookie = `admin_secret=${encodeURIComponent(secret)}; path=/; max-age=86400; SameSite=Strict`;
      router.push("/admin");
    } else {
      setError("Invalid admin secret.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[--background] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Sparkles className="w-10 h-10 text-[--primary] mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Admin Access</h1>
          <p className="text-[--muted-foreground] text-sm mt-1">Enter your admin secret to continue</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Input
            type="password"
            label="Admin Secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            error={error}
            required
          />
          <Button type="submit" className="w-full" size="lg">
            Access Admin
          </Button>
        </form>
      </div>
    </div>
  );
}
