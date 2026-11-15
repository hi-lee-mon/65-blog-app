# `canonical` と `og:url` の書き忘れを、自作の oxlint ルールで止める

- 日付: 2026-11-06
- 状態: 採用

## 背景

1-11 で、`canonical`（`alternates.canonical`）と `og:url`（`openGraph.url`）をページごとに書く形にした。ページを足したときに書き忘れても、ビルドも型検査も通り、気づく手段がない。

## 決めたこと

- oxlint の JS プラグインを自作し、ルール `nextjs-metadata/require-canonical` と `nextjs-metadata/require-og-url` で書き忘れを止める。重さは `error` にし、lefthook の oxlint でコミットの前に止める
- プラグインは `oxlint-plugins/nextjs-metadata.mts` に TypeScript で書く。型のために `@oxlint/plugins`（1.90.0、oxlint と同じ版）を `devDependencies` に足す。`import type` で型だけを読むので、実行時には読み込まれない
- `.oxlintrc.json` の `overrides` で、`app/**/page.tsx` にだけ効かせる
- `export const metadata` のオブジェクトか、`generateMetadata` の `return` のどれか1つに項目があれば通す。`metadata` も `generateMetadata` もないページはエラーにする

## 理由

### 自作のルールにした理由

人の注意だけに頼ると、いつか忘れる。lint に乗せれば、lefthook が書き忘れたままのコミットを止める。あわせて、lint がコードを木（AST）として見て回る仕組みを学ぶ。

### TypeScript で書いた理由

木の項目の書き間違い（`node.id.nmae` など）を、動かす前に型検査で見つけるため。拡張子を `.mts` にしたのは、このリポジトリの `package.json` に `"type": "module"` がなく、`.ts` だと Node が読み込むたびに `MODULE_TYPELESS_PACKAGE_JSON` の警告を出すため（実測）。

### `@oxlint/plugins` を足した理由

プラグインの型（`Plugin`・`Rule`・`ESTree`）はこのパッケージにしかない。1.90.0 は 2026-10-27 公開で、依存パッケージもインストール時スクリプトもない（ADR `20261103-1657-supply-chain-hardening.md` の待機日数を満たす）。

## 採らなかった案

- レビューで目で見る: 忘れる
- ビルドした HTML をテストで検査する: テストランナーがまだない
- `canonical` を `layout.tsx` で一括して付ける: ページごとに住所が違うので書けない
- プラグインを JavaScript（`.mjs`）で書く: 依存は増えないが、書き間違いに動かすまで気づけない
- `generateMetadata` のすべての `return` に項目を求める: `/posts/[slug]` の、記事がないときの `return {};` がエラーになる

## 気をつけること

- oxlint の JS プラグインは alpha（試験段階）。oxlint を上げたら、このルールが動くかを確かめ、`@oxlint/plugins` も同じ版に上げる。壊れて関係ないコミットまで止まるときは、一時的に `warn` に下げる
- `satisfies Metadata`、アロー関数の `generateMetadata`、ほかのファイルからの `export { metadata }` には対応していない。これらの書き方では、項目があってもエラーになる
- 分かれ道のある `generateMetadata` で、1つの道だけ書き忘れた場合は見逃す
- わざと書かないページ（展示室 `/lab` など）は、ファイルの先頭に `/* oxlint-disable nextjs-metadata/require-canonical, nextjs-metadata/require-og-url -- 理由 */` を書く
- Node が型を外して実行する機能（type stripping。v22.18 以降は標準で有効）に頼っている
- ルールの自動テスト（`RuleTester`）は書いていない。Vitest を入れたら題材にできる
