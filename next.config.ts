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
  images: {
    remotePatterns: getRemoteImagePatterns(),
  },
};

export default nextConfig;
