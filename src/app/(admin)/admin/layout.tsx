import Link from "next/link";
import { Sparkles, LayoutDashboard, Users, LogOut, Bot } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[--background]">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-[--border] bg-[--card] flex flex-col">
        <div className="p-6 border-b border-[--border]">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-lg">
            <Sparkles className="w-5 h-5 text-[--primary]" />
            <span className="gradient-text">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <SideLink href="/admin" icon={LayoutDashboard}>Dashboard</SideLink>
          <SideLink href="/admin/characters" icon={Users}>Characters</SideLink>
          <SideLink href="/admin/ai" icon={Bot}>AI Providers</SideLink>
        </nav>

        <div className="p-4 border-t border-[--border]">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[--muted-foreground] hover:text-[--foreground] hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}

function SideLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[--muted-foreground] hover:text-[--foreground] hover:bg-white/5 transition-colors"
    >
      <Icon className="w-4 h-4" />
      {children}
    </Link>
  );
}
