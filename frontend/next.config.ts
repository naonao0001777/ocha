import type { NextConfig } from "next";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
let SUPABASE_HOST = "apqgpbaudcqywppqdqna.supabase.co";
try {
  if (SUPABASE_URL) SUPABASE_HOST = new URL(SUPABASE_URL).hostname;
} catch {}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: SUPABASE_HOST,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://localhost:8000/:path*"
            : "https://hgtalzt5r9.execute-api.ap-northeast-1.amazonaws.com/:path*",
      },
    ];
  },
};

export default nextConfig;
