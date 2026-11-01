# 2026年10月に公表された脆弱性に合わせて依存パッケージを上げる

- 日付: 2026-11-02
- 状態: 採用

## 背景

2026年10月に、Next.js と Node.js で遠隔からコードを実行される恐れのある脆弱性が公表された。`bun audit` を実行すると、このプロジェクトでは20件（critical 2、high 9）が見つかった。

- Next.js 16.0.0〜16.4.0: `use cache` が typed array を返すときの RCE（GHSA-673q-mjm6-r5xr）、Image Optimization で SVG を扱うときの RCE（GHSA-2464-fhr4-w9xw）、Server Actions の DoS（GHSA-p3m5-59mp-jv5r）
- React 19.2.8 以前: Next.js の `use cache` の RCE と対になる修正が 19.2.9 に入った
- Bun 1.4.3 以前: Node.js と同じ Brotli の不具合（CVE-2026-111497）を含む

## 決定

- `next` と `eslint-config-next` を 16.4.1 に、`react` と `react-dom` を 19.2.9 に上げる
- `bun audit fix` で、間接的な依存（sharp、zod、source-map-js、brace-expansion など）を範囲内で上げる
- `packageManager` を `bun@1.4.4` にする
- `mise.toml` で Node.js 24.22.1 と Bun 1.4.4 に固定する。同じ版を `.node-version` にも書く。PATH で mise より先に来る vite-plus の `node` が、`mise.toml` を読まず `.node-version` だけを読むため

## 理由

critical の2件は回避策がなく、上げるしかない。16.4.1 は 16.x の中のパッチ更新で、ビルドが通ることを確かめた。

## 採らなかった案

- `bun audit fix --latest` でメジャーバージョンもまたいで上げる: 残る1件（minimatch の moderate）は ESLint が `minimatch@^3` を要求しているため、上げると ESLint が壊れる恐れがある。開発時にしか使わないので本番には影響しない

## 影響

- minimatch の moderate 1件が残る。ESLint 側が対応したら上げる
- `bun run lint` は今回の更新の前から失敗している。typescript-eslint が TypeScript 7 に未対応なため。別の課題として扱う

## 参考

- https://nodejs.org/en/blog/vulnerability/october-2026-security-releases
- https://github.com/advisories/GHSA-673q-mjm6-r5xr
- https://github.com/advisories/GHSA-2464-fhr4-w9xw
