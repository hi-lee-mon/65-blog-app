# markuplint を入れ、そのために TypeScript 6 と tsrs を並べて使う

- 日付: 2026-11-03
- 状態: 採用

## 決めたこと

- markuplint で、TSX（`app/`）と MDX の原稿（`content/`）のマークアップとアクセシビリティを検査する。`bun run lint` で oxlint のあとに動く
- `typescript` パッケージの中身を、TypeScript 6 の互換パッケージ `@typescript/typescript6` にする
- 型検査は、`typescript@7` の代わりに tsrs（oxc による TypeScript 7 の Rust 移植）で行う。`bun run typecheck`（`next typegen && tsrs --noEmit`）で動き、`bun run build` も最初にこれを実行する
- `next build` 自身の型検査は、`next.config.ts` の `typescript.ignoreBuildErrors` で切る

```json
"tsrs": "^0.20.1-ts7.1.0-beta",
"typescript": "npm:@typescript/typescript6@^6.0.2"
```

## 理由

### markuplint を入れる理由

oxlint の jsx-a11y ルールは JSX の書き方を見る。markuplint は HTML の仕様とアクセシビリティの観点で、要素の入れ子、見出しの飛ばし、アクセシブルな名前の有無などを見る。MDX の原稿も検査できる。プリセットは `markuplint:recommended-react` を使う。

### TypeScript 6 を入れる理由

markuplint の JSX パーサー（`@markuplint/jsx-parser`）は、内部で `@typescript-eslint/typescript-estree` を使う。この部品は TypeScript の JavaScript API（`ts.Extension` など）を読む。TypeScript 7 はこの API をまだ公開していないので、起動時に `Cannot read properties of undefined (reading 'Cjs')` で落ちる。

typescript-eslint のメンテナーは、TypeScript 6 を使うよう案内している（[typescript-eslint#12518](https://github.com/typescript-eslint/typescript-eslint/issues/12518)）。Microsoft も、6 と 7 を並べて入れるための互換パッケージ `@typescript/typescript6` を出している（[TypeScript 7.0 RC の告知](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-rc/)）。

### tsrs を使う理由

型検査は TypeScript 7 で行いたい。公式の `typescript@7` を別名で入れる代わりに、oxc の tsrs を試す。oxlint・oxfmt と同じく oxc のツールで揃う。

Next.js はビルド時の型検査で、`typescript` という名前のパッケージから `tsc` を探す（`next/dist/lib/typescript/runTypeScriptCli.js`）。別の実行ファイルを指定する設定はない。そのままでは型検査が TypeScript 6 で動くので、`next build` の型検査を切り、build スクリプトの先頭で tsrs を実行する。tsrs が型の誤りを見つけると、`next build` は始まらない。

`PageProps` などのルートの型は、ビルドの途中で作られる。tsrs はビルドの前に動くので、先に `next typegen` で作っておく。

## 欠点

- `next build` を直接実行すると、型検査なしでビルドが通る。必ず `bun run build` を使う
- `bunx tsc` は TypeScript 6 になる。チケットにある `bunx tsc --noEmit` は `bun run typecheck` に読み替える
- tsrs はまだベータ版（TypeScript 7.1 beta 相当）

## 採らなかった案

- tsrs を `typescript` の代わりにする: tsrs が出す API は TypeScript 7 の新しい API で、古い API とは互換がない（[NODE_API.md](https://github.com/oxc-project/tsrs/blob/main/docs/NODE_API.md)）。markuplint の問題は解決しない
- `typescript` は TypeScript 7 のままにし、markuplint では MDX だけを検査する: TSX は oxlint の jsx-a11y に任せられるが、markuplint の HTML 仕様の検査を TSX で使えない
- `next build` の型検査を TypeScript 6 のまま残す: 設定は単純になるが、型検査が 6 と 7（tsrs）の二重になり、結果が食い違うおそれがある

## 見直す時期

typescript-eslint が TypeScript 7 の API に対応したら（[typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)）、`typescript` を 7 に戻す。
