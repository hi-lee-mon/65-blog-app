# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## このリポジトリの位置づけ

個人ブログを作りながら、React・Next.js の新機能やライブラリを試す学習用のリポジトリ。実装は本人が行う。Claude は、明示的に頼まれない限りコードを書かず、調査（例: 自作コンポーネントの参考として Mantine の実装を調べる）と設計の相談を受け持つ。

設計の全体像は `docs/design/20260925-blog-design-proposal.md`、個々の決定と採らなかった案は `docs/adr/` にある。新しく意思決定したら `docs/adr/<yyyymmdd-hhmm-名前>.md` を追加する。

## コマンド

パッケージマネージャーは bun（`package.json` の `packageManager`）。

- `bun dev`: 開発サーバー
- `bun run build`: 本番ビルド
- `bun run lint`: oxlint（設定は `.oxlintrc.json`）のあと、markuplint（設定は `.markuplintrc.json`）で TSX と MDX のマークアップとアクセシビリティを検査する
- `bun run typecheck`: `next typegen` でルートの型を作り、tsrs（TypeScript 7 の Rust 移植）で型検査する。`bun run build` も最初にこれを実行する。`next build` 自身の型検査は切ってある。`typescript` パッケージの中身は TypeScript 6 なので、`bunx tsc` は 6 で動く（ADR `20261103-1640-markuplint-with-typescript6.md`）
- `bun run format`: oxfmt で整形する。`bun run format:check` は確認だけ

テストランナーはまだ入っていない。Vitest（コンポーネント）と Playwright（画面操作）を試す予定。

## 構成

git のルートは一つ上の `65-blog-app/` で、Next.js アプリは `blog-app/` に入っている。記事まわりは、ルート直下に次のディレクトリを置く予定（ADR `20260925-1907-content-in-same-repo.md`）。

- `content/`: 記事の原稿（MDX）。正本は自サイト
- `articles/`: Zenn 用。GitHub Actions で `content/` から生成する。Zenn の GitHub 連携はリポジトリ直下の `articles/` しか読まないので、場所を動かせない
- `public/`: Qiita CLI 用。GitHub Actions で生成する。Next.js の静的ファイル置き場 `blog-app/public/` とは別物

サイトは二層に分ける（ADR `20260925-1702-two-layer-site-structure.md`）。

- 母屋（`/`, `/about`, `/posts`, `/tags`, `/uses`, `/now`, `/colophon`）: 共通のデザインシステムで統一する
- 展示室（`/lab/[slug]`, `/design-system`）: ページごとに見た目も技術も自由にしてよい

## 守るべき制約

- 原稿の読み込み処理は Next.js に依存させない。unified（`vfile-matter`・`yaml`・`remark-parse`・`remark-rehype`）と `@mdx-js/mdx` で組み、`@next/mdx` や `next-mdx-remote` は使わない。将来ほかのフレームワークへ移る可能性があるため
- コードの色付けは、ビルド時に Shiki で行う
- アクセス解析は Cloudflare Web Analytics を使う
- スタイリングは今は create-next-app 由来の Tailwind CSS v4 だが、Panda CSS で自作のデザインシステムを組む予定（参考: デジタル庁デザインシステム、Apple Human Interface Guidelines）

## Next.js の設定

Next.js 16.4 を使う。`next.config.ts` で `cacheComponents`、`partialPrefetching`、`reactCompiler` を有効にしており、`experimental` で `turbopackRustReactCompiler` と `useOffline` も試している。API を使う前に `node_modules/next/dist/docs/` の該当ガイドを読む。Cache Components の移行・最適化や、実行中のアプリでの動作確認には、`.claude/skills/` にあるスキル（`next-cache-components-*`、`next-dev-loop`、`agent-browser`）を使う。
