import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Companions — Meet Your Perfect Match",
  description: "Chat with beautiful AI companions. Engage in meaningful conversations and AI-powered calls.",
  openGraph: {
    title: "AI Companions",
    description: "Meet your perfect AI companion.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} h-full`}>
        <body className="min-h-full flex flex-col antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
