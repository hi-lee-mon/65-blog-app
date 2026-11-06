# 2-1: Panda CSS v2 を入れて Tailwind CSS を外し、見た目を変えずに道具だけ入れ替える

- 起票日: 2026-11-06
- 学習計画: 設計の全体像は `docs/design/20260925-blog-design-proposal.md` の「デザインシステムの作り方」。技術と順番は ADR `20261106-2104-design-system-panda-v2-react-aria.md`
- ステータス: 完了

## 全体のどこか

「見た目を作る」段の2回目で、全8回の2回目にあたる。2-0 で今のサイトの部品と値を棚卸しした。この回では見た目を作る道具を Tailwind CSS から Panda CSS v2 に入れ替える。見た目はまだ変えない。

| Step | 内容                                                                | 進捗       |
| ---- | ------------------------------------------------------------------- | ---------- |
| 2-0  | デザインシステムとは何かを知り、今のサイトを棚卸しする              | ■■□ 進行中 |
| 2-1  | Panda CSS v2 を入れ、Tailwind CSS を外す                            | □□□ ← つぎ |
| 2-2  | 基本トークン（色・文字の大きさ・余白）を作る                        | □□□        |
| 2-3  | 意味トークンとダークモードを作る                                    | □□□        |
| 2-4  | 記事ページの文字組みを整える（最初の実戦）                          | □□□        |
| 2-5  | 状態を持たない部品（タグ・カード）を作り、`/design-system` に並べる | □□□        |
| 2-6  | React Aria で状態を持つ部品（テーマ切り替え・メニュー）を作る       | □□□        |
| 2-7  | React Aria のフックに置き換え、さらに自作に置き換える               | □□□        |

2-0 を終えてから着手する。手順 9 で 2-0 の表と値を見比べるためだ。作業ブランチは作らず、`dev` に直接コミットする。

## 作るもの

| 場所                      | 中身                                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| `package.json`            | Panda の3パッケージを足し、Tailwind の2パッケージを外す。`"type": "module"` と、スクリプトを2つ直す |
| `panda.config.ts`（新規） | Panda の設定。調べるファイルの場所と、今の色・フォントを移した `globalCss`                          |
| `postcss.config.mjs`      | 使うプラグインを Tailwind から Panda に替える                                                       |
| `app/globals.css`         | Tailwind の読み込みと今の色の指定を消し、Panda の層の順番を書いた1行だけにする                      |
| `app/layout.tsx`          | Tailwind のクラス（`h-full` など）を、Panda の `css()` に書き換える                                 |
| `.gitignore`              | Panda が作る `styled-system/` を追跡しない                                                          |

今回は扱わないもの: トークンを作ること（2-2）、見た目を変えること、ダークモードの作り直し（2-3）、`oxlint-plugins/nextjs-metadata.mts` の拡張子を `.ts` に戻すこと。

## なぜこれをやるか

2-2 からは Panda の `theme.tokens` に色や余白の名前を書いていく。その前に、道具の入れ替えだけを1回で済ませておく。入れ替えと見た目の変更を同じ回でやると、表示が変わったときに、どちらのせいかが分からなくなるからだ。

そこで、この回の終わりの見た目は 2-0 のときと同じにする。2-0 の手順 3 のコードをもう一度動かし、同じ値が出れば、入れ替えだけが済んだと言える。

ADR には「2-1 で確かめる」と書いた点が2つある。`"type": "module"` を足して壊れないかと、Turbopack の上で PostCSS 経由で動くかだ。この回で、どちらも自分の手元で確かめる。

## 周辺知識

### Panda CSS v2（出典: https://panda-css.com/blog/panda-css-v2 、npm、2026-11-06 確認）

- 2026-09-29 に正式版。2026-11-06 時点の最新は 2.5.0（2026-11-02 公開。`bunfig.toml` の3日待ちを過ぎている）
- 動かすのに Node 22 以上と ESM のプロジェクトが要る、と公式ブログにある。mise の Node は 24.22.1
- v2 では使うプリセット（`@pandacss/preset-base` と `@pandacss/preset-panda`）を設定に書き、パッケージも入れる必要がある。書かないと、`display` のような書き方も、色の名前も使えない
- ビルド時に CSS を作るので、Server Components のまま使える

### インストール時スクリプト（2026-11-06 実測）

- `@pandacss/dev` と `@pandacss/compiler` にはない
- 依存の `@parcel/watcher`（2.5.6）に `install` スクリプト（`node scripts/build-from-source.js`）がある。`trustedDependencies: []` なので、`bun pm untrusted` に「止めた」と出る
- このスクリプトは、OS 向けの組み立て済みのファイルがないときに、手元でソースから組み立てるためのもの。macOS（arm64）では `@parcel/watcher-darwin-arm64` が入るので、止めたままでよい
- `@parcel/watcher` を使うのは `panda --watch`（ファイルを見張るモード）だけ。この回の作り方（PostCSS 経由）では使わない

### Panda の生成物 `styled-system/`

`panda codegen` が作る。中身は `css()` などの関数と型で、74ファイル（実測）。設定から毎回作り直せるので、コミットしない。

### 実測したこと

2026-11-06、`dev` の `f6d4b40` を一時ディレクトリに複製し、macOS / bun 1.4.4 / Node 24 / Next.js 16.4.1（Turbopack）/ Playwright の Chromium で、このチケットの手順どおりに動かした。

- `"type": "module"` を足しても、開発サーバー、`bun run build`、`bun run typecheck`、`bun run lint`、`bun run format:check` が通る。oxlint の自作ルール（`.mts`）も動く
- `"type": "module"` がなくても、上のすべてが通った。足すのは、公式が ESM を求めているから
- Turbopack の開発サーバーで、PostCSS 経由で Panda の CSS が作られる（`d_flex` などのクラスができる）
- 手順 10 のあと、2-0 の手順 3 のコードの出力が、2-0 の期待される出力と7行とも同じになる。ダークモードでは、`body` の文字が `rgb(237, 237, 237)`、背景が `rgb(10, 10, 10)` になる

**未確認**: Vercel でのビルド。Chrome の DevTools でダークモードを切り替える画面操作。

### 現時点のバージョン（2026-11-06 確認）

| パッケージ                | バージョン |
| ------------------------- | ---------- |
| `@pandacss/dev`           | 2.5.0      |
| `@pandacss/preset-base`   | 2.5.0      |
| `@pandacss/preset-panda`  | 2.5.0      |
| `@parcel/watcher`（依存） | 2.5.6      |

## 作業手順（全体の地図）

1. Panda の3パッケージを入れる
2. Tailwind の2パッケージを外す
3. `package.json` に `"type": "module"` を足す
4. `panda.config.ts` を作る
5. `postcss.config.mjs` のプラグインを Panda に替える
6. `styled-system/` を `.gitignore` に足し、`panda codegen` で作る
7. `app/globals.css` を1行にする
8. `app/layout.tsx` の Tailwind のクラスを `css()` に書き換える（**この回の本題**）
9. 開発サーバーで、2-0 の値と見比べる。色とフォントが変わっていることを確かめる
10. 今の色とフォントを `globalCss` に移し、2-0 の値に戻す
11. わざと `styled-system/` を消し、型検査で止まるのを見る。スクリプトに `panda codegen` を足す
12. lint・型検査・ビルドを通し、コミットして push する

## 確認事項

- [x] **入れ方。** 推奨案「`panda init` を使わず、3パッケージを `bun add` で入れて、設定ファイルを自分で書く」で作成。理由は `panda init --postcss` が `postcss.config.cjs` を新しく作り、今ある `postcss.config.mjs` と2つ並んでしまうから（実測）。調べる場所（`include`）も `./src/**` と `./pages/**` になっていて、このリポジトリの `app/` と合わない。ただし、自分で書くぶん手順が増える
- [x] **見た目をこの回で変えるか。** 推奨案「変えない。今の色とフォントを `globalCss` に移して、2-0 と同じ値にする」で作成。理由は「なぜこれをやるか」のとおり、入れ替えと見た目の変更を分けるため。ただし、2-0 で見つけた問題（本文が Arial のまま、Geist を使っていない）もそのまま残る。直すのは 2-2 から
- [x] **色をどこに移すか。** 推奨案「`panda.config.ts` の `globalCss` に、`#171717` などの値をそのまま書く」で作成。理由は、トークンを作るのは 2-2 の仕事だから。ただし、この回の時点では値に名前がない。2-2・2-3 でトークンの名前に置き換える
- [x] **`"type": "module"` を足すか。** 推奨案「足す」で作成。理由は、Panda v2 の公式ブログが ESM のプロジェクトを求めているから。ただし、足さなくても今は全部動いた（実測）。足すと、自作ルールを `.mts` にした理由（ADR `20261106-1800-require-canonical-lint-rule.md`）がなくなるが、拡張子はこの回では変えない
- [x] **生成物 `styled-system/` をコミットするか。** 推奨案「しない。`.gitignore` に足し、`prepare` と `typecheck` のスクリプトで毎回作る」で作成。理由は、設定から作り直せるものをコミットすると、設定と中身がずれることがあるから。ただし、クローンした直後は `bun install` するまで `styled-system/` がなく、エディタが `css()` の型を見つけられない
- [x] **CSS の作り方。** 推奨案「PostCSS 経由（`@pandacss/dev/postcss`）」で作成。理由は、Next.js の開発サーバーとビルドに乗るので、ほかのコマンドを並べて動かさずに済むから。ただし、Panda の公式は、開発サーバーを止めて起動し直したときに古いスタイルが残ることがあると書いている（`panda --watch` と並べて動かす方法もある）。この現象は実測では起きていない
- [x] **`@parcel/watcher` のインストール時スクリプトを許可するか。** 推奨案「許可しない（`trustedDependencies: []` のまま）」で作成。理由は、組み立て済みのファイルが入るので、スクリプトを動かさなくても困らないから。ただし、組み立て済みのファイルがない OS で `panda --watch` を使うと動かない可能性がある（未確認）
- [x] **【標準ルールからの逸脱】TDD を適用しない。** 本人の判断（2026-11-03）による。確かめるのはブラウザで計算された値と、型検査・ビルドが通ること

## ハンズオン

コマンドの出力とブラウザの値は、`f6d4b40` を一時ディレクトリに複製して実際に動かし、写したもの（2026-11-06、bun 1.4.4 / Next.js 16.4.1 / Playwright の Chromium）。Chrome の DevTools の画面操作は、この環境では確かめていない。

---

### 準備：この回で何をするのか

見た目を作る道具を、Tailwind CSS から Panda CSS に入れ替える。終わったときの見た目は今と同じにする。2-0 の手順 3 のコードで、入れ替える前と後の値が同じかを確かめる。

#### Tailwind と Panda の違いは「既製の札」と「自分で書く注文票」

Tailwind は `flex` や `h-full` のような既製の札（クラス名）をタグに貼っていく道具だ。札の種類は Tailwind が決めている。Panda は `css({ display: "flex" })` のように、ほしい見た目を JavaScript のオブジェクトで書く。書いた注文票を、ビルドのときに Panda が読み、CSS に変える。

注文票を TypeScript で書くので、書き間違いを型検査が止めてくれる。手順 8 で、それを実際に見る。

#### Panda が動く流れ

```
app/ の .tsx ── 読む ──▶ Panda（PostCSS のプラグイン）── 書き出す ──▶ CSS
                              ▲
                     panda.config.ts（どこを読むか、何を使うか）
```

Panda は `panda.config.ts` の `include` に書いた場所のファイルを読み、`css({ ... })` を探して、必要な CSS だけを作る。使っていない書き方の CSS は作らない。

#### 用意するもの

- 2-0 を終えた `dev`（2-0 の `docs/design/inventory/README.md` があること）
- Chrome

---

### 手順 1：Panda の3パッケージを入れる

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
git switch dev
git pull
bun add -d @pandacss/dev@2.5.0 @pandacss/preset-base@2.5.0 @pandacss/preset-panda@2.5.0
```

期待される出力（抜粋）:

```
installed @pandacss/dev@2.5.0 with binaries:
 - panda
 - pandacss
installed @pandacss/preset-base@2.5.0
installed @pandacss/preset-panda@2.5.0

Blocked 1 postinstall. Run `bun pm untrusted` for details.
```

何が止められたかを見る。

```bash
bun pm untrusted
```

期待される出力（抜粋）:

```
./node_modules/lefthook @2.2.2
 » [postinstall]: node postinstall.js

./node_modules/@parcel/watcher @2.5.6
 » [install]: node scripts/build-from-source.js
```

**なぜ** — `lefthook` は前からあるもので、`@parcel/watcher` が今回増えた。Panda の CLI がファイルを見張るときに使う部品で、止められたのは「組み立て済みのファイルがない OS のときに、ソースから組み立てる」スクリプトだ。macOS 向けの組み立て済みのファイル（`@parcel/watcher-darwin-arm64`）は入っているので、止めたままでよい。`trustedDependencies` には足さない。

`@pandacss/preset-base` と `@pandacss/preset-panda` は、Panda v2 では自分で入れる。`preset-base` が `display` や `_hover` のような書き方を、`preset-panda` が `red.500` のような色の名前を用意している。

---

### 手順 2：Tailwind の2パッケージを外す

```bash
bun remove tailwindcss @tailwindcss/postcss
```

期待される出力（抜粋）:

```
- @tailwindcss/postcss
2 packages removed
```

**なぜ** — 2つの道具を並べると、それぞれのリセット CSS（ブラウザの最初の見た目を消す CSS）がぶつかる。`globals.css` と `postcss.config.mjs` はまだ Tailwind を読み込もうとするので、この時点で開発サーバーを動かすとエラーになる想定だ（未確認）。手順 7 で `globals.css` を直すまでは、開発サーバーを起動しない。

---

### 手順 3：`package.json` に `"type": "module"` を足す

`package.json` の `"private": true,` の次の行に、1行足す。

```json
  "private": true,
  "type": "module",
```

**なぜ** — Panda v2 は ESM のプロジェクトで動かすことを求めている。

JavaScript は 1995 年にブラウザのために生まれ、最初はファイルを分けて読み込む仕組みがなかった。2009 年に Node.js が `require()`（CommonJS）という読み込み方を作り、そのあとで公式の仕様として `import`（ES Modules、略して ESM）が決まった。その結果、読み込み方が2つ並び、`.js` のファイルを見ただけではどちらで書かれているか分からなくなった。`"type": "module"` は「このプロジェクトの `.js` は ESM で読む」という宣言だ。

1-13 で自作ルールのファイルを `.mts` にしたのは、この宣言がなかったからだった。宣言を足しても、`.mts` のままで問題はない。

---

### 手順 4：`panda.config.ts` を作る

リポジトリの直下に `panda.config.ts` を作り、次の内容を貼る。

```ts
import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  presets: ["@pandacss/preset-base", "@pandacss/preset-panda"],
  preflight: true,
  include: ["./app/**/*.{ts,tsx}"],
  exclude: [],
  theme: {
    extend: {},
  },
  outdir: "styled-system",
});
```

| 項目        | 意味                                                            |
| ----------- | --------------------------------------------------------------- |
| `presets`   | 使う書き方と色の名前のセット。手順 1 で入れた2つ                |
| `preflight` | Panda のリセット CSS を使うか。Tailwind の Preflight と同じ役割 |
| `include`   | `css()` を探しに行く場所。このリポジトリでは `app/` の中だけ    |
| `theme`     | トークンを書く場所。2-2 から使う                                |
| `outdir`    | `css()` などの関数と型を書き出す場所                            |

**なぜ** — `include` に書いていない場所で `css()` を使っても、Panda はそのファイルを読まないので CSS ができない。部品を置く場所が増えたら（2-5 の `components/` など）、ここに足す。

---

### 手順 5：`postcss.config.mjs` のプラグインを Panda に替える

`postcss.config.mjs` の中身を、次の内容に置き換える。

```js
const config = {
  plugins: {
    "@pandacss/dev/postcss": {},
  },
};

export default config;
```

**なぜ** — Next.js は CSS ファイルを読むたびに PostCSS（CSS を加工する道具）を通す。ここに Panda を登録すると、`globals.css` を読むときに Panda が `app/` の中を調べ、必要な CSS を差し込む。Next.js の開発サーバーとビルドに乗るので、別のコマンドを並べて動かさなくてよい。

---

### 手順 6：`styled-system/` を `.gitignore` に足し、`panda codegen` で作る

`.gitignore` の最後に、次の2行を足す。

```
# Panda が panda.config.ts から作る。作り直せるので追跡しない
styled-system/
```

生成物を作る。

```bash
bun run panda codegen
```

期待される出力（パスは自分の環境のものになる）:

```
codegen: wrote 74 files to /Users/.../65-blog-app/styled-system
```

```bash
ls styled-system
```

期待される出力:

```
css
helpers.d.ts
helpers.js
patterns
recipes
tokens
types
```

**なぜ** — `css()` という関数は `@pandacss/dev` の中にはない。`panda codegen` が、`panda.config.ts` の中身（使うプリセット、トークン）に合わせて、このプロジェクト専用の `css()` と型を作る。トークンを足すたびに、型も変わる。だから設定から毎回作り直し、コミットはしない。

---

### 手順 7：`app/globals.css` を1行にする

`app/globals.css` の中身を、次の1行に置き換える。

```css
@layer reset, base, tokens, recipes, utilities;
```

**なぜ** — `@layer` は、CSS に「どの順で強いか」を決める棚を作る書き方だ。あとに書いた棚ほど強い。この1行で、リセット → 基本の指定（base）→ トークン → 部品の型（recipes）→ `css()` の順に強くなる。`css()` で書いたものがいつもリセットに勝つ。

元にあった `--background` や `--foreground` の指定も消えるので、色が変わる。手順 9 でそれを確かめ、手順 10 で戻す。

---

### 手順 8：この回の本題。Tailwind のクラスを `css()` に書き換える

`app/layout.tsx` には、Tailwind のクラスが2か所ある。

```tsx
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
```

| Tailwind のクラス | 意味                           | Panda で書くと                             |
| ----------------- | ------------------------------ | ------------------------------------------ |
| `h-full`          | 高さを親いっぱいにする         | `height: "full"`                           |
| `antialiased`     | 文字のふちを滑らかに描く       | `fontSmoothing: "antialiased"`             |
| `min-h-full`      | 最低でも親いっぱいの高さにする | `minHeight: "full"`                        |
| `flex flex-col`   | 中身を縦に並べる               | `display: "flex", flexDirection: "column"` |

#### 8-a：わざと Tailwind の感覚で書いて、型検査に止めてもらう

まず import を1行足す。`import Script from "next/script";` の次の行に書く。

```tsx
import { css } from "../styled-system/css";
```

次に、`<html>` と `<body>` の2行を、次の形に書き換える。CSS の正式な名前は `-webkit-font-smoothing` なので、`WebkitFontSmoothing` と書いてみる。

```tsx
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} ${css({ height: "full", WebkitFontSmoothing: "antialiased" })}`}
    >
      <body className={css({ minHeight: "full", display: "flex", flexDirection: "column" })}>
```

型検査を動かす。

```bash
bun run typecheck
```

期待される出力（抜粋。行と列の数字は書き方で変わる）:

```
app/layout.tsx(41,87): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Object literal may only specify known properties, but 'WebkitFontSmoothing' does not exist in type 'SystemStyleObject'. Did you mean to write 'fontSmoothing'?
```

**動かす前に、書き間違いが見つかった。** Tailwind のクラスはただの文字列なので、`antialiasd` と打ち間違えても、何も言われずに効かないだけだ。Panda は書ける名前を型で知っているので、知らない名前をその場で止める。しかも「`fontSmoothing` のことでは？」と正しい名前まで教えてくれる。`fontSmoothing` は、Safari 向けの `-webkit-font-smoothing` と Firefox 向けの `-moz-osx-font-smoothing` をまとめて書く、Panda の書き方だ。

#### 8-b：正しい名前に直す

`WebkitFontSmoothing` を `fontSmoothing` に直す。

```tsx
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} ${css({ height: "full", fontSmoothing: "antialiased" })}`}
    >
      <body className={css({ minHeight: "full", display: "flex", flexDirection: "column" })}>
```

```bash
bun run typecheck
```

期待される出力（最後の行。エラーが出なければよい）:

```
✓ Types generated successfully
```

**この書き換えで分かること** — 見た目の指定が、文字列の札から、型のあるオブジェクトになった。2-2 でトークンを作ると、`color: "text.body"` のように自分で付けた名前も、同じように型で守られる。名前を打ち間違えれば型検査が止める。デザインシステムの「決まった値しか使えない」という規格を、道具の側で守れるようになる。

---

### 手順 9：開発サーバーで、2-0 の値と見比べる

```bash
bun dev
```

期待される出力（抜粋）:

```
▲ Next.js 16.4.1 (Turbopack)
- Local:         http://localhost:3000
```

http://localhost:3000/posts/blog を開き、2-0 の手順 3 のコード（`console.table(["html", "body", "h1", "h2", "p", "a", "pre"].map(pick))` まで）を Console に貼る。

2-0 の表と比べると、次の3点が変わっている（ライトモード）。

- `pre` 以外の6行の `fontFamily` が`ui-sans-serif, system-ui, -apple-system, …` になった（2-0 では `html` が Geist、ほかが Arial）
- `body`・`h1`・`h2`・`p`・`a` の `color` が `rgb(0, 0, 0)` になった（2-0 では `rgb(23, 23, 23)`）
- `pre` の `fontFamily` が `ui-monospace, SFMono-Regular, Menlo, …` になった（2-0 では Geist Mono）

`body` の背景の白（`#ffffff`）の指定もなくなっている。OS をダークモードにしても、文字は黒のままになる。

**なぜ** — 手順 7 で消した `globals.css` に、文字と背景の色、本文のフォント、ダークモードの指定が入っていたからだ。コードブロックのフォントが変わったのは、Tailwind のリセットが `Geist Mono` を指定していたのを、Panda のリセットが別のフォントで置き換えたためだ。道具を替えると、道具が黙ってやっていたことも一緒に消える。2-0 の表があるので、何が消えたかを数字で指させる。

`Ctrl + C` で開発サーバーを止めずに、次の手順に進む。

---

### 手順 10：今の色とフォントを `globalCss` に移し、2-0 の値に戻す

`panda.config.ts` の中身を、次の内容に置き換える。足したのは `globalCss` の部分だ。

```ts
import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  presets: ["@pandacss/preset-base", "@pandacss/preset-panda"],
  preflight: true,
  include: ["./app/**/*.{ts,tsx}"],
  exclude: [],
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
  theme: {
    extend: {},
  },
  outdir: "styled-system",
});
```

| 書いたもの                                   | 元はどこにあったか                                     |
| -------------------------------------------- | ------------------------------------------------------ |
| `colorScheme: "light dark"`                  | `globals.css` の `color-scheme: light dark;`           |
| `--global-font-body` と `--global-font-mono` | Tailwind の `@theme` の `--font-sans` と `--font-mono` |
| `body` の `background` と `color`            | `globals.css` の `--background` と `--foreground`      |
| `body` の `fontFamily`                       | `globals.css` の `font-family: Arial, ...`             |

`{ base: "#171717", _osDark: "#ededed" }` は、「ふだんは `#171717`、OS がダークモードのときは `#ededed`」という書き方だ。`_osDark` が、元の `@media (prefers-color-scheme: dark)` にあたる。`--global-font-body` と `--global-font-mono` は、Panda のリセットが「本文とコードのフォントはこれ」と読みに行く変数で、ここに `next/font` が作った Geist の変数を渡す。

保存したら、ブラウザを再読み込みして、もう一度 2-0 の手順 3 のコードを貼る。

期待される出力: 2-0 の手順 3 の期待される出力と、7行とも同じ。

ダークモードも確かめる。DevTools の `Cmd + Shift + P` で `dark` と打ち、「Emulate CSS prefers-color-scheme: dark」を選ぶ（日本語表示では名前が違う可能性がある。未確認）。次のコードを貼る。

```js
console.table([
  {
    color: getComputedStyle(document.body).color,
    background: getComputedStyle(document.body).backgroundColor,
  },
]);
```

期待される出力:

| color              | background      |
| ------------------ | --------------- |
| rgb(237, 237, 237) | rgb(10, 10, 10) |

**なぜ** — 値の置き場所が `globals.css` から `panda.config.ts` に移っただけで、値そのものは変えていない。これで「道具だけ入れ替えた」状態になった。`#171717` のような名前のない値が設定の中にじかに書いてあるのは、2-0 で見つけた「値が散らばっている」状態のままだ。2-2 と 2-3 で、ここにトークンの名前を付けていく。

確かめたら、`Ctrl + C` で開発サーバーを止める。

---

### 手順 11：わざと `styled-system/` を消し、型検査で止まるのを見る

`styled-system/` はコミットしないので、クローンした直後や Vercel のビルドでは、まだない。その状態を作る。

```bash
D=~/.claude/delete/$(date +%Y%m%d-%H%M)
mkdir -p "$D"
mv styled-system "$D/"
bun run typecheck
```

期待される出力（抜粋）:

```
app/layout.tsx(7,21): error TS2307: Cannot find module '../styled-system/css' or its corresponding type declarations.
```

型検査より先に `panda codegen` が動くように、`package.json` の `scripts` の2行を書き換える。

```json
    "prepare": "panda codegen && lefthook install",
```

```json
    "typecheck": "panda codegen && next typegen && tsrs --noEmit",
```

```bash
bun run typecheck
```

期待される出力（抜粋）:

```
$ panda codegen && next typegen && tsrs --noEmit
codegen: wrote 74 files to /Users/.../65-blog-app/styled-system
✓ Types generated successfully
```

**なぜ** — `bun run build` は最初に `bun run typecheck` を動かすので、`typecheck` に入れておけば、Vercel のビルドでも生成物が先にできる。lefthook のコミット前の型検査も同じスクリプトを使う。`prepare` は `bun install` のあとに動くので、クローンした直後にエディタが `css()` の型を見つけられるようになる。

---

### 手順 12：lint・型検査・ビルドを通し、コミットして push する

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

期待される出力:

```
 M .gitignore
 M app/globals.css
 M app/layout.tsx
 M bun.lock
 M package.json
 M postcss.config.mjs
?? panda.config.ts
```

`styled-system/` が出ていないことを確かめる。出ていたら、手順 6 の `.gitignore` を見直す。`AGENTS.md` が出ることもある。`next dev` が書き直したもので、`AGENTS.md` の冒頭にあるとおり、コミットに含めてよい。

```bash
git add .gitignore app/globals.css app/layout.tsx bun.lock package.json postcss.config.mjs panda.config.ts
git commit -m "feat: Tailwind CSS を Panda CSS v2 に入れ替え、2-2 からトークンを型で守れるようにする"
git push
```

push したら、Vercel のビルドが通り、本番の見た目が変わっていないことを確かめる。

---

### うまくいかないとき

| 症状                                                               | 原因と対処                                                                                                                                                                  |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Cannot find module '../styled-system/css'`                        | `styled-system/` がない。`bun run panda codegen` を実行する。手順 11 のあとなら `bun run typecheck` でも作られる                                                            |
| `'WebkitFontSmoothing' does not exist in type 'SystemStyleObject'` | 手順 8-a のとおり。`fontSmoothing` に直す                                                                                                                                   |
| `css()` を書いたのに見た目が変わらない                             | そのファイルが `panda.config.ts` の `include` の外にある。`app/` の外に置いたなら、`include` に足す                                                                         |
| 開発サーバーを起動し直したら、古いスタイルのまま                   | Panda の公式が挙げている現象（実測では起きていない）。CSS のファイル（`app/globals.css`）を一度保存し直す。直らなければ `.next` を `~/.claude/delete/` に移してから起動する |
| `display` などの書き方が型エラーになる                             | `panda.config.ts` の `presets` が抜けている。手順 4 の内容と見比べる                                                                                                        |
| `bun run build` が Tailwind のエラーで止まる                       | `postcss.config.mjs` に `@tailwindcss/postcss` が残っている。手順 5 の内容に置き換える                                                                                      |

ここに載っていないエラーが出たら、そのまま貼って聞いてほしい。

---

## 受け入れ条件

- [x] `package.json` に `tailwindcss` と `@tailwindcss/postcss` がなく、`@pandacss/dev`・`@pandacss/preset-base`・`@pandacss/preset-panda` が `2.5.0` で入っている
- [x] `package.json` に `"type": "module"` があり、`prepare` と `typecheck` が `panda codegen` で始まる
- [x] `app/globals.css` が `@layer reset, base, tokens, recipes, utilities;` の1行だけになっている
- [x] `app/layout.tsx` に Tailwind のクラス（`h-full`・`antialiased`・`min-h-full`・`flex`・`flex-col`）が残っていない
- [x] `git ls-files styled-system` が何も出さない
- [x] `bun run lint` と `bun run build` が通る
- [ ] `/posts/blog` で 2-0 の手順 3 のコードを動かすと、2-0 の期待される出力と7行とも同じ値が出る（2026-11-07、未チェックのまま本人の了承でコミット）
- [ ] ダークモードにすると、`body` の文字が `rgb(237, 237, 237)`、背景が `rgb(10, 10, 10)` になる（2026-11-07、未チェックのまま本人の了承でコミット）
- [ ] `dev` にコミットして push し、Vercel のビルドが通っている（2026-11-07、コミット済み。push と Vercel の確認はこれから）

## この回で理解したこと

着手後に埋める。受け入れ条件とは別に、何が分かったかを残す。

- [ ] Tailwind のクラスと Panda の `css()` の違いを、手順 8-a のエラーを例に説明できる
- [ ] `styled-system/` を誰が何から作り、なぜコミットしないのかを説明できる
- [ ] `@layer` の1行が何を決めているかを説明できる
- [ ] 手順 9 で色とフォントが変わった理由を、消したファイルの中身と結びつけて説明できる
- [ ] この回で見た目を変えなかった理由を説明できる

## 参考

- Panda CSS 2.0: https://panda-css.com/blog/panda-css-v2
- Panda CSS の Next.js での始め方: https://panda-css.com/docs/installation/nextjs
- Panda CSS の条件（`_osDark` など）: https://panda-css.com/docs/concepts/conditional-styles
- ADR `20261106-2104-design-system-panda-v2-react-aria.md`
- 2-0 のチケット `tickets/2-0-interface-inventory.md`
