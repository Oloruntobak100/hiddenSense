import type { NextConfig } from "next";

let supabaseHost: string | undefined;
try {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (raw) supabaseHost = new URL(raw).hostname;
} catch {
  supabaseHost = undefined;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
