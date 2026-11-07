# 2-2: 基本トークンを自分で決めて、決めた値しか書けないサイトにする

- 起票日: 2026-11-07
- 学習計画: 設計の全体像は `docs/design/20260925-blog-design-proposal.md` の「デザインシステムの作り方」。技術と順番は ADR `20261106-2104-design-system-panda-v2-react-aria.md`
- ステータス: 完了

## 全体のどこか

「見た目を作る」段の3回目で、全8回の3回目にあたる。2-1 で道具を Panda CSS v2 に入れ替えた。この回では、色・文字の大きさ・余白の「使ってよい値の一覧」（基本トークン）を自分で作り、一覧にない値を書くと型検査が止める状態にする。

| Step | 内容                                                                | 進捗       |
| ---- | ------------------------------------------------------------------- | ---------- |
| 2-0  | デザインシステムとは何かを知り、今のサイトを棚卸しする              | ■□□ 進行中 |
| 2-1  | Panda CSS v2 を入れ、Tailwind CSS を外す                            | ■■■ 完了   |
| 2-2  | 基本トークン（色・文字の大きさ・余白）を作る                        | □□□ ← つぎ |
| 2-3  | 意味トークンとダークモードを作る                                    | □□□        |
| 2-4  | 記事ページの文字組みを整える（最初の実戦）                          | □□□        |
| 2-5  | 状態を持たない部品（タグ・カード）を作り、`/design-system` に並べる | □□□        |
| 2-6  | React Aria で状態を持つ部品（テーマ切り替え・メニュー）を作る       | □□□        |
| 2-7  | React Aria のフックに置き換え、さらに自作に置き換える               | □□□        |

2-0 の棚卸しの表（`docs/design/inventory/README.md`）を埋めてから着手するとよい。この回で選ぶ色と大きさは、2-0 の手順 7-c の表で「値」に分けた行から来ている。作業ブランチは作らず、`dev` に直接コミットする。

## 作るもの

| 場所                                                   | 中身                                                                                          |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `theme/tokens.ts`（新規）                              | 基本トークン。色、フォント、文字の大きさ、文字の太さ、行の高さ、余白、`full`                  |
| `panda.config.ts`                                      | `theme.tokens` で自分のトークンを読み込む。`preset-panda` を外し、`strictTokens` を有効にする |
| `panda.config.ts` の `globalCss`                       | `#171717` のような生の値を、`gray.900` のようなトークンの名前に置き換える                     |
| `package.json`                                         | `@pandacss/preset-panda` を外す                                                               |
| `docs/adr/<yyyymmdd-hhmm>-primitive-values.md`（新規） | この回で決めたこと（値の出どころ、名前の付け方、`preset-panda` を外すこと）                   |

今回は扱わないもの: 意味トークン（「本文の文字色」のような用途の名前）とダークモードの作り直し（2-3）、見出しや段落の大きさ・余白を決めること（2-4）、角丸と影（2-5）、日本語の Web フォントを読み込むこと。

## なぜこれをやるか

2-0 の棚卸しで、今のサイトは見出しも本文もリンクも、すべて 16px・同じ色・余白 0 だと分かった。値が決まっていないので、区別のしようがない。2-4 で記事ページを整えるとき、「見出しは何 px にするか」「段落の間はどれだけあけるか」をその場で決めると、ページごとにばらばらの値が増えていく。2-0 の手順 5 で見た「色を変えてもついてこない場所」が増えるのと同じことだ。

そこで先に、使ってよい値の一覧を作る。部品やページは、この一覧から選ぶだけにする。さらに `strictTokens` を有効にすると、一覧にない値を書いた時点で型検査が止める。デザインシステムの「決まった値しか使わない」という約束を、人の注意ではなく道具に守らせる。

2-1 の手順 8 では、Panda が `WebkitFontSmoothing` という知らない名前を止めた。この回はその続きで、止める対象が「CSS の書き方」から「自分で決めた値」に広がる。

## 周辺知識

### Panda のトークン（出典: https://panda-css.com/docs/theming/tokens 、https://panda-css.com/docs/theming/customize-theme 、2026-11-07 確認）

- トークンは `theme.tokens` の下に、種類（category）ごとに書く。1つのトークンは `{ value: "#1a1a1a" }` の形
- `theme.extend.tokens` に書くと、プリセットのトークンに**足す**。`theme.tokens` に書くと、書いた種類だけプリセットのものを**置き換える**。書かなかった種類はプリセットのまま残る
- トークン1つにつき CSS 変数が1つできる。`colors.gray.900` は `--colors-gray-900` になる
- 別のトークンを `{fonts.sans}` の形で参照できる。CSS 変数の値の中でも使える
- `strictTokens: true` にすると、トークンと結びついたプロパティ（`color`、`padding` など）には、トークンの名前しか書けなくなる。どうしても生の値を書きたいときは `[#171717]` のように角かっこで囲む

### この回で使う種類（出典: https://panda-css.com/docs/theming/token-categories ）

| 種類          | 使うプロパティ                                  |
| ------------- | ----------------------------------------------- |
| `colors`      | `color`、`background`、`borderColor` など       |
| `fonts`       | `fontFamily`                                    |
| `fontSizes`   | `fontSize`                                      |
| `fontWeights` | `fontWeight`                                    |
| `lineHeights` | `lineHeight`                                    |
| `spacing`     | `padding`、`gap`、`margin`、`top` など          |
| `sizes`       | `width`、`height`、`minHeight`、`maxWidth` など |

### デジタル庁デザインシステムの値（出典: `@digital-go-jp/design-tokens` 2.1.0 の `dist/tokens.css`、デジタル庁デザインシステムの「タイポグラフィ」「余白」、2026-11-07 確認）

- 灰色（solid gray）は 50・100・200・300・400・420・500・536・600・700・800・900 の12段。420 と 536 は、白い背景とのコントラスト比がちょうど 3:1 と 4.5:1 になる境目の色
- 青（blue）は 50〜1200 の13段。デジタル庁はこれを「キーカラー」に使っている
- 文字の大きさは 14・16・17・18・20・22・24・26・28・32・36・45・48・57・64 px。本文は 16px 以上が基準で、14px は 16px を使いにくい場面に限る
- 行の高さは 100・120・130・140・150・160・170・175（%）。長文の本文は 150% 以上を勧めている
- 余白では、よく使われる基準単位を 8px としている。デザイントークンのパッケージには余白の値がない
- フォントは Noto Sans JP（本文）と Noto Sans Mono（コード）
- 文字と背景のコントラスト比は 4.5:1 以上

### 実測したこと

2026-11-07、`dev` の `f0fed1c` を一時ディレクトリに複製し、macOS / bun 1.4.4 / Node 26.13.0 / Next.js 16.4.1 / Playwright の Chromium で、このチケットの手順どおりに動かした。

- `preset-panda` を入れたままの今のトークンの数は色 290・余白 71・文字の大きさ 14・サイズ 58
- `theme.tokens` に色だけを書くと、色は自分の 25 個だけになり、ほかの種類の数は変わらない
- `strictTokens` がないと、`color: "#171717"` も、存在しない `backgroundColor: "red.500"` も型検査を通る。有効にすると、どちらも止まる
- `preset-panda` を外すと、`app/layout.tsx` の `height: "full"` と `minHeight: "full"` が型エラーになる。`sizes.full` を自分で足すと通る
- `globalCss` の中は `strictTokens` で検査されない。`gray.950` と書き間違えても型検査は通り、CSS には `color: gray\.950;` という効かない値が出る
- 手順 6 のあと、`/posts/blog` の `body`・`h1`・`h2`・`p`・`a` は、フォントが `Geist, "Geist Fallback", "Hiragino Sans", "Noto Sans JP", sans-serif`、文字色が `rgb(26, 26, 26)`、行の高さが `27.2px` になる。ダークモードでは `body` の文字が `rgb(242, 242, 242)`、背景が `rgb(0, 0, 0)`
- 最後の状態でトークンの数は色 25・余白 17・文字の大きさ 8・サイズ 1。`bun run typecheck`、`bun run lint`、`bun run build` が通る

**未確認**: Vercel でのビルド。Windows で日本語がどのフォントで表示されるか。手順 7 の書き間違いが、ブラウザの画面でどう見えるか。

### 現時点のバージョン（2026-11-07 確認）

| パッケージ                     | バージョン | この回での扱い         |
| ------------------------------ | ---------- | ---------------------- |
| `@pandacss/dev`                | 2.5.0      | そのまま               |
| `@pandacss/preset-base`        | 2.5.0      | そのまま               |
| `@pandacss/preset-panda`       | 2.5.0      | 外す                   |
| `@digital-go-jp/design-tokens` | 2.1.0      | 入れない。値を写すだけ |

## 作業手順（全体の地図）

1. `preset-panda` がくれている今のトークンを数える
2. `theme/tokens.ts` に色だけを書き、プリセットの色と置き換える
3. `strictTokens` を有効にし、一覧にない値が止まるのを見る（**この回の本題**）
4. 残りの基本トークン（フォント・文字の大きさ・太さ・行の高さ・余白）を足す
5. `preset-panda` を外し、足りなくなった `full` を自分で足す
6. `globalCss` の生の値を、トークンの名前に置き換える
7. わざと `globalCss` で名前を間違え、止まらないことを確かめる
8. この回で決めたことを ADR に書く
9. lint・型検査・ビルドを通し、コミットして push する

## 確認事項

- [x] **値をどこから持ってくるか。** 推奨案「デジタル庁デザインシステムの値を、`theme/tokens.ts` に手で写す」で作成。理由は設計書でデジタル庁を「読みやすさとアクセシビリティの手本」にすると決めていて、コントラスト比を確かめ済みの色が手に入るから。手で写すのは、値を1つずつ自分で書くこと自体がこの回の学びだから。ただし、デジタル庁が値を更新しても追従しない。写し間違いも起こりうる
- [x] **`@digital-go-jp/design-tokens` を入れるか。** 推奨案「入れない」で作成。理由は、使うのは値の一部だけで、パッケージの CSS 変数（`--color-primitive-blue-500` など）と Panda の CSS 変数が二重にできてしまうから。依存を1つ減らせば、ADR `20261103-1657-supply-chain-hardening.md` の方針にも合う。ただし、パッケージの値を読み込む形なら写し間違いは起きない
- [x] **色をどこまで入れるか。** 推奨案「灰色10段（420 と 536 を除く）、青13段、白、黒の25個」で作成。理由は 2-0 の表で今のサイトが使っている色は文字・背景・リンクだけだから。リンクの色は 2-4 で青から選ぶ。ただし、エラーや注意の色（赤・黄）がない。404 や 500 のページ、ホバーの表現で要るとわかった回に、デジタル庁の赤・黄・緑から足す。そのときは、1型・2型の色覚（赤と緑を見分けにくい見え方）でも区別できるか、色だけで意味を伝えていないか（WCAG 1.4.1）を確かめる。420 と 536 はコントラスト比の境目を示す特別な段で、使う場面が来るまで入れない
- [x] **`preset-panda` を外すか。** 推奨案「外す」で作成。理由は入れたままだと `red.500` のようなプリセットの色や `4`（= 1rem）のような余白が型の上で使えてしまい、「自分で決めた値しか書けない」にならないから。ただし、Panda の公式ドキュメントや記事の例（`p: "4"` など）がそのままでは動かなくなる。`full` のように、プリセットがくれていた便利な値も自分で足す必要がある
- [x] **`strictTokens` を有効にするか。** 推奨案「有効にする」で作成。理由は「なぜこれをやるか」のとおり。ただし、1回しか使わない値（画像の幅など）も角かっこ（`[640px]`）で書く手間がかかる。`globalCss` の中は検査されないという穴も残る（手順 7）
- [x] **トークンの名前の付け方。** 推奨案「文字の大きさと余白は px の数（`16` が 16px）、行の高さは % の数（`170` が 1.7）、色はデジタル庁の段の番号」で作成。理由は名前を見れば値が分かり、デジタル庁の表と見比べやすいから。ただし、Tailwind や Panda のプリセットでは `4` が 1rem（16px）を指すので、ほかの資料を読むときに数字の意味が食い違う。名前が値そのものなので、値を変えると名前も変える必要がある。用途で値を差し替える仕組みは 2-3 の意味トークンで作る
- [x] **余白の段。** 推奨案「0・4・8・16・24・32・40・48・64（px）」で作成。理由は、デジタル庁が基準単位を 8px としているから。8px の倍数に、細かい調整用の 4 を足した。ただし、12px や 20px はない。2-4 で足りないとわかったら足す
- [x] **文字の大きさの段。** 推奨案「14・16・18・20・24・28・32・36（px）」で作成。デジタル庁の段から、ブログの本文と見出しで使いそうなものを選んだ。ただし、17・22・26 と、45 以上の大きな段は入れていない
- [x] **日本語のフォント。** 推奨案「Web フォントは読み込まず、`Geist` → `Hiragino Sans` → `Noto Sans JP` → `sans-serif` の順に並べる」で作成。理由は、日本語の Web フォントは数 MB あってページが重くなり、macOS と iOS ならヒラギノが入っているから。英数字は今までどおり Geist で表示される。ただし、デジタル庁が勧める Noto Sans JP が表示されるのは、それが入っている端末だけになる。Windows では OS の既定のゴシック体になる（未確認）
- [x] **この回で見た目を変えるか。** 推奨案「変える」で作成。理由は手順 6 で生の値をトークンの名前に置き換えると、デジタル庁の値に寄るから。変わるのは文字色（`#171717` → `#1a1a1a`）、ダークモードの背景（`#0a0a0a` → `#000000`）と文字色（`#ededed` → `#f2f2f2`）、本文のフォント（Arial → Geist とヒラギノ）、行の高さ（1.5 → 1.7）。ただし、2-1 で守った「見た目を変えない」とは違い、変化が5か所まとめて起きる。この回は道具を替えないので、どこが変わったかは手順 6 の表で追える
- [x] **トークンの置き場所。** 推奨案「`theme/tokens.ts` に分け、`panda.config.ts` から読み込む」で作成。理由は、トークンは 2-3 の意味トークンでさらに増え、設定ファイルが長くなるから。ただし、フォルダが1つ増える。`theme/` は `css()` を書かない場所なので、`panda.config.ts` の `include` には足さない
- [x] **ダークモードの書き方。** 推奨案「`globalCss` の `_osDark` は残し、値だけトークンの名前に替える」で作成。理由は、ダークモードの作り直しは 2-3 の仕事だから。ただし、`_osDark` を使う書き方は 2-3 で意味トークンに書き直すので、この回の書き方は一時的なもの
- [x] **ADR を書くか。** 推奨案「書く（手順 8）」で作成。理由は、値の出どころと名前の付け方は、2-3 以降の回でも前提になる決めごとだから。ただし、手順が1つ増える
- [x] **【標準ルールからの逸脱】TDD を適用しない。** 本人の判断（2026-11-03）による。確かめるのは型検査の結果と、ブラウザで計算された値

## ハンズオン

コマンドの出力とブラウザの値は、`f0fed1c` を一時ディレクトリに複製して実際に動かし、写したもの（2026-11-07、bun 1.4.4 / Next.js 16.4.1 / Playwright の Chromium）。Chrome の DevTools の画面操作は、この環境では確かめていない。

---

### 準備：この回で何をするのか

サイトで使ってよい色・文字の大きさ・余白の一覧を `theme/tokens.ts` に作る。次に、一覧にない値を書いたら型検査が止まるようにする。最後に、`globalCss` に残っていた `#171717` のような生の値を、一覧の名前に置き換える。

#### トークンは「絵の具セット」

基本トークンは絵の具セットのようなものだ。セットには「灰色の 900 番」「青の 500 番」のように番号の付いたチューブが並んでいて、絵を描く人はその中から選ぶ。自分で好きな色を混ぜて作ってはいけない、という約束にしておけば、何枚描いても色がそろう。

今のサイトは絵の具セットを持たずに、描くたびに色を混ぜている状態だ。`#171717` という色は `globals.css` で一度混ぜただけの色で、名前がない。だから、ほかの場所で同じ色を使いたくても、同じ色を混ぜ直すしかない。

2-3 で作る意味トークンは、「空を塗るときは青の 500 番」という塗り分けの約束にあたる。この回はその前のチューブをそろえる回だ。

#### 用意するもの

- 2-1 を終えた `dev`
- Chrome
- デジタル庁デザインシステムの「カラー」のページ（https://design.digital.go.jp/dads/foundations/color/ ）。手順 2 で値を見比べるときに開く

---

### 手順 1：`preset-panda` がくれている今のトークンを数える

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
git switch dev
git pull
bun run panda codegen
```

期待される出力（パスは自分の環境のものになる）:

```
codegen: wrote 74 files to /Users/.../65-blog-app/styled-system
```

トークンの数を数える。次の1行は `styled-system/types/tokens.d.ts` に書かれた4種類のトークンの名前を数えるコマンドだ。手順 2 と 4 でも使うので、どこかに控えておく。

```bash
for t in ColorToken SpacingToken FontSizeToken SizeToken; do printf "%-14s %s\n" $t "$(grep -o "export type $t = [^>]*" styled-system/types/tokens.d.ts | grep -o '"[a-z0-9.-]*"' | wc -l | tr -d ' ')"; done
```

期待される出力:

```
ColorToken     290
SpacingToken   71
FontSizeToken  14
SizeToken      58
```

**なぜ** — 2-1 で入れた `@pandacss/preset-panda` は 290 色のトークンを最初から用意している。`red.500` も `teal.300` も、このサイトで一度も使っていないのに、書けば通る。絵の具セットを自分で決める前に、他人が用意した大きなセットがすでに置いてある状態だ。この数字が手順 2 と 5 でどう減るかを見ていく。

`styled-system/types/tokens.d.ts` を開くと、`export type ColorToken = ... "amber.100" | "amber.200" | ...` のように、名前が `|` でつながって並んでいる。`css()` に書いた値がこの中にあるかを型検査が調べる。トークンを変えると、`panda codegen` がこの一覧を書き直す。

---

### 手順 2：`theme/tokens.ts` に色だけを書き、プリセットの色と置き換える

リポジトリの直下に `theme` フォルダを作る。

```bash
mkdir -p theme
```

`theme/tokens.ts` を作り、次の内容を貼る。

```ts
import { defineTokens } from "@pandacss/dev";

export const tokens = defineTokens({
  colors: {
    white: { value: "#ffffff" },
    black: { value: "#000000" },
    gray: {
      50: { value: "#f2f2f2" },
      100: { value: "#e6e6e6" },
      200: { value: "#cccccc" },
      300: { value: "#b3b3b3" },
      400: { value: "#999999" },
      500: { value: "#7f7f7f" },
      600: { value: "#666666" },
      700: { value: "#4d4d4d" },
      800: { value: "#333333" },
      900: { value: "#1a1a1a" },
    },
    blue: {
      50: { value: "#e8f1fe" },
      100: { value: "#d9e6ff" },
      200: { value: "#c5d7fb" },
      300: { value: "#9db7f9" },
      400: { value: "#7096f8" },
      500: { value: "#4979f5" },
      600: { value: "#3460fb" },
      700: { value: "#264af4" },
      800: { value: "#0031d8" },
      900: { value: "#0017c1" },
      1000: { value: "#00118f" },
      1100: { value: "#000071" },
      1200: { value: "#000060" },
    },
  },
});
```

値はデジタル庁デザインシステムの「カラーパレット」と同じものだ。カラーのページから「カラーパレット」を開き、灰色（Solid Gray）と青（Blue）の段を2つ3つ見比べておく。

`panda.config.ts` を2か所書き換える。まず、1行目の次に import を足す。

```ts
import { defineConfig } from "@pandacss/dev";
import { tokens } from "./theme/tokens";
```

次に、`theme` の中身を替える。

変える前:

```ts
  theme: {
    extend: {},
  },
```

変えたあと:

```ts
  theme: {
    tokens,
  },
```

もう一度生成して、数える。

```bash
bun run panda codegen
for t in ColorToken SpacingToken FontSizeToken SizeToken; do printf "%-14s %s\n" $t "$(grep -o "export type $t = [^>]*" styled-system/types/tokens.d.ts | grep -o '"[a-z0-9.-]*"' | wc -l | tr -d ' ')"; done
```

期待される出力:

```
ColorToken     25
SpacingToken   71
FontSizeToken  14
SizeToken      58
```

**なぜ** — 色だけが 290 から 25（白・黒・灰色10・青13）に減り、余白・文字の大きさ・サイズはそのままだ。`extend` を付けずに `theme.tokens.colors` に書くと、プリセットの色の一覧が**丸ごと自分のものに置き換わる**。書かなかった種類（余白など）は、プリセットの一覧が残る。

`extend` を付けると「足す」、付けないと「置き換える」。絵の具セットで言えば、`extend` は他人のセットに自分のチューブを足すこと、付けないのは色のチューブだけ自分のセットに入れ替えることだ。この回では他人のチューブを残したくないので、付けない。

---

### 手順 3：この回の本題。`strictTokens` を有効にし、一覧にない値が止まるのを見る

#### 3-a：まず、止まらないことを確かめる

`app/layout.tsx` の `<body>` の `css()` に、2行足す。

変える前:

```tsx
        className={css({
          minHeight: "full",
          display: "flex",
          flexDirection: "column",
        })}
```

変えたあと:

```tsx
        className={css({
          minHeight: "full",
          color: "#171717",
          backgroundColor: "red.500",
          display: "flex",
          flexDirection: "column",
        })}
```

`#171717` は今までの文字色で、トークンの一覧にない生の値だ。`red.500` は、手順 2 で色を置き換えたので、もう存在しない名前だ。

```bash
bun run typecheck
```

期待される出力（最後の行。エラーは出ない）:

```
✓ Types generated successfully
```

**どちらも通ってしまう。** Panda は今の設定では「トークンの名前を書いてもいいし、ふつうの CSS の値を書いてもいい」と考える。`red.500` も「ふつうの CSS の値かもしれない」として通す。ブラウザから見れば `background-color: red.500` は意味のない値なので、何も塗られない。書き間違いが、誰にも言われずに効かないだけになる。2-1 で見た Tailwind の打ち間違いと同じ状態だ。

#### 3-b：`strictTokens` を有効にする

`panda.config.ts` の `preflight: true,` の次の行に、1行足す。

```ts
  preflight: true,
  strictTokens: true,
```

```bash
bun run typecheck
```

期待される出力（抜粋）:

```
app/layout.tsx(46,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type '"#171717"' is not assignable to type 'ConditionalValue<ColorsValue>'.
app/layout.tsx(47,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type '"red.500"' is not assignable to type 'ConditionalValue<ColorsValue>'.
```

**今度は2つとも止まった。** `ColorsValue` は「色のトークンの名前のどれか」という型だ。`strictTokens` を有効にすると、`color` や `backgroundColor` には手順 1 で見た一覧の名前しか書けなくなる。生の値も、存在しない名前も、動かす前に見つかる。

#### 3-c：正しい名前なら通ることを確かめ、元に戻す

足した2行を、一覧にある名前に書き換える。

```tsx
          color: "gray.900",
          backgroundColor: "blue.50",
```

```bash
bun run typecheck
```

期待される出力（最後の行）:

```
✓ Types generated successfully
```

確かめたら、足した2行（`color` と `backgroundColor`）を消して、3-a の「変える前」の形に戻す。`strictTokens: true` は残す。

**この手順で分かること** — トークンを作るだけでは、デザインシステムの約束は守られない。一覧の外の値も書けるなら、急いでいるときに `#171717` と書いてしまい、一覧は使われなくなっていく。`strictTokens` は「絵の具セットの外の色は使えない」という約束を、型検査に見張らせる設定だ。この先の回で部品を作るときも、値を選ぶ場所は `theme/tokens.ts` の1か所に限られる。2-3 で意味トークンを足すと、`color: "text.body"` のような用途の名前も同じ一覧に入り、同じように守られる。

一覧にない値をどうしても1回だけ使いたいときは、`[640px]` のように角かっこで囲めば書ける。角かっこはコードを読む人にも「ここは例外」と見えるので、例外がどこにあるかを探しやすい。

---

### 手順 4：残りの基本トークンを足す

`theme/tokens.ts` の中身を、次の内容に置き換える。`colors` は手順 2 と同じで、その下に5つの種類を足した。

```ts
import { defineTokens } from "@pandacss/dev";

export const tokens = defineTokens({
  colors: {
    white: { value: "#ffffff" },
    black: { value: "#000000" },
    gray: {
      50: { value: "#f2f2f2" },
      100: { value: "#e6e6e6" },
      200: { value: "#cccccc" },
      300: { value: "#b3b3b3" },
      400: { value: "#999999" },
      500: { value: "#7f7f7f" },
      600: { value: "#666666" },
      700: { value: "#4d4d4d" },
      800: { value: "#333333" },
      900: { value: "#1a1a1a" },
    },
    blue: {
      50: { value: "#e8f1fe" },
      100: { value: "#d9e6ff" },
      200: { value: "#c5d7fb" },
      300: { value: "#9db7f9" },
      400: { value: "#7096f8" },
      500: { value: "#4979f5" },
      600: { value: "#3460fb" },
      700: { value: "#264af4" },
      800: { value: "#0031d8" },
      900: { value: "#0017c1" },
      1000: { value: "#00118f" },
      1100: { value: "#000071" },
      1200: { value: "#000060" },
    },
  },
  fonts: {
    sans: {
      value: 'var(--font-geist-sans), "Hiragino Sans", "Noto Sans JP", sans-serif',
    },
    mono: { value: "var(--font-geist-mono), monospace" },
  },
  fontSizes: {
    14: { value: "0.875rem" },
    16: { value: "1rem" },
    18: { value: "1.125rem" },
    20: { value: "1.25rem" },
    24: { value: "1.5rem" },
    28: { value: "1.75rem" },
    32: { value: "2rem" },
    36: { value: "2.25rem" },
  },
  fontWeights: {
    normal: { value: "400" },
    bold: { value: "700" },
  },
  lineHeights: {
    100: { value: "1" },
    140: { value: "1.4" },
    150: { value: "1.5" },
    170: { value: "1.7" },
  },
  spacing: {
    0: { value: "0" },
    4: { value: "0.25rem" },
    8: { value: "0.5rem" },
    16: { value: "1rem" },
    24: { value: "1.5rem" },
    32: { value: "2rem" },
    40: { value: "2.5rem" },
    48: { value: "3rem" },
    64: { value: "4rem" },
  },
});
```

| 種類          | 名前の読み方 | 例                             |
| ------------- | ------------ | ------------------------------ |
| `fonts`       | 用途         | `sans` は本文、`mono` はコード |
| `fontSizes`   | px の数      | `16` は 16px（= `1rem`）       |
| `fontWeights` | 太さの呼び名 | `bold` は `700`                |
| `lineHeights` | % の数       | `170` は文字の大きさの 1.7 倍  |
| `spacing`     | px の数      | `24` は 24px（= `1.5rem`）     |

```bash
bun run panda codegen
for t in ColorToken SpacingToken FontSizeToken SizeToken; do printf "%-14s %s\n" $t "$(grep -o "export type $t = [^>]*" styled-system/types/tokens.d.ts | grep -o '"[a-z0-9.-]*"' | wc -l | tr -d ' ')"; done
```

期待される出力（この時点の数は、手順 2 と最後の状態の実測から求めたもの。この時点では数えていない）:

```
ColorToken     25
SpacingToken   17
FontSizeToken  8
SizeToken      58
```

**なぜ値を `rem` で書くのか** — `rem` は「ブラウザの文字の大きさの設定」を 1 とする単位だ。ふつうは 16px なので `1rem` は 16px になる。目の見えにくい人がブラウザの設定で文字を大きくすると、`rem` で書いた文字と余白も一緒に大きくなる。`px` で書くと大きくならない。名前は px の数にして覚えやすくし、値は `rem` にして設定に追従させている。

**余白が 9 個なのに 17 と出るわけ** — `styled-system/types/tokens.d.ts` の `SpacingToken` の行を見ると、`"-16"` や `"-24"` のように、マイナスの付いた名前も並んでいる。Panda が余白から自動で作る「逆向きの余白」で、`marginTop: "-16"` と書けば要素を 16px 上にずらせる。0 にはマイナスがないので、9 + 8 = 17 になる。

**`fonts.sans` の並び順** — フォントは左から順に試される。英数字は Geist で表示され、Geist に日本語の文字はないので、日本語は次の `Hiragino Sans`（macOS と iOS に入っている）で表示される。どちらもない端末では、`Noto Sans JP`、最後に OS の既定のゴシック体（`sans-serif`）になる。

---

### 手順 5：`preset-panda` を外し、足りなくなった `full` を自分で足す

#### 5-a：設定から外す

`panda.config.ts` の `presets` から、`"@pandacss/preset-panda"` を消す。

変える前:

```ts
  presets: ["@pandacss/preset-base", "@pandacss/preset-panda"],
```

変えたあと:

```ts
  presets: ["@pandacss/preset-base"],
```

```bash
bun run typecheck
```

期待される出力（抜粋）:

```
app/layout.tsx(41,71): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type '"full"' is not assignable to type 'ConditionalValue<HeightValue>'.
app/layout.tsx(45,11): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Type '"full"' is not assignable to type 'ConditionalValue<MinHeightValue>'.
```

**何が起きたか** — 2-1 で `h-full` を `height: "full"` と書き換えた。この `full` は CSS の言葉ではなく、`preset-panda` が用意していた `sizes` のトークン（値は `100%`）だった。プリセットを外したので、`full` という名前がなくなった。`strictTokens` が有効なので、型検査がそれを見つけた。

#### 5-b：`sizes.full` を自分で足す

`theme/tokens.ts` の `spacing` の閉じかっこ `},` の次に、`sizes` を足す。ファイルの終わりはこうなる。

```ts
    48: { value: "3rem" },
    64: { value: "4rem" },
  },
  sizes: {
    full: { value: "100%" },
  },
});
```

```bash
bun run typecheck
```

期待される出力（最後の行）:

```
✓ Types generated successfully
```

#### 5-c：パッケージを外す

```bash
bun remove @pandacss/preset-panda
```

期待される出力（抜粋）:

```
- @pandacss/preset-panda
1 package removed
```

**なぜ** — 設定から外したパッケージを入れたままにしておく理由はない。ADR `20261103-1657-supply-chain-hardening.md` のとおり、依存は少ないほうが、中身を確かめる対象も減る。

`preset-base` は残す。`display` や `_hover`、`fontSmoothing` のような「CSS の書き方」を用意しているのが `preset-base` で、`red.500` や `full` のような「値」を用意しているのが `preset-panda` だった。書き方は借りたまま、値は自分で持つ形になった。

---

### 手順 6：`globalCss` の生の値を、トークンの名前に置き換える

`panda.config.ts` の `globalCss` を書き換える。

変える前:

```ts
  globalCss: {
    ":root": {
      colorScheme: "light dark",
      "--global-font-body": "var(--font-geist-sans)",
      "--global-font-mono": "var(--font-geist-mono)",
    },
    body: {
      background: { base: "#ffffff", _osDark: "#0a0a0a" },
      color: { base: "#171717", _osDark: "#ededed" },
      fontFamily: "Arial, Helvetica, sans-serif",
    },
  },
```

変えたあと:

```ts
  globalCss: {
    ":root": {
      colorScheme: "light dark",
      "--global-font-body": "{fonts.sans}",
      "--global-font-mono": "{fonts.mono}",
    },
    body: {
      background: { base: "white", _osDark: "black" },
      color: { base: "gray.900", _osDark: "gray.50" },
      fontSize: "16",
      lineHeight: "170",
    },
  },
```

| 変えたところ              | 前                  | 後                                   |
| ------------------------- | ------------------- | ------------------------------------ |
| `--global-font-body`      | Geist だけ          | `{fonts.sans}`（Geist → ヒラギノ …） |
| `body` の `fontFamily`    | Arial               | 消した。`html` のフォントを受け継ぐ  |
| `body` の文字色           | `#171717`           | `gray.900`（`#1a1a1a`）              |
| `body` の背景（ダーク）   | `#0a0a0a`           | `black`（`#000000`）                 |
| `body` の文字色（ダーク） | `#ededed`           | `gray.50`（`#f2f2f2`）               |
| `body` の行の高さ         | 1.5（リセットの値） | `170`（1.7）                         |

`{fonts.sans}` は「`fonts.sans` のトークンを使う」という書き方だ。CSS では `var(--fonts-sans)` になる。

開発サーバーを起動する。

```bash
bun dev
```

http://localhost:3000/posts/blog を開き、DevTools の Console に次のコードを貼る。2-0 の手順 3 のコードから、列を行の高さに入れ替えたものだ。

```js
console.table(
  ["html", "body", "h1", "h2", "p", "a", "pre"].map((selector) => {
    const s = getComputedStyle(document.querySelector(selector));
    return {
      selector,
      fontFamily: s.fontFamily,
      fontSize: s.fontSize,
      lineHeight: s.lineHeight,
      color: s.color,
    };
  }),
);
```

期待される出力（ライトモード）:

| selector | fontFamily                                                           | fontSize | lineHeight | color           |
| -------- | -------------------------------------------------------------------- | -------- | ---------- | --------------- |
| html     | Geist, "Geist Fallback", "Hiragino Sans", "Noto Sans JP", sans-serif | 16px     | 24px       | rgb(0, 0, 0)    |
| body     | Geist, "Geist Fallback", "Hiragino Sans", "Noto Sans JP", sans-serif | 16px     | 27.2px     | rgb(26, 26, 26) |
| h1       | Geist, "Geist Fallback", "Hiragino Sans", "Noto Sans JP", sans-serif | 16px     | 27.2px     | rgb(26, 26, 26) |
| h2       | Geist, "Geist Fallback", "Hiragino Sans", "Noto Sans JP", sans-serif | 16px     | 27.2px     | rgb(26, 26, 26) |
| p        | Geist, "Geist Fallback", "Hiragino Sans", "Noto Sans JP", sans-serif | 16px     | 27.2px     | rgb(26, 26, 26) |
| a        | Geist, "Geist Fallback", "Hiragino Sans", "Noto Sans JP", sans-serif | 16px     | 27.2px     | rgb(26, 26, 26) |
| pre      | "Geist Mono", "Geist Mono Fallback", monospace                       | 16px     | 27.2px     | rgb(36, 41, 46) |

2-0 の表と比べると、本文が Arial から Geist とヒラギノに変わり、日本語の見た目が変わったはずだ。行の高さが 24px から 27.2px（16px × 1.7）に広がり、行と行の間も少しあいた。`pre` の色は Shiki が持っている色なので変わらない。

ダークモードも確かめる。DevTools の `Cmd + Shift + P` で `dark` と打ち、「Emulate CSS prefers-color-scheme: dark」を選んでから、次のコードを貼る。

```js
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

最後に、トークンが CSS 変数になっていることを見る。

```js
const root = getComputedStyle(document.documentElement);
console.table(
  ["--colors-gray-900", "--colors-blue-500", "--font-sizes-16", "--spacing-24", "--sizes-full"].map(
    (name) => ({ name, value: root.getPropertyValue(name) }),
  ),
);
```

期待される出力:

| name              | value   |
| ----------------- | ------- |
| --colors-gray-900 | #1a1a1a |
| --colors-blue-500 | #4979f5 |
| --font-sizes-16   | 1rem    |
| --spacing-24      | 1.5rem  |
| --sizes-full      | 100%    |

**なぜ** — `theme/tokens.ts` に書いた1つ1つが、`--colors-gray-900` のような CSS 変数になってページに入っている。`css({ color: "gray.900" })` は `color: var(--colors-gray-900)` という CSS になる。値の本体は1か所にあり、使う場所は名前で指しているだけだ。2-3 では、この仕組みを使って、ダークモードのときだけ変数の中身を差し替える。

確かめたら、`Ctrl + C` で開発サーバーを止める。

---

### 手順 7：わざと `globalCss` で名前を間違え、止まらないことを確かめる

`panda.config.ts` の `globalCss` の `gray.900` を、存在しない `gray.950` に書き換える。

```ts
      color: { base: "gray.950", _osDark: "gray.50" },
```

```bash
bun run typecheck
```

期待される出力（最後の行。エラーは出ない）:

```
✓ Types generated successfully
```

Panda が作る CSS を、ファイルに書き出して確かめる。書き出し先はコミットしない `styled-system/` の中にする。

```bash
bun run panda cssgen --outfile styled-system/check.css
grep -n "gray" styled-system/check.css | grep "color:"
```

期待される出力（抜粋。行の番号は変わることがある）:

```
155:    color: gray\.950;
165:      color: var(--colors-gray-50);
```

**`globalCss` は見張りの外にある。** `strictTokens` が調べるのは、`app/` の中の `css()` だけだ。`panda.config.ts` の中の `globalCss` は型で守られないので、知らない名前は Panda がそのまま CSS に書き出す。`gray\.950` という色はないので、ブラウザはこの行を無視する。だから `globalCss` にはページ全体に効く最小限の指定だけを置き、部品やページの見た目は `css()` で書く。

確かめたら、`gray.950` を `gray.900` に戻し、書き出したファイルを片付ける。

```bash
D=~/.claude/delete/$(date +%Y%m%d-%H%M)
mkdir -p "$D"
mv styled-system/check.css "$D/"
```

---

### 手順 8：この回で決めたことを ADR に書く

`docs/adr/` に ADR を作る。ファイル名の `yyyymmdd-hhmm` は作った日時に書き換える（例: `20261108-1030-primitive-values.md`）。

```markdown
# 基本トークンはデジタル庁デザインシステムの値を写し、自分で決めた値しか書けないようにする

- 日付: 2026-11-xx
- 状態: 採用

## 背景

2-0 の棚卸しで、見出し・本文・リンクがすべて同じ大きさと色で、余白もないと分かった。2-4 で記事ページを整える前に、使ってよい色・文字の大きさ・余白の一覧（基本トークン）を作る。

## 決めたこと

- 値は、デジタル庁デザインシステムの値を `theme/tokens.ts` に手で写す。`@digital-go-jp/design-tokens` は入れない
- 色は灰色10段・青13段・白・黒の25個から始め、要るとわかったら足す
- 名前は、文字の大きさと余白は px の数、行の高さは % の数、色はデジタル庁の段の番号にする。値は `rem` で書く
- `@pandacss/preset-panda` を外し、`strictTokens: true` にする。一覧にない値は、角かっこで囲まない限り型検査で止まる

## 理由

- デジタル庁の値はコントラスト比が確かめてあり、設計書でも読みやすさの手本にすると決めている
- `preset-panda` が入っていると、使っていない 290 色が型の上で使えてしまい、一覧を自分で決めた意味がなくなる

## 採らなかった案

- **`@digital-go-jp/design-tokens` を入れて読み込む。** 写し間違いは起きないが、パッケージと Panda の CSS 変数が二重にでき、依存も1つ増える
- **`theme.extend.tokens` でプリセットに足す。** プリセットの値が残り、一覧の外の値を書けてしまう
- **Panda のプリセットと同じ名前の付け方（`4` が 1rem）。** Panda の資料と読み比べやすいが、デジタル庁の表と見比べにくい

## 気をつけること

- `globalCss` の中は `strictTokens` で検査されない。書き間違えても止まらない
- 日本語の Web フォントは読み込んでいない。Noto Sans JP が表示されるのは、入っている端末だけ
```

**なぜ** — この回で決めた名前の付け方や `preset-panda` を外したことは、2-3 以降の回の前提になる。あとで「なぜ `p: "4"` が使えないのか」と思ったときに、理由をたどれるようにしておく。

---

### 手順 9：lint・型検査・ビルドを通し、コミットして push する

```bash
bun run format
bun run lint
bun run build
```

期待される出力（`lint` の最後と、`build` の途中）:

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
 M bun.lock
 M package.json
 M panda.config.ts
?? docs/adr/20261108-1030-primitive-values.md
?? theme/
```

`app/layout.tsx` が出ていたら、手順 3-c で足した2行が残っている。`content/pandacss.mdx` や `docs/design/inventory/` のように、この回と関係ないファイルが出ていても、下の `git add` には含めない。

```bash
git add bun.lock package.json panda.config.ts theme docs/adr
git commit -m "feat: 基本トークンをデジタル庁の値で作り、一覧にない値を書いたら型検査で止める"
git push
```

push したら、Vercel のビルドが通り、本番のフォントと行の高さが手順 6 のとおりに変わっていることを確かめる。

---

### うまくいかないとき

| 症状                                                                         | 原因と対処                                                                                                                    |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `Type '"full"' is not assignable to type 'ConditionalValue<HeightValue>'`    | 手順 5-a のとおり。`theme/tokens.ts` に `sizes.full` を足す（5-b）                                                            |
| `Type '"#171717"' is not assignable to type 'ConditionalValue<ColorsValue>'` | `strictTokens` が効いている。トークンの名前（`gray.900` など）に直す。どうしても生の値が要るなら `[#171717]` と書く           |
| 手順 1 や 2 の数が期待される出力と違う                                       | `bun run panda codegen` を実行する前に数えている。トークンの一覧は codegen で書き直される                                     |
| `Cannot find module './theme/tokens'`                                        | `theme/tokens.ts` の場所か名前が違う。リポジトリの直下に `theme` フォルダがあり、その中に `tokens.ts` があるかを確かめる      |
| `css()` に `p: "4"` と書いたら思ったより狭い                                 | `preset-panda` を外したので、`4` は 4px（`0.25rem`）を指す。Panda の資料の `4`（16px）にあたるのは、このサイトでは `16`       |
| ダークモードにしても色が変わらない                                           | `globalCss` の `_osDark` の値を書き間違えている可能性がある。手順 7 のとおり `globalCss` は型で守られないので、名前を見比べる |

ここに載っていないエラーが出たら、そのまま貼って聞いてほしい。

---

## 受け入れ条件

- [x] `theme/tokens.ts` があり、`colors`・`fonts`・`fontSizes`・`fontWeights`・`lineHeights`・`spacing`・`sizes` の7種類が書かれている
- [x] `panda.config.ts` の `presets` が `["@pandacss/preset-base"]` だけで、`strictTokens: true` があり、`theme` が `extend` を使わずに `tokens` を読み込んでいる
- [x] `package.json` に `@pandacss/preset-panda` がない
- [x] `panda.config.ts` の `globalCss` に `#` で始まる色の値がなく、`Arial` もない
- [x] 手順 1 のコマンドを実行すると、`ColorToken 25`・`SpacingToken 17`・`FontSizeToken 8`・`SizeToken 1` と出る
- [ ] `app/layout.tsx` の `css()` に `color: "#171717"` を足すと `bun run typecheck` が止まる（確かめたら消す）（未確認のままコミット。今の状態で typecheck が通ることは確かめた）
- [ ] `/posts/blog` で手順 6 のコードを動かすと、`body` の文字色が `rgb(26, 26, 26)`、行の高さが `27.2px` になる（未確認のままコミット。ブラウザでの確認は本人の画面で行う）
- [ ] ダークモードにすると、`body` の文字が `rgb(242, 242, 242)`、背景が `rgb(0, 0, 0)` になる（未確認のままコミット。ブラウザでの確認は本人の画面で行う）
- [x] `docs/adr/` に、この回の ADR がある
- [x] `bun run lint` と `bun run build` が通る
- [ ] `dev` にコミットして push し、Vercel のビルドが通っている（コミットの時点では未 push）

## この回で理解したこと

着手後に埋める。受け入れ条件とは別に、何が分かったかを残す。

未チェックのままコミットした（2026-11-07、本人の了承あり）。分かったかどうかの記録なので、Claude はチェックを入れていない。

- [ ] `theme.tokens` と `theme.extend.tokens` の違いを、手順 2 の数の変化を例に説明できる
- [ ] `strictTokens` がないと何が困るかを、手順 3-a で `red.500` が通ったことを例に説明できる
- [ ] `preset-base` と `preset-panda` がそれぞれ何を用意していたかを、手順 5 の `full` のエラーと結びつけて説明できる
- [ ] トークンがページの中で何になっているか（CSS 変数）と、それが 2-3 のダークモードにどうつながるかを説明できる
- [ ] `globalCss` に部品の見た目を書かないほうがよい理由を、手順 7 を例に説明できる
- [ ] 値を `rem` で書く理由を説明できる

## 参考

- Panda CSS のトークン: https://panda-css.com/docs/theming/tokens
- Panda CSS のトークンの種類: https://panda-css.com/docs/theming/token-categories
- Panda CSS のテーマの上書き（`extend` の有無）: https://panda-css.com/docs/theming/customize-theme
- Panda CSS の `strictTokens`: https://panda-css.com/docs/concepts/writing-styles
- デジタル庁デザインシステム カラー: https://design.digital.go.jp/dads/foundations/color/
- デジタル庁デザインシステム タイポグラフィ: https://design.digital.go.jp/dads/foundations/typography/
- デジタル庁デザインシステム 余白: https://design.digital.go.jp/dads/foundations/spacing/
- デジタル庁のデザイントークン: https://github.com/digital-go-jp/design-tokens
- ADR `20261106-2104-design-system-panda-v2-react-aria.md`
- 2-1 のチケット `tickets/2-1-install-panda-css.md`
