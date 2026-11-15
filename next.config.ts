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
  async redirects() {
    //
    return [
      {
        source: "/:path*", // 全てのパスを対象にする
        has: [{ type: "host", value: "65-blog-app\\.vercel\\.app" }], // host名が左記のときだけ発動
        destination: "https://www.65banseki.dev/:path*",
        permanent: true, // 308（恒久的な転送）にする
      },
    ];
  },
};

export default nextConfig;
