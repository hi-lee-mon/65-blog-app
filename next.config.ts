import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  // next build の型検査は `typescript` パッケージ（markuplint のため TS 6）を使ってしまう。
  // 型検査は build スクリプトで tsrs に任せるので、ここではignoreする
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    turbopackRustReactCompiler: true, // https://nextjs.org/blog/next-16-3
    useOffline: true, // https://nextjs.org/blog/next-16-3
  },
};

export default nextConfig;
