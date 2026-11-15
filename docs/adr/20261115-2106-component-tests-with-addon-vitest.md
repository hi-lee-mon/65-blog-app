# 部品のテストは addon-vitest で、ストーリーに `.test()` を書き足す形にする

- 日付: 2026-11-15
- 状態: 提案（チケット `tickets/2-7-component-tests.md` の確認事項が了承されたら採用）

## 背景

2-6 で Storybook 11 を入れ、部品のカタログを作った（ADR `20261111-0041-storybook-detour.md`）。次は、部品を直したときに前と同じように動くかを、目で見ずに確かめたい。2-8 では、同じ仕組みに a11y の検査を載せる。

## 決めたこと

- `@storybook/addon-vitest`（`11.0.0-beta.1`）・`vitest`・`@vitest/browser-playwright`（どちらも `5.1.0`）・`playwright`（`1.65.0`）を入れる。`@types/node` は 24 に上げる
- テストは Vitest のブラウザモードで、Playwright の Chromium（headless shell）の中で走らせる。ブラウザは `bun run playwright install --only-shell chromium` で入れる
- ストーリーは、書けばそのまま「描けるか」のテストになる。確かめごとは、ストーリーに `.test()` で書き足す。`main.ts` で `experimentalTestSyntax` を有効にする
- `TagLink` のストーリーは部品の隣（`app/tags/_components/`）に置き、`main.ts` の `stories` に `titlePrefix: "Tags"` で足す
- 計測（Umami）は、`beforeEach` で `window.umami` に `fn()` の偽物を置いて確かめる
- `bun run t`（`vitest run`）で走らせる。コミット前のフックには、まだ足さない

## 理由

- ストーリーとテストを別々に書かずに済む。ストーリーを1つ書けば、テストが1つ増える
- 本物のブラウザで走るので、CSS やフォーカスも本番に近い形で確かめられる。2-8 の a11y の検査にも、この形が要る
- `.test()` は1つのストーリーに名前つきのテストを並べられ、`extend` で派生させたストーリーに引き継がれない。`play` だと、派生させたストーリーでも同じ確かめが走り、1か所の間違いで複数が落ちた（実測）
- CSF Next ではストーリーが `preview` を自分で import するので、`setProjectAnnotations` のセットアップ用のファイルが要らなかった（実測）
- headless shell だけで足りた（205 MB）。画面つきの Chromium まで入れると、さらに 376 MB 増える（実測）
- `TagLink` は `window.umami?.track(...)` と呼んでいるだけなので、部品のコードを変えずに偽物へ差し替えられる。テストから本番の集計へは何も送らない

## 採らなかった案

- **jsdom で Node.js の中だけで走らせる。** 速いが、CSS が効かず、2-8 の a11y の検査（色のコントラストなど）が正しく測れない
- **`play` だけで書く。** 正式な機能で安定しているが、1つのストーリーに確かめを1つしか書けず、落ちたときにどの確かめかが名前で分からない
- **コミット前のフックで毎回走らせる。** ブラウザの起動で数秒かかり、記事の原稿だけのコミットでも待つことになる。どこで落とすかは 2-8 で決める
- **画面つきの Chromium も入れる。** テストの様子を目で見られるが、headless で走らせる今の設定では使わず、容量だけ増える

## 気をつけること

- `.test()` は Storybook 11 でも実験的な機能。正式版で書き方が変わったら、`.test()` を直すか `play` に戻す
- `playwright` の版を上げると、ダウンロードするブラウザの版も変わる。上げたら `bun run playwright install --only-shell chromium` を走らせ直す
- `storybook/test` の `expect` には、Vitest にある `toHaveBeenCalledExactlyOnceWith` の型がない。`toHaveBeenCalledOnce` と `toHaveBeenCalledWith` に分けて書く
- `TagLink` の計測の差し替えは、`window.umami` を直接呼んでいることに頼っている。呼び方を変えたら、差し替え方も見直す
- `@types/node` を 24 にしたので、Node 24 にしかない API を書いても型検査が通る。Node を 22 に下げることがあれば、型も戻す
