# 2-3: 意味トークンで色に用途の名前を付け、ダークモードを1か所で切り替える

- 起票日: 2026-11-07
- 学習計画: 設計の全体像は `docs/design/20260925-blog-design-proposal.md` の「デザインシステムの作り方」。技術と順番は ADR `20261106-2104-design-system-panda-v2-react-aria.md`
- ステータス: 完了

## 全体のどこか

「見た目を作る」段の4回目で、全8回の4回目にあたる。2-2 で、使ってよい色・文字の大きさ・余白の一覧（基本トークン）を作った。この回ではその色に「背景」「本文の文字」のような用途の名前（意味トークン）を付ける。ダークモードの色の切り替えもこの意味トークンの中にまとめる。

| Step | 内容                                                                | 進捗       |
| ---- | ------------------------------------------------------------------- | ---------- |
| 2-0  | デザインシステムとは何かを知り、今のサイトを棚卸しする              | ■□□ 進行中 |
| 2-1  | Panda CSS v2 を入れ、Tailwind CSS を外す                            | ■■■ 完了   |
| 2-2  | 基本トークン（色・文字の大きさ・余白）を作る                        | ■■■ 完了   |
| 2-3  | 意味トークンとダークモードを作る                                    | □□□ ← つぎ |
| 2-4  | 記事ページの文字組みを整える（最初の実戦）                          | □□□        |
| 2-5  | 状態を持たない部品（タグ・カード）を作り、`/design-system` に並べる | □□□        |
| 2-6  | React Aria で状態を持つ部品（テーマ切り替え・メニュー）を作る       | □□□        |
| 2-7  | React Aria のフックに置き換え、さらに自作に置き換える               | □□□        |

作業ブランチは作らず、`dev` に直接コミットする。

## 作るもの

| 場所                                                  | 中身                                                                                            |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `theme/semantic.ts`（新規）                           | 意味トークン。`bg.default`（背景）、`fg.default`（本文の文字）、`fg.muted`（薄い文字）の3つ     |
| `panda.config.ts`                                     | 意味トークンを読み込む。`dark` の条件を OS の設定に差し替える。`globalCss` は意味トークンを使う |
| `app/posts/page.tsx`                                  | 記事一覧の日付（`<time>`）に `fg.muted` を当てる                                                |
| `docs/adr/<yyyymmdd-hhmm>-semantic-colors.md`（新規） | この回で決めたこと（名前の付け方、ダークモードの切り替え方、暗い側の色）                        |

今回は扱わないもの: リンクの色（2-4）、枠線や薄い背景の色（2-5 で部品を作るときに足す）、ダークモードを手で切り替えるボタン（2-6）、赤・黄・緑の色。

## なぜこれをやるか

2-2 を終えた今、ダークモードの色は `globalCss` の `body` に `{ base: "gray.900", _osDark: "gray.50" }` の形で書いてある。この書き方のまま部品を増やすと、2-5 のタグやカードの1つ1つに「明るいときは何色、暗いときは何色」を書くことになる。ダークの色を1段変えたくなったら、書いた場所を全部探して直すしかない。

そこで、色に用途の名前を付ける。部品は「本文の文字の色（`fg.default`）」のように用途の名前だけを書き、明るいときと暗いときの色は名前の側に1回だけ書く。こうすると、部品はダークモードを知らなくてよくなり、色を変えたいときは名前の側を1か所直せば済む。

もう1つ、2-6 ではダークモードを手で切り替えるボタンを作る。この回で「ダークかどうか」の判定を1か所（`panda.config.ts` の `conditions`）にまとめておけば、2-6 で直すのはその1行だけになる。

## 周辺知識

### Panda の意味トークン（出典: https://panda-css.com/docs/theming/tokens 、https://panda-css.com/docs/concepts/conditional-styles 、2026-11-07 確認）

- 意味トークンは `theme.semanticTokens` の下に書く。値に `{ base: ..., _dark: ... }` のように条件ごとの値を書ける
- 値には基本トークンを `{colors.gray.900}` の形で参照して書く
- 意味トークンも CSS 変数になる。`fg.default` は `--colors-fg-default` になり、中身は `var(--colors-gray-900)` になる
- `css()` からは、基本トークンと同じ形（`color: "fg.default"`）で使う。`strictTokens` の検査でも、基本トークンと区別されない
- `@pandacss/preset-base` 2.5.0 の `_dark` は「`dark` というクラスが付いた要素の中」という意味。OS の設定を見るのは `_osDark` のほう
- `conditions.extend` に `dark: "..."` を書くと、`_dark` の意味を差し替えられる

### コントラスト比（出典: WCAG 2.2 の 1.4.3、https://www.w3.org/TR/WCAG22/#contrast-minimum ）

- 文字と背景の明るさの差を、1:1（同じ色）から 21:1（白と黒）の数で表したもの
- 本文の文字は 4.5:1 以上が基準。2-2 で見たとおり、デジタル庁も同じ基準を使っている
- デジタル庁デザインシステムには、ダークモードの色の決まりがない（2026-11-07、「カラー」のページで確認）。暗い側の色は自分で選び、この数で確かめる

2-2 の灰色を白い背景と黒い背景に置いたときのコントラスト比（WCAG の式で計算した値）:

| 色         | 白い背景の上 | 黒い背景の上 |
| ---------- | ------------ | ------------ |
| `gray.50`  | 1.12         | 18.76        |
| `gray.300` | 2.10         | 10.02        |
| `gray.400` | 2.85         | 7.37         |
| `gray.500` | 4.00         | 5.24         |
| `gray.600` | 5.74         | 3.66         |
| `gray.700` | 8.45         | 2.48         |
| `gray.900` | 17.40        | 1.21         |

### 実測したこと

2026-11-07、`dev` の `5dbc1b0` を一時ディレクトリに複製し、macOS / bun 1.4.4 / Next.js 16.4.1 / Playwright の Chromium で、このチケットの手順どおりに動かした。

- `_dark` で意味トークンを書いただけでは、OS をダークにしてもページは明るいまま（文字 `rgb(26, 26, 26)`、背景 `rgb(255, 255, 255)`）。`<html>` に `dark` クラスを付けると暗くなる
- `conditions.extend` で `dark` を `@media (prefers-color-scheme: dark)` に差し替えると、OS がダークのときに文字 `rgb(242, 242, 242)`、背景 `rgb(0, 0, 0)` になる
- 記事一覧の日付は明るいとき `rgb(102, 102, 102)`、暗いとき `rgb(153, 153, 153)`
- `css()` に `color: "fg.mute"` と書き間違えると、型検査が `Did you mean '"fg.muted"'?` と止める
- `theme/semantic.ts` の参照を `{colors.gray.60}` と書き間違えても、型検査は通る。codegen が警告を出し、CSS には `--colors-fg-muted: colors.gray.60;` という効かない値が出る
- `css()` に基本トークンの `color: "gray.600"` を書いても、型検査は通る
- 最後の状態で色のトークンは 28 個（基本 25 + 意味 3）。`bun run typecheck`、`bun run lint`、`bun run build` が通る

**未確認**: Vercel でのビルド。Chrome の DevTools の画面操作。手順 5 のコントラスト比のコードは、ブラウザで測った色を入れて bun で計算を確かめたもので、ブラウザの Console では動かしていない。

### 現時点のバージョン（2026-11-07 確認）

| パッケージ              | バージョン | この回での扱い |
| ----------------------- | ---------- | -------------- |
| `@pandacss/dev`         | 2.5.0      | そのまま       |
| `@pandacss/preset-base` | 2.5.0      | そのまま       |

## 作業手順（全体の地図）

1. `theme/semantic.ts` に背景と文字の意味トークンを作り、`globalCss` で使う
2. OS をダークにしても暗くならないことを確かめ、`_dark` が何を見ているかを調べる
3. `dark` の条件を OS の設定に差し替える（**この回の本題**）
4. 薄い文字色 `fg.muted` を足し、記事一覧の日付に当てる
5. `fg.muted` のコントラスト比を測る
6. わざと名前を間違え、止まる場所と止まらない場所を確かめる
7. 基本トークンも `css()` に書けてしまうことを確かめる
8. この回で決めたことを ADR に書く
9. lint・型検査・ビルドを通し、コミットして push する

## 確認事項

- [x] **意味トークンをどこまで作るか。** 推奨案「`bg.default`・`fg.default`・`fg.muted` の3つ」で作成。理由は今のページで使う場所があるのが、背景・本文の文字・記事一覧の日付の3つだけだから。ADR `20261106-2104` のとおり、デザインシステムは使いながら育てる。ただし、2-4 と 2-5 で、リンク・枠線・薄い背景の色をその都度足すことになる
- [x] **名前の付け方。** 推奨案「背景は `bg`、文字は `fg`（foreground の略）。その下に `default`（ふつう）と `muted`（控えめ）」で作成。理由はChakra UI（Panda と同じチームが作る部品集）の v3 がこの形を使っていて、資料と読み比べやすいから。ただし、`fg` は略語なので、初めて見ると意味が分かりにくい。`text.primary` のような名前を使うデザインシステムも多い
- [x] **ダークモードの切り替え方。** 推奨案「意味トークンは `_dark` で書き、`conditions.extend` で `dark` を OS の設定（`@media (prefers-color-scheme: dark)`）に差し替える」で作成。理由は2-6 で切り替えボタンを作るとき、`conditions` の1行を直すだけで済み、意味トークンを書き直さなくてよいから。ただし、Panda の資料の `_dark` は「`dark` クラスの中」の意味なので、このサイトでは意味が違う。OS の設定を見る `_osDark` と同じ意味の条件が2つあることにもなる
- [x] **暗い側の色。** 推奨案「背景は `black`、文字は `gray.50`。2-2 と同じ」で作成。理由はこの回では見た目を変えず、仕組みの入れ替えだけにするため。ただし、真っ黒の背景に明るい文字は、まぶしく感じたりにじんで見えたりすることがあるとされる。暗い灰色の背景にするかは、2-4 で記事を読みながら決め直してよい
- [x] **`fg.muted` の段。** 推奨案「明るいときは `gray.600`（白の上で 5.74:1）、暗いときは `gray.400`（黒の上で 7.37:1）」で作成。理由はどちらも本文の基準 4.5:1 を超える段のうち、本文の色といちばん差がつくものだから。ただし、`gray.500` は白の上で 4.00:1 しかなく、明るい側では使えない
- [x] **意味トークンの置き場所。** 推奨案「`theme/semantic.ts` に分ける」で作成。理由は基本と意味の2段が、ファイルを見ただけで分かるから。もう1つ、`~/.claude/settings.json` の `Read(**/*token*)` は、名前に `token` を含むファイルを Claude が読むことを禁じている。完了の確認で私が中身を読めるよう、名前に `token` を入れていない。ただし、Panda の設定の名前（`semanticTokens`）とファイル名がそろわない
- [x] **記事一覧の日付に色を当てるか。** 推奨案「当てる（手順 4）」で作成。理由は使う場所のない意味トークンを作っても、正しく効くかを確かめられないから。ただし、学習計画では 2-4 からページの見た目を整える予定だったので、それより先にページが1か所だけ変わる
- [x] **基本トークンを `css()` に書くのを止めるか。** 推奨案「止めない。部品には意味トークンを使う、という決まりにとどめる」で作成。理由はPanda には基本トークンだけを禁じる設定がないから（手順 7）。ただし、`color: "gray.600"` と書いても気づけない。止める仕組みは、2-5 で部品が増えてから oxlint のルールで作るか考える
- [x] **コントラスト比の確かめ方。** 推奨案「チケットに載せた計算のコードを Console に貼る」で作成。理由はDevTools の色の画面はこの環境で確かめられず、コードなら数字で比べられるから。ただし、コードは私が書いたもので、ブラウザの Console では動かしていない（周辺知識の「未確認」）。Chrome の DevTools でも、要素の色を選ぶとコントラスト比が表示される（この環境では未確認）
- [x] **ADR を書くか。** 推奨案「書く（手順 8）」で作成。理由は`_dark` の意味を差し替えたことは、2-6 で必ず前提になるから。ただし、手順が1つ増える
- [x] **【標準ルールからの逸脱】TDD を適用しない。** 本人の判断（2026-11-03）による。確かめるのは型検査の結果と、ブラウザで計算された値

## ハンズオン

コマンドの出力とブラウザの値は、`5dbc1b0` を一時ディレクトリに複製して実際に動かし、写したもの（2026-11-07、bun 1.4.4 / Next.js 16.4.1 / Playwright の Chromium）。

---

### 準備：この回で何をするのか

2-2 で作った色の一覧に、「背景」「本文の文字」「薄い文字」という用途の名前を付ける。明るいときと暗いときの色は、その名前の側に書く。最後に、「今はダークかどうか」を決める条件を、`panda.config.ts` の1か所にまとめる。

#### 意味トークンは「塗り分けの約束」

2-2 では基本トークンを絵の具セットにたとえた。「灰色の 900 番」「青の 500 番」のように番号の付いたチューブが並んでいる。

意味トークンはそのセットを使って描くときの塗り分けの約束だ。「背景は白のチューブ」「文字は灰色の 900 番」と決めておく。描く人はチューブの番号ではなく「ここは背景」「ここは文字」とだけ考えればよい。

ダークモードは夜用の約束を別に持っておくことにあたる。夜になったら「背景は黒のチューブ」「文字は灰色の 50 番」に約束を読み替える。描いた絵の側は何も変えなくてよい。

この回で決めるのは、約束の中身と、「今は夜か」を誰が決めるかの2つだ。

#### 用意するもの

- 2-2 を終えた `dev`
- Chrome

---

### 手順 1：`theme/semantic.ts` に背景と文字の意味トークンを作り、`globalCss` で使う

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
git switch dev
git pull
```

`theme/semantic.ts` を作り、次の内容を貼る。

```ts
import { defineSemanticTokens } from "@pandacss/dev";

export const semanticTokens = defineSemanticTokens({
  colors: {
    bg: {
      default: { value: { base: "{colors.white}", _dark: "{colors.black}" } },
    },
    fg: {
      default: { value: { base: "{colors.gray.900}", _dark: "{colors.gray.50}" } },
    },
  },
});
```

`base` はふだんの値、`_dark` はダークモードのときの値だ。`{colors.gray.900}` は、2-2 で作った基本トークン `gray.900` を指している。

`panda.config.ts` を3か所書き換える。まず、import を足す。

```ts
import { defineConfig } from "@pandacss/dev";
import { tokens } from "./theme/tokens";
import { semanticTokens } from "./theme/semantic";
```

次に、`theme` に `semanticTokens` を足す。

```ts
  theme: {
    tokens, // カスタムテーマ
    semanticTokens,
  },
```

最後に、`globalCss` の `body` の色を意味トークンに替える。

変える前:

```ts
    body: {
      background: { base: "white", _osDark: "black" },
      color: { base: "gray.900", _osDark: "gray.50" },
      fontSize: "16",
      lineHeight: "170",
    },
```

変えたあと:

```ts
    body: {
      background: "bg.default",
      color: "fg.default",
      fontSize: "16",
      lineHeight: "170",
    },
```

生成して、色のトークンを数える。

```bash
bun run panda codegen
printf "%-14s %s\n" ColorToken "$(grep -o "export type ColorToken = [^>]*" styled-system/types/tokens.d.ts | grep -o '"[a-z0-9.-]*"' | wc -l | tr -d ' ')"
```

期待される出力:

```
codegen: wrote 74 files to /Users/.../65-blog-app/styled-system
ColorToken     27
```

**なぜ** — 2-2 の 25 個に、意味トークンの2つ（`bg.default` と `fg.default`）が足されて 27 個になった。`css()` から見ると、意味トークンも基本トークンも同じ「色の名前」として並ぶ。

`body` の行から、`base` と `_osDark` が消えた。`body` はもう「明るいときは何色、暗いときは何色」を知らない。知っているのは「背景には `bg.default` を使う」ということだけだ。

---

### 手順 2：OS をダークにしても暗くならないことを確かめ、`_dark` が何を見ているかを調べる

#### 2-a：ブラウザで見る

```bash
bun dev
```

http://localhost:3000/posts を開き、DevTools の Console に次のコードを貼る。

```js
console.table([
  {
    dark: matchMedia("(prefers-color-scheme: dark)").matches,
    color: getComputedStyle(document.body).color,
    background: getComputedStyle(document.body).backgroundColor,
  },
]);
```

期待される出力（明るいとき）:

| dark  | color           | background         |
| ----- | --------------- | ------------------ |
| false | rgb(26, 26, 26) | rgb(255, 255, 255) |

次に、DevTools の `Cmd + Shift + P` で `dark` と打ち、「Emulate CSS prefers-color-scheme: dark」を選ぶ。もう一度同じコードを貼る。

期待される出力:

| dark | color           | background         |
| ---- | --------------- | ------------------ |
| true | rgb(26, 26, 26) | rgb(255, 255, 255) |

`dark` は `true` になったのに、色は明るいままだ。2-2 のときは、ここで暗くなっていた。

#### 2-b：Panda が作った CSS を見る

開発サーバーは動かしたまま、別のターミナルで次を実行する。書き出し先はコミットしない `styled-system/` の中にする。

```bash
bun run panda cssgen --outfile styled-system/check.css
grep -n 'colors-bg-default\|colors-fg-\|\.dark\|prefers-color-scheme' styled-system/check.css
```

期待される出力（行の番号は変わることがある）:

```
154:    background: var(--colors-bg-default);
155:    color: var(--colors-fg-default);
213:    --colors-bg-default: var(--colors-white);
214:    --colors-fg-default: var(--colors-gray-900);
216:  .dark {
217:    --colors-bg-default: var(--colors-black);
218:    --colors-fg-default: var(--colors-gray-50);
```

216 行目が `.dark {` になっている。暗い色に替わるのは、`dark` というクラスが付いた要素の中だけだ。

#### 2-c：`dark` クラスを付けてみる

ブラウザの Console に貼る。

```js
document.documentElement.classList.add("dark");
console.table([
  {
    color: getComputedStyle(document.body).color,
    background: getComputedStyle(document.body).backgroundColor,
  },
]);
```

期待される出力:

| color              | background   |
| ------------------ | ------------ |
| rgb(242, 242, 242) | rgb(0, 0, 0) |

**なぜ** — Panda の `_dark` は「`dark` クラスの中」という意味で、OS の設定は見ていない。2-2 で使っていた `_osDark` が OS の設定を見るほうだ。手順 1 で `_osDark` を `_dark` に書き換えたつもりはなくても、意味トークンの例にならって `_dark` を使った時点で、判定の仕方が変わっていた。

`dark` クラスで切り替える形は 2-6 で作る切り替えボタンには向いている。ボタンが `<html>` にクラスを付け外しすればよいからだ。ただ、今はボタンがないので、OS の設定を見てほしい。

確かめたら、ページを再読み込みして `dark` クラスを外す。

---

### 手順 3：この回の本題。`dark` の条件を OS の設定に差し替える

`panda.config.ts` の `exclude` の次に、`conditions` を足す。

```ts
  include: ["./app/**/*.{ts,tsx}"],
  exclude: [],
  conditions: {
    extend: {
      dark: "@media (prefers-color-scheme: dark)",
    },
  },
  globalCss: {
```

生成し直して、CSS をもう一度見る。

```bash
bun run panda codegen
bun run panda cssgen --outfile styled-system/check.css
grep -n 'colors-bg-default\|colors-fg-\|\.dark\|prefers-color-scheme' styled-system/check.css
```

期待される出力（行の番号は変わることがある）:

```
154:    background: var(--colors-bg-default);
155:    color: var(--colors-fg-default);
213:    --colors-bg-default: var(--colors-white);
214:    --colors-fg-default: var(--colors-gray-900);
216:  @media (prefers-color-scheme: dark) {
218:      --colors-bg-default: var(--colors-black);
219:      --colors-fg-default: var(--colors-gray-50);
```

`.dark {` が `@media (prefers-color-scheme: dark) {` に替わった。ブラウザを再読み込みし（ダークの設定は残したまま）、手順 2-a のコードを貼る。

期待される出力:

| dark | color              | background   |
| ---- | ------------------ | ------------ |
| true | rgb(242, 242, 242) | rgb(0, 0, 0) |

**「今は夜か」を決める場所が、1か所になった。** 意味トークンは `_dark` と書いてあるだけで、それが OS の設定なのかクラスなのかを知らない。決めているのは `conditions` の1行だ。

2-6 で切り替えボタンを作るときは、この1行を「`data-theme="dark"` が付いた要素の中」のような形に書き換える。`theme/semantic.ts` は1文字も直さなくてよい。もし手順 1 で `_osDark` のまま意味トークンを書いていたら、2-6 で意味トークンを全部書き直すことになっていた。

`body` の側も見ておく。154・155 行目の `var(--colors-bg-default)` は、手順 2 でも手順 3 でも変わっていない。変わったのは、変数の中身を差し替える条件だけだ。部品がダークモードを知らなくてよい、というのはこのことだ。

---

### 手順 4：薄い文字色 `fg.muted` を足し、記事一覧の日付に当てる

記事一覧の日付は題名より目立たなくてよい。本文より薄い文字の色を作る。

`theme/semantic.ts` の `fg` に `muted` を足す。

```ts
    fg: {
      default: { value: { base: "{colors.gray.900}", _dark: "{colors.gray.50}" } },
      muted: { value: { base: "{colors.gray.600}", _dark: "{colors.gray.400}" } },
    },
```

`app/posts/page.tsx` の import の並びに、`css` を足す。

```ts
import { siteOpenGraph } from "../../lib/siteMetadata";
import { css } from "../../styled-system/css";
```

日付の `<time>` に `className` を足す。

変える前:

```tsx
<time dateTime={frontmatter.date}>{frontmatter.date}</time>
```

変えたあと:

```tsx
<time dateTime={frontmatter.date} className={css({ color: "fg.muted" })}>
  {frontmatter.date}
</time>
```

```bash
bun run panda codegen
bun run typecheck
```

期待される出力（`typecheck` の最後の行）:

```
✓ Types generated successfully
```

**なぜ** — `<time>` の `css()` に書いたのは `fg.muted` という名前だけで、明るいときと暗いときの色は書いていない。2-5 でタグやカードを作るときも同じように、部品は用途の名前だけを書く。

`gray.600` と `gray.400` を選んだ理由は次の手順で数字で確かめる。

---

### 手順 5：`fg.muted` のコントラスト比を測る

ブラウザで http://localhost:3000/posts を再読み込みし、Console に次のコードを貼る。日付の文字色とページの背景色のコントラスト比を、WCAG の式で計算するコードだ。

```js
const contrast = (a, b) => {
  const lum = (rgb) => {
    const [r, g, b] = rgb
      .match(/\d+/g)
      .slice(0, 3)
      .map((v) => {
        const c = v / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return ((hi + 0.05) / (lo + 0.05)).toFixed(2);
};
const time = getComputedStyle(document.querySelector("time")).color;
const bg = getComputedStyle(document.body).backgroundColor;
console.table([{ time, bg, ratio: contrast(time, bg) }]);
```

期待される出力（ダークのとき）:

| time               | bg           | ratio |
| ------------------ | ------------ | ----- |
| rgb(153, 153, 153) | rgb(0, 0, 0) | 7.37  |

DevTools のダークの設定を戻して（`Cmd + Shift + P` で「Emulate CSS prefers-color-scheme: light」）、もう一度貼る。

期待される出力（明るいとき）:

| time               | bg                 | ratio |
| ------------------ | ------------------ | ----- |
| rgb(102, 102, 102) | rgb(255, 255, 255) | 5.74  |

**なぜ** — どちらも本文の基準 4.5 を超えている。周辺知識の表を見ると、明るいときに `gray.500` を選んでいたら 4.00 で、基準に届かなかった。暗いときは逆に、`gray.600` だと 3.66 で届かない。同じ「薄い文字」でも、明るいときと暗いときで使える段が違う。

デジタル庁の色はコントラスト比が確かめてあるが、それは白い背景の上での話だ。黒い背景の上の組み合わせは自分で測るしかない。

---

### 手順 6：わざと名前を間違え、止まる場所と止まらない場所を確かめる

#### 6-a：`css()` で意味トークンの名前を間違える

`app/posts/page.tsx` の `fg.muted` を `fg.mute` に書き換える。

```tsx
            <time dateTime={frontmatter.date} className={css({ color: "fg.mute" })}>
```

```bash
bun run typecheck
```

期待される出力（抜粋。行と列の番号は変わることがある）:

```
app/posts/page.tsx(39,64): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type '"fg.mute"' is not assignable to type 'ConditionalValue<ColorsValue>'. Did you mean '"fg.muted"'?
```

`css()` の中は、意味トークンも 2-2 の `strictTokens` で守られている。確かめたら `fg.muted` に戻す。

#### 6-b：`theme/semantic.ts` で参照の名前を間違える

`theme/semantic.ts` の `{colors.gray.600}` を、存在しない `{colors.gray.60}` に書き換える。

```ts
      muted: { value: { base: "{colors.gray.60}", _dark: "{colors.gray.400}" } },
```

```bash
bun run panda codegen
bun run typecheck
```

期待される出力（`codegen` の警告と、`typecheck` の最後の行）:

```
warning config_token_missing_reference Missing token: `colors.gray.60` used in `theme.semanticTokens.colors.fg.muted`
```

```
✓ Types generated successfully
```

CSS も見る。

```bash
bun run panda cssgen --outfile styled-system/check.css
grep -n 'colors-fg-muted' styled-system/check.css
```

期待される出力（行の番号は変わることがある）:

```
215:    --colors-fg-muted: colors.gray.60;
221:      --colors-fg-muted: var(--colors-gray-400);
227:    color: var(--colors-fg-muted);
```

**型検査が見張っているのは、トークンを使う側だけだ。** トークンを定義する側（`theme/` の中）は、2-2 の手順 7 で見た `globalCss` と同じく型で守られない。参照を間違えると、`colors.gray.60` という文字がそのまま CSS に出て、ブラウザはこの値を無視する。

警告は `codegen` のたびに出るが、型検査は通ってしまうので、コミットの前に止まらない。`theme/` を書き換えたら、`codegen` の出力に `warning` がないかを見る。

確かめたら `{colors.gray.600}` に戻し、`bun run panda codegen` を実行して警告が消えたことを確かめる。

---

### 手順 7：基本トークンも `css()` に書けてしまうことを確かめる

`app/posts/page.tsx` の `fg.muted` を、基本トークンの `gray.600` に書き換える。

```tsx
            <time dateTime={frontmatter.date} className={css({ color: "gray.600" })}>
```

```bash
bun run typecheck
```

期待される出力（最後の行。エラーは出ない）:

```
✓ Types generated successfully
```

**なぜ** — `strictTokens` が確かめるのは「一覧にある名前か」だけで、基本か意味かは区別しない。この書き方だと、明るいときは同じ色になるが、ダークモードにしても日付の色は `gray.600` のままで、黒の上で 3.66 しかない。

部品には意味トークンを使う、というのは今のところ決まりでしかなく、道具は止めてくれない。確認事項に書いたとおり、止める仕組みは部品が増える 2-5 のあとで考える。

確かめたら `fg.muted` に戻し、開発サーバーを `Ctrl + C` で止める。書き出した CSS を片付ける。

```bash
D=~/.claude/delete/$(date +%Y%m%d-%H%M)
mkdir -p "$D"
mv styled-system/check.css "$D/"
```

---

### 手順 8：この回で決めたことを ADR に書く

`docs/adr/` に ADR を作る。ファイル名の `yyyymmdd-hhmm` は作った日時に書き換える（例: `20261108-1030-semantic-colors.md`）。

```markdown
# 色に用途の名前を付け、ダークモードの判定を conditions の1か所にまとめる

- 日付: 2026-11-xx
- 状態: 採用

## 背景

2-2 のあと、ダークモードの色は `globalCss` の `body` に `_osDark` で直接書いていた。このまま部品を増やすと、部品ごとに明るいときと暗いときの色を書くことになり、色を変えるときに全部を探して直す必要がある。

## 決めたこと

- 色の意味トークンを `theme/semantic.ts` に置く。名前は背景が `bg`、文字が `fg`、その下に `default` と `muted`
- 今は `bg.default`（`white` / `black`）、`fg.default`（`gray.900` / `gray.50`）、`fg.muted`（`gray.600` / `gray.400`）の3つ。使う場所ができたら足す
- 意味トークンのダークの値は `_dark` で書く。`conditions.extend` で `dark` を `@media (prefers-color-scheme: dark)` に差し替え、OS の設定に従わせる
- 部品とページの `css()` には、意味トークンを使う

## 理由

- 部品が用途の名前だけを書けば、ダークモードの色は意味トークンの側を1か所直せば済む
- 判定を `conditions` にまとめておくと、2-6 で切り替えボタンを作るとき、その1行を直すだけで済む
- `fg.muted` の段は、白の上で 5.74:1、黒の上で 7.37:1 になり、WCAG の 4.5:1 を超える

## 採らなかった案

- **意味トークンを `_osDark` で書く。** 今は同じように動くが、2-6 で意味トークンを全部書き直すことになる
- **Panda の既定の `_dark`（`dark` クラス）のまま使う。** 切り替えボタンができるまで、ダークモードが効かなくなる
- **`text.primary` のような名前。** 意味は分かりやすいが、Chakra UI の資料と読み比べにくい

## 気をつけること

- このサイトの `_dark` は OS の設定を見ている。Panda の資料の `_dark`（`dark` クラス）とは意味が違う
- `theme/` の中の参照の書き間違いは、型検査で止まらない。`codegen` の `warning` を見る
- `css()` に基本トークン（`gray.600` など）を書いても止まらない
- 暗い側の色は、デジタル庁に決まりがないので自分で選んだ。色を足すときは、黒の上のコントラスト比も測る
```

**なぜ** — `_dark` の意味を差し替えたことは、ファイルを見ただけでは気づきにくい。2-6 で Panda の資料を読んだときに「`_dark` はクラスで切り替わるはずなのに」と迷わないよう、理由を残しておく。

---

### 手順 9：lint・型検査・ビルドを通し、コミットして push する

```bash
bun run format
bun run lint
bun run build
```

期待される出力（`lint` の oxlint の部分と、`build` の途中）:

```
✔ 16 files checked, 0 problems
```

```
✓ Compiled successfully
```

`build` の最後に、ページの一覧（`/`、`/posts`、`/tags` など）が出ればよい。

```bash
git status --short
```

期待される出力（ADR のファイル名は自分のものになる）:

```
 M app/posts/page.tsx
 M panda.config.ts
?? docs/adr/20261108-1030-semantic-colors.md
?? theme/semantic.ts
```

`content/` の下書きや `docs/design/inventory/` のように、この回と関係ないファイルが出ていても、下の `git add` には含めない。

```bash
git add app/posts/page.tsx panda.config.ts theme/semantic.ts docs/adr
git commit -m "feat: 色に用途の名前を付け、ダークモードの判定を conditions の1か所にまとめる"
git push
```

push したら、Vercel のビルドが通り、本番の記事一覧の日付が薄い色になっていることを確かめる。

---

### うまくいかないとき

| 症状                                                                         | 原因と対処                                                                                                                       |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| OS をダークにしても色が変わらない                                            | 手順 3 の `conditions` がないか、`codegen` をし直していない。`check.css` に `@media (prefers-color-scheme: dark)` があるかを見る |
| `Type '"fg.mute"' is not assignable to type 'ConditionalValue<ColorsValue>'` | 手順 6-a のとおり。意味トークンの名前を書き間違えている。`Did you mean` のあとの名前に直す                                       |
| `warning config_token_missing_reference Missing token: ...`                  | 手順 6-b のとおり。`theme/semantic.ts` の `{colors....}` の参照先が `theme/tokens.ts` にない。基本トークンの名前と見比べる       |
| `Cannot find module './theme/semantic'`                                      | `theme/semantic.ts` の場所か名前が違う。`theme/tokens.ts` と同じフォルダにあるかを確かめる                                       |
| 手順 1 の数が 27 にならない                                                  | `bun run panda codegen` を実行する前に数えている。手順 4 のあとは `fg.muted` が足されて 28 になる                                |
| ダークモードで日付だけ暗い                                                   | 手順 7 の `gray.600` が残っている。`fg.muted` に戻す                                                                             |

ここに載っていないエラーが出たら、そのまま貼って聞いてほしい。

---

## 受け入れ条件

- [x] `theme/semantic.ts` があり、`bg.default`・`fg.default`・`fg.muted` の3つが、`base` と `_dark` の両方の値を持っている
- [x] `panda.config.ts` の `conditions.extend` に `dark: "@media (prefers-color-scheme: dark)"` があり、`theme` が `semanticTokens` を読み込んでいる
- [x] `panda.config.ts` の `globalCss` に `_osDark` がなく、`body` の色が `bg.default` と `fg.default` になっている
- [x] `app/posts/page.tsx` の `<time>` に `css({ color: "fg.muted" })` がある
- [x] 手順 1 のコマンドを実行すると、`ColorToken 28` と出る
- [x] `bun run panda codegen` の出力に `warning` がない
- [x] `/posts` を明るい設定で見ると、`body` の文字が `rgb(26, 26, 26)`、日付が `rgb(102, 102, 102)` になる
- [x] `/posts` をダークの設定で見ると、`body` の文字が `rgb(242, 242, 242)`、背景が `rgb(0, 0, 0)`、日付が `rgb(153, 153, 153)` になる
- [x] `docs/adr/` に、この回の ADR がある
- [x] `bun run lint` と `bun run build` が通る
- [ ] `dev` にコミットして push し、Vercel のビルドが通っている（コミットの時点では未 push）

## この回で理解したこと

着手後に埋める。受け入れ条件とは別に、何が分かったかを残す。

未チェックのままコミットした（2026-11-07、本人の了承あり）。分かったかどうかの記録なので、Claude はチェックを入れていない。ADR は本人の依頼で Claude が書いた。

- [ ] 基本トークンと意味トークンの違いを、`gray.900` と `fg.default` を例に説明できる
- [ ] 手順 2 で OS をダークにしても暗くならなかった理由を、`_dark` と `_osDark` の違いで説明できる
- [ ] `conditions` を差し替えると、なぜ 2-6 で意味トークンを書き直さなくて済むのかを説明できる
- [ ] 明るいときと暗いときで、`fg.muted` に使える灰色の段が違う理由を、コントラスト比で説明できる
- [ ] 型検査で止まる書き間違いと止まらない書き間違いを、手順 6 の2つを例に説明できる

## 参考

- Panda CSS のトークン: https://panda-css.com/docs/theming/tokens
- Panda CSS の条件つきスタイル: https://panda-css.com/docs/concepts/conditional-styles
- Panda CSS の条件の差し替え: https://github.com/chakra-ui/panda/blob/v2/website/content/docs/theming/conditions.mdx
- WCAG 2.2 コントラスト（最低限）: https://www.w3.org/TR/WCAG22/#contrast-minimum
- デジタル庁デザインシステム カラー: https://design.digital.go.jp/dads/foundations/color/
- ADR `20261106-2104-design-system-panda-v2-react-aria.md`
- ADR `20261107-1637-primitive-values.md`
- 2-2 のチケット `tickets/2-2-primitive-values.md`
