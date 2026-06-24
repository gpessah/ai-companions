import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.cloudflare.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
      { protocol: "https", hostname: "**.clerk.com" },
      // Add your R2 custom domain here:
      // { protocol: "https", hostname: "your-custom-domain.com" },
    ],
  },
};

export default nextConfig;
