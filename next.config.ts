import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  experimental: {
    turbopackRustReactCompiler: true, // https://nextjs.org/blog/next-16-3
    useOffline: true, // https://nextjs.org/blog/next-16-3
  },
};

export default nextConfig;
