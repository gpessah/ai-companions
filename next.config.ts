import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Shared hosting has a low thread/process limit; cap build concurrency so
  // the build doesn't fail with "OS can't spawn worker thread".
  experimental: {
    cpus: 1,
  },
  images: {
    // Media is stored on the local filesystem and served statically by the
    // web server; skip the Next image optimizer so /uploads/* renders directly.
    unoptimized: true,
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
