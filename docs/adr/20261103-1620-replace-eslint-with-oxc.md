# ESLint をやめて oxlint と oxfmt に置き換える

- 日付: 2026-11-03
- 状態: 採用

## 決めたこと

リンターを ESLint（`eslint-config-next`）から oxlint に替え、フォーマッターとして oxfmt を入れる。どちらも Rust 製の JavaScript ツール群 oxc のもの。

- `bun run lint`: oxlint。設定は `.oxlintrc.json`
- `bun run format`: oxfmt で整形する。設定は `.oxfmtrc.json`
- `bun run format:check`: 整形が必要なファイルを列挙するだけで、書き換えない

## 理由

学習用のリポジトリなので、新しいツールを試したい。oxlint と oxfmt は ESLint・Prettier より速く、設定ファイルも JSON 1枚で済む。

## oxlint の設定

`eslint-config-next` の core-web-vitals と typescript に近づけるため、次のプラグインを有効にした。

- `typescript`, `unicorn`, `oxc`: oxlint の既定
- `react`, `nextjs`, `jsx-a11y`, `import`: `eslint-config-next` が使っていたものに相当する

oxlint が推奨するのは `correctness`（明らかな誤り）カテゴリーのルールで、既定の重さは警告になっている。これをエラーに引き上げる。

加えて、`react/rules-of-hooks` もエラーにする。このルールは `pedantic`（厳しめ）カテゴリーに入っているため、`correctness` を有効にしただけでは効かない。旧 ESLint 設定ではエラーだったので、個別に有効にする。

`suspicious`（誤りの可能性が高い書き方）カテゴリーは、指摘が増えるので今は有効にしない。

無視するパスは、旧 `eslint.config.mjs` の `globalIgnores` と同じ。

## 採らなかった案

- ESLint を残し、oxlint と併用する（`eslint-plugin-oxlint`）: oxlint にないルールを ESLint で補える。ただ、ツールが2つになり、学習の焦点がぼやける
- Biome: リンターとフォーマッターが1つにまとまっている。今回は oxc を試すことが目的なので採らない

## 欠点

- `eslint-config-next` のルールすべてに相当するルールが oxlint にあるとは限らない。足りないルールに気づいたら `.oxlintrc.json` で個別に有効にする
- oxfmt はまだ 0.x で、出力が版ごとに変わる可能性がある
