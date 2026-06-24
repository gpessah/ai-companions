"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton, useAuth } from "@clerk/nextjs";
import { Heart, MessageCircle, Phone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-[--border] bg-[--background]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Sparkles className="w-6 h-6 text-[--primary]" />
          <span className="gradient-text">AI Companions</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <NavLink href="/" active={pathname === "/"}>Explore</NavLink>
          {isSignedIn && (
            <>
              <NavLink href="/chats" active={pathname.startsWith("/chats")}>
                <MessageCircle className="w-4 h-4" /> Chats
              </NavLink>
              <NavLink href="/favorites" active={pathname === "/favorites"}>
                <Heart className="w-4 h-4" /> Favorites
              </NavLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <Button size="sm">Get Started</Button>
            </SignInButton>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
        active
          ? "text-[--primary] bg-[--primary]/10"
          : "text-[--muted-foreground] hover:text-[--foreground] hover:bg-white/5"
      )}
    >
      {children}
    </Link>
  );
}
