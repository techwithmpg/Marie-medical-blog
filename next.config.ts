import type { NextConfig } from "next";

function getRemoteImagePatterns() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return [];

  try {
    const parsed = new URL(supabaseUrl);
    return [
      {
        protocol: parsed.protocol.replace(":", "") as "http" | "https",
        hostname: parsed.hostname,
        port: parsed.port || undefined,
        pathname: "/storage/v1/object/public/public-assets/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],

  images: {
    // Next.js 16 blocks private/local IP image optimization by default.
    // This is enabled only for the local Supabase development environment.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    remotePatterns: getRemoteImagePatterns(),
  },
};

export default nextConfig;
