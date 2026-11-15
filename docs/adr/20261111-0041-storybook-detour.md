# React Aria の前に Storybook を入れ、部品のカタログと a11y の検査を先に整える

- 日付: 2026-11-11
- 状態: 採用
- 置き換えるもの: ADR `20261106-2104-design-system-panda-v2-react-aria.md` の「この順に進める」の表のうち、2-6 以降

## 背景

2-5 でタグとカードを部品にし、`/design-system` に並べた。次は React Aria で状態を持つ部品を作る予定だった（2-6）。

本人はその前に Storybook を入れたいと考えている。目的は3つある。

- デザインシステムのカタログ（部品を1つずつ取り出して眺める場所）を作る
- 部品のテストを書く
- アクセシビリティ（a11y）の検査を整える。本人がもっともやりたいのはこれ

あわせて、次の2つの要望も出た（2026-11-11）。

- React Aria の回で目次も作る。PC では記事の右側に固定する
- 閲覧はスマートフォンからが多いと見込み、UI はモバイルファーストで考える

2026-11-14 には、Storybook 11 を使いたいという希望が出た。この時点の 11 は beta で、正式版は 10.6 系だった。

## 決めたこと

2-6 から 2-9 を Storybook の回にし、React Aria の回は 2-11 からに送る。

| Step | 内容                                                                                                  |
| ---- | ----------------------------------------------------------------------------------------------------- |
| 2-6  | Storybook 11 を CSF Next で入れ、タグとカードをスマートフォン幅のカタログに並べる                     |
| 2-7  | addon-vitest で部品のテストを書く（play 関数、`.test()`、計測の差し替え）                             |
| 2-8  | a11y の自動検査を、違反があれば落ちる形にする（WCAG 2.2、デジタル庁の 4.5:1、暗いときの色、日本語化） |
| 2-9  | 自動検査で拾えない a11y を確かめる（フォーカスの輪、キーボード、色覚、読み上げ、320px での表示）      |
| 2-10 | 2-5 の残りの部品（リンク・コードブロック）を、ストーリーとテストつきで作る                            |
| 2-11 | React Aria で状態を持つ部品（テーマ切り替え・メニュー）を作る                                         |
| 2-12 | React Aria で目次を作る。PC では記事の右に固定し、スマートフォンでは開閉する                          |
| 2-13 | React Aria のフックに置き換え、さらに自作に置き換える                                                 |

- Storybook は 11 を使う。正式版が出るまでは beta の `11.0.0-beta.1` で始める（2026-11-14 に変更。当初は 10 系の正式版の予定だった）
- 設定とストーリーは CSF Next（`defineMain`・`definePreview`・`preview.meta`・`meta.story`）で書く。11 ではこれが「CSF 4」の名前で標準の書き方になる
- フレームワークは `@storybook/nextjs-vite` を使う
- `/design-system` は残す。公開する展示（母屋とは別の展示室）として育てる。Storybook は手元の作業台として使い、この時点では公開しない
- 2-6 以降の見た目の回では、スマートフォンの幅から先に組む。Storybook の既定の表示幅もスマートフォンにする

## 理由

### React Aria より前に置く理由

React Aria の部品には、開閉・選択・フォーカスの移動といった状態がある。状態ごとの見た目や、キーボードでの動きを確かめるには、部品を1つずつ取り出して状態を切り替えられる場所があると早い。Storybook はその場所になる。

a11y の検査も同じで、先に仕組みを整えておけば、2-11 以降に作る部品はすべて最初から検査される。後から入れると、それまでに作った部品の違反をまとめて直すことになる。

### 4回に分ける理由

入れる道具はカタログ（Storybook 本体）、テストの実行（Vitest のブラウザモード）、a11y の検査（axe）の3層に分かれる。1回にまとめると、どの層で何が起きたのかを切り分けにくい。下の層から1つずつ足す。

a11y を2回に分けたのは、axe（自動検査の道具）が WCAG の問題の一部しか拾えないためである。axe を作った Deque の調査では、拾えたのは件数で 57% だった。フォーカスの輪の色、フォーカスの順番、読み上げの中身は、axe にルールがない。2-8 で自動検査を整え、2-9 でその外側を扱う。

### リンクとコードブロックを 2-10 に置く理由

2-5 で後回しにした2つの部品を、Storybook の後に作る。部品を作るたびにストーリーとテストを書く流れを、React Aria の前に一度通しておくためである。

### 11 の beta、CSF Next、nextjs-vite にした理由

- CSF Next は Storybook 10.0 で Preview（API が大きく変わる見込みが小さい段階）になり、11 で標準の書き方（CSF 4）になる。11 で始めれば、正式版が出たときの作業は版を上げるだけで済み、10 から 11 へ移る回が要らない
- `11.0.0-beta.1` にするのは、より新しい beta が `bunfig.toml` の `minimumReleaseAge`（3日）にかかるから。版を書かずに `storybook@next` で入れると、bun は別の古い beta（`11.0.0-beta.0`）をエラーも出さずに選んだ（実測）
- 2-7 以降で使う道具も 11 に対応している。addon-vitest 11.0.0-beta.1 と Vitest 5.1.0 で、ストーリーのテストと `.test()` が動いた（2026-11-14 に実測）。2-9 で使う予定の `storybook-addon-pseudo-states` にも 11 の beta がある
- `@storybook/nextjs-vite` は公式が推奨するフレームワークで、addon-vitest はこちらでしか使えない。webpack 版の `@storybook/nextjs` は 11 で非推奨になり、12 で削除される予定

### `/design-system` を残す理由

設計書では `/design-system` を「展示室」として公開することにしている。Storybook は部品を作る人のための道具で、サイトの読者に見せるものではない。役割が違うので、両方を持つ。

## 採らなかった案

- **React Aria を先に進め、Storybook は後で入れる。** 状態を持つ部品を、検査の仕組みがないまま作ることになる
- **Storybook を1回で入れきる。** 3層の道具が一度に入り、つまずいたときに原因の層が分からない
- **10.6 系の正式版で始め、11 の正式版が出たら移る。** 安定しているが、11 で標準になる書き方へ移る回が別に要る。2026-11-11 の時点ではこちらを推奨していたが、本人の希望で 11 にした
- **`/design-system` をやめ、Storybook を公開して代わりにする。** Storybook の画面は部品を作る人向けで、サイトの見た目とも揃わない。展示室の役割を果たせない
- **Chromatic（Storybook の公開と見た目の比較をするクラウドサービス）を使う。** 外部サービスにビルドを送ることになる。無料枠で a11y の検査が使えるかも、資料からは分からなかった。必要になったら改めて検討する

## 気をつけること

- 2026-11-14 時点で、Storybook の最新の正式版は 10.6.7、11 の最新は 11.0.0-beta.3（`next` タグ）。`minimumReleaseAge` を通る 11 は 11.0.0-beta.1 まで。11 の正式版の日付は公表されていない
- beta なので、正式版までに API や画面が変わることがある。新しい beta や正式版に上げるときは、`@storybook/` のパッケージをまとめて上げ、ビルドと型検査で確かめる
- `create storybook` の CLI は `minimumReleaseAge` にかかる版を入れようとすると、`bunfig.toml` に除外の設定を書き足すかを尋ねてくる（10.6.6 と 11.0.0-beta.1 のソースで確認）。CLI は使わず、`bun add -d` と手書きの設定で入れる
- Storybook 11 は、props の表を作るのに TypeScript 6 の `typescript` パッケージを使う。このリポジトリは `typescript` を `@typescript/typescript6` にしてあるので、そのまま動く（ADR `20261103-1640-markuplint-with-typescript6.md`）
- Vitest 5 は `@types/node` を 22 以上に限っている。2-7 で `@types/node` を 20 から 24 に上げる（mise の Node 24.22.1 に合わせる）
- 目次は 1-6 で作ったものがある。2-12 では、見出しの抜き出しは 1-6 のまま使い、表示する部品を React Aria で作り直す

## 参考

- Storybook 10: https://storybook.js.org/blog/storybook-10/
- CSF Next: https://storybook.js.org/docs/api/csf/csf-next
- CSF 4 の API（Storybook 11）: https://storybook.js.org/docs/11/writing-stories/csf/api
- Storybook 11 の移行ガイド: https://github.com/storybookjs/storybook/blob/next/MIGRATION.md
- Storybook for Next.js with Vite: https://storybook.js.org/docs/get-started/frameworks/nextjs-vite
- Accessibility tests: https://storybook.js.org/docs/writing-tests/accessibility-testing
- Deque, Automated testing study: https://www.deque.com/blog/automated-testing-study-identifies-57-percent-of-digital-accessibility-issues
