# 公開しているページを Playwright と axe で検査し、WCAG 2.2 AA の違反があれば push の前に止める

- 日付: 2026-11-15
- 状態: 提案（チケット `tickets/3-0-a11y-axe-check.md` の確認事項が了承されたら採用）

## 背景

本人はこのサイトを a11y にいちばん注意して作りたいと考えている（2026-11-15）。そこで、公開できる見た目の段の最初に、ページ全体の自動検査を置くことにした（ADR `20261115-2117-publishable-home-before-storybook.md` の「3-0 を足した理由」）。先に入れておけば、3-1 以降に作るヘッダーや付箋ページ、トップ画面は、作った時点から検査される。

Storybook の 2-8 で部品ごとに検査する計画はある。ただ、ヘッダーと本文の組み合わせのようなページ全体の問題は、部品ごとの検査では見つからない。

## 決めたこと

- 道具は Playwright Test（`@playwright/test` 1.65.0）と `@axe-core/playwright`（4.14.0）にする。ブラウザは `bun run playwright install --only-shell chromium` で headless shell だけ入れる。新しく止められたインストール時スクリプトはない（実測）
- 検査する規則は WCAG 2.2 の A と AA に当たるもの（`wcag2a`・`wcag2aa`・`wcag21a`・`wcag21aa`・`wcag22aa`）に絞る
- 検査するページは入口の `/`・`/posts`・`/tags`・`/design-system` と、記事一覧とタグ一覧の `main` からたどれるページすべてにする
- 明るい表示と暗い表示の両方で検査する（Playwright の projects で `colorScheme` を分ける）
- 記事のコードの色は Shiki のテーマを `github-light-high-contrast` と `github-dark-high-contrast` に変えて直す
- `bun run a11y`（`bun run b && playwright test`）で走らせ、lefthook の pre-push で、ページに関わるファイル（`app/`・`lib/`・`theme/`・`content/`・`panda.config.ts`）を push するときだけ走らせる
- ページごとに `test.step` で分け、`expect.soft` で最後のページまで検査する。違反は id・影響度・対象・要約を出す
- `test-results/` と `playwright-report/` を `.gitignore` に足す

## 理由

- Playwright と axe の組み合わせは、axe の作り手（Deque）が出している公式の連携。Playwright はこのリポジトリで画面操作のテストに使う予定の道具でもある。`colorScheme` で暗い表示も検査できる
- AA はデジタル庁デザインシステムをはじめ、多くの基準が求める水準。best-practice の規則（`landmark-one-main`・`region` など）は WCAG の達成基準ではないので、今は入れない
- 一覧からたどる形にしておけば、記事やタグを足したときに、ページの一覧を書き直さずに検査の対象に入る
- 明るい表示と暗い表示では色のコントラストが違う。実際に、暗い表示だけで出る違反があった（実測）
- 今の記事を元のテーマ（`github-light`・`github-dark`）で検査すると、コードの色で color-contrast の違反が出た（実測）
  - 明るい表示: `/posts/blog`・`/posts/dns`・`/posts/umami`。変数名などのオレンジ `#e36209` が白地 `#ffffff` で 3.48:1
  - 暗い表示: `/posts/blog`・`/posts/umami`。コメントの灰色 `#6a737d` が `#24292e` の上で 3.04:1
- テーマの文字色（背景色を持たない色）の最小コントラストを計算すると、次のとおりだった。high-contrast の組は、AA の 4.5:1 に余裕がある

  | テーマ                                                     | 明るい表示 | 暗い表示 |
  | ---------------------------------------------------------- | ---------- | -------- |
  | `github-light` / `github-dark`（元のテーマ）               | 3.49       | 3.05     |
  | `github-light-default` / `github-dark-default`             | 4.55       | 6.15     |
  | `github-light-high-contrast` / `github-dark-high-contrast` | 5.04       | 9.23     |

- high-contrast の組に変えると、全ページが明るい表示と暗い表示で通った（実測）
- `bun run a11y` はビルドと検査を合わせて 11.7 秒、lefthook の pre-push（`--force`）では 27 秒だった（実測）。push のたびに待てる長さで、違反を履歴に残さずに済む
- `expect.soft` なら、1ページで止まらず、違反を一度に全部見られる

## 採らなかった案

- **`@axe-core/cli`。** コマンド1つで動くが、chromedriver と selenium を使い、暗い表示に切り替えにくい
- **pa11y-ci。** URL の一覧を書くだけで動くが、puppeteer が Chromium をダウンロードするインストール時スクリプトを持ち、ADR `20261103-1657-supply-chain-hardening.md` の方針と合わない
- **Lighthouse CI。** a11y を点数で見られるが重く、違反があっても点数の閾値でしか落とせない
- **`github-light-default` / `github-dark-default`。** GitHub のふだんの見た目に近く、今の記事では通る。ただし明るい表示の最小コントラストが 4.55:1 で、AA との差が 0.05 しかない
- **best-practice の規則も入れる。** 検査の幅は広がるが、今は `<main>` のないページがあり、3-1 で直る前に落ちる
- **コミットの前（pre-commit）に走らせる。** 早く気づけるが、ビルドを含むので、記事の原稿だけのコミットでも毎回待つことになる
- **GitHub Actions で走らせる。** push のあとで確実に検査できるが、このリポジトリにはまだ CI がない。必要になったら改めて検討する

## 気をつけること

- Shiki のテーマを変えたので、2-4 で組んだ記事ページのコードの見た目が変わる。元より色が濃く、硬い印象になる
- `@playwright/test` の版を上げると、ダウンロードするブラウザの版も変わる。上げたら `bun run playwright install --only-shell chromium` を走らせ直す
- 一覧からリンクしていないページは検査の対象に入らない。そうしたページを作ったら、`e2e/a11y.spec.ts` の入口に足す
- lefthook の `glob` で、関係のないファイルだけの push を飛ばせるかは未確認。`--force` で走ることだけを確かめた
- best-practice の規則は、3-1 で `<main>` をそろえたあとに、足すかどうかを見直す
- 2-7 の `@storybook/addon-vitest` も Playwright（`playwright` 1.65.0）を使う。2-7 に戻るときは、`@playwright/test` と版をそろえる
- 自動検査で見つかるのは WCAG の問題の一部（Deque の調査では件数で 57%）。キーボード操作やフォーカスの見え方は、各チケットの受け入れ条件で手で確かめる

## 参考

- Playwright, Accessibility testing: https://playwright.dev/docs/accessibility-testing
- `@axe-core/playwright`: https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright
- axe-core のタグ: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#axe-core-tags
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Shiki のテーマ: https://shiki.style/themes
- Deque, Automated testing study: https://www.deque.com/blog/automated-testing-study-identifies-57-percent-of-digital-accessibility-issues
