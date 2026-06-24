import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Users, MessageCircle, Image, Phone } from "lucide-react";

export default async function AdminDashboard() {
  const [charCount, userCount, msgCount, callCount] = await Promise.all([
    prisma.character.count(),
    prisma.user.count(),
    prisma.message.count(),
    prisma.callLog.count(),
  ]);

  const stats = [
    { label: "Characters", value: charCount, icon: Users, href: "/admin/characters" },
    { label: "Users", value: userCount, icon: Users, href: "#" },
    { label: "Messages", value: msgCount, icon: MessageCircle, href: "#" },
    { label: "Calls", value: callCount, icon: Phone, href: "#" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <div className="bg-[--card] border border-[--border] rounded-2xl p-6 hover:border-[--primary]/50 transition-colors">
              <Icon className="w-6 h-6 text-[--primary] mb-3" />
              <div className="text-3xl font-bold">{value}</div>
              <div className="text-sm text-[--muted-foreground] mt-1">{label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/admin/characters">
          <div className="bg-[--card] border border-[--border] rounded-2xl p-6 hover:border-[--primary]/50 transition-colors cursor-pointer">
            <h2 className="text-lg font-semibold mb-2">Manage Characters</h2>
            <p className="text-[--muted-foreground] text-sm">
              Add new AI companions, edit their personalities, upload photos and videos.
            </p>
          </div>
        </Link>
        <div className="bg-[--card] border border-[--border] rounded-2xl p-6 opacity-60">
          <h2 className="text-lg font-semibold mb-2">Analytics (coming soon)</h2>
          <p className="text-[--muted-foreground] text-sm">
            View conversation metrics, call durations, and user engagement.
          </p>
        </div>
      </div>
    </div>
  );
}
