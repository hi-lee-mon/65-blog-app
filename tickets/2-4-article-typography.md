# 2-4: 記事ページの幅・見出し・段落・リンクを整え、読める文字組みにする

- 起票日: 2026-11-07
- 学習計画: 設計の全体像は `docs/design/20260925-blog-design-proposal.md` の「デザインシステムの作り方」。技術と順番は ADR `20261106-2104-design-system-panda-v2-react-aria.md`
- ステータス: 完了

## 全体のどこか

「見た目を作る」段の5回目で、全8回の5回目にあたる。2-2 で値の一覧（基本トークン）を、2-3 で用途の名前（意味トークン）を作った。この回はそれを初めて実際のページに使う「最初の実戦」になる。対象は記事ページ（`/posts/[slug]`）の本文だ。

| Step | 内容                                                                | 進捗       |
| ---- | ------------------------------------------------------------------- | ---------- |
| 2-0  | デザインシステムとは何かを知り、今のサイトを棚卸しする              | ■□□ 進行中 |
| 2-1  | Panda CSS v2 を入れ、Tailwind CSS を外す                            | ■■■ 完了   |
| 2-2  | 基本トークン（色・文字の大きさ・余白）を作る                        | ■■■ 完了   |
| 2-3  | 意味トークンとダークモードを作る                                    | ■■■ 完了   |
| 2-4  | 記事ページの文字組みを整える（最初の実戦）                          | □□□ ← つぎ |
| 2-5  | 状態を持たない部品（タグ・カード）を作り、`/design-system` に並べる | □□□        |
| 2-6  | React Aria で状態を持つ部品（テーマ切り替え・メニュー）を作る       | □□□        |
| 2-7  | React Aria のフックに置き換え、さらに自作に置き換える               | □□□        |

作業ブランチは作らず、`dev` に直接コミットする。

## 作るもの

| 場所                                                     | 中身                                                                                   |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `theme/tokens.ts`                                        | 字間（`letterSpacings`）の3段と、記事の幅 `sizes.640` を足す                           |
| `theme/text-styles.ts`（新規）                           | 文字の型。`heading.1`（記事の題名）、`heading.2`（`##` の見出し）、`body`（本文）の3つ |
| `theme/semantic.ts`                                      | リンクの色 `fg.link` を足す                                                            |
| `panda.config.ts`                                        | 文字の型を読み込む                                                                     |
| `app/posts/[slug]/prose.ts`（新規）                      | 記事の本文の中（見出し・段落・リンク・コード）の見た目                                 |
| `app/posts/[slug]/page.tsx`                              | 記事の幅を決め、題名と日付に文字の型と色を当て、本文を `prose` で包む                  |
| `docs/adr/<yyyymmdd-hhmm>-article-typography.md`（新規） | この回で決めたこと（幅、文字の型、本文の整え方、リンクの色）                           |

今回は扱わないもの: 目次とタグの見た目（2-5 で部品にする）、`###` の見出し・リスト・引用・表（まだ記事に出てこない）、リンクにカーソルを載せたときの見た目（2-6）、コードブロックの角丸と背景（2-5）。

## なぜこれをやるか

2-0 の棚卸しで、記事ページは題名も見出しも本文もすべて 16px・太さ 400 で、段落の間もあいていないと分かった。今もそのままだ。広い画面では1行が画面の端から端まで伸び、どこが見出しかも分からない。

この回では記事を「読める」状態にする。ただし、その場で `fontSize: "24px"` のように値を決めるのではなく、2-2 と 2-3 で作った一覧から選ぶ。一覧にない値が要ると分かったら、まず一覧に足し、そこから使う。設計の ADR で決めた「デザインシステムを単体で作りためず、実際のページで使いながら育てる」のは、この流れのことだ。

## 周辺知識

### Panda の文字の型（出典: https://panda-css.com/docs/theming/text-styles 、2026-11-07 確認）

- 文字の大きさ・太さ・行の高さ・字間のように、いつも一緒に使う値をひとまとめにして名前を付けたものを **textStyle**（文字の型）と呼ぶ
- `theme.textStyles` に書き、`css({ textStyle: "heading.2" })` のように使う
- 中に入れる値にはトークンの名前を書ける（`fontSize: "24"`）
- `css()` の中の `textStyle` の名前は `strictTokens` で検査される。`theme/text-styles.ts` の中の値は検査されない（手順 7）

### Panda の子孫セレクタ（出典: https://panda-css.com/docs/concepts/writing-styles 、2026-11-07 確認）

- `css({ "& h2": { ... } })` と書くと、「このクラスが付いた要素の中の `h2`」に当たる CSS になる
- `&` は「このクラスが付いた要素」を指す。`docs/learn/reading-css.md` の2章のセレクタの書き方がそのまま使える
- `&` の中に書いた値も、`strictTokens` で検査される

### デジタル庁デザインシステムの文字組み（出典: デジタル庁デザインシステム「タイポグラフィ」、https://design.digital.go.jp/dads/foundations/typography/ 、2026-11-07 確認）

| 名前         | 大きさ | 太さ | 行の高さ | 字間 |
| ------------ | ------ | ---- | -------- | ---- |
| Std-32B-150  | 32px   | 700  | 150%     | 1%   |
| Std-24B-150  | 24px   | 700  | 150%     | 2%   |
| Std-20B-150  | 20px   | 700  | 150%     | 2%   |
| Std-16N-170  | 16px   | 400  | 170%     | 2%   |
| Mono-16N-150 | 16px   | 400  | 150%     | 0    |

- 本文と UI は 16px 以上が基準。読むための本文の行の高さは文字の大きさの 1.5 倍以上を勧めている
- リンクは下線を付けるのが基本。色だけでリンクだと伝えないため
- 1行の文字数と、段落の間隔には決まりがない

### リンクの色の候補とコントラスト比（WCAG の式で計算した値）

| 色          | 白い背景の上 | 黒い背景の上 | 本文の文字との差（明るいとき / 暗いとき） |
| ----------- | ------------ | ------------ | ----------------------------------------- |
| `blue.300`  | 1.99         | 10.57        | 8.76 / 1.77                               |
| `blue.500`  | 3.93         | 5.34         | 4.42 / 3.51                               |
| `blue.800`  | 8.64         | 2.43         | 2.01 / 7.72                               |
| `blue.1000` | 14.22        | 1.48         | 1.22 / 12.70                              |

「本文の文字との差」は`gray.900`（明るいときの本文）と `gray.50`（暗いときの本文）に対するコントラスト比。

### 実測したこと

2026-11-07、`dev` の `f3a78fc` を一時ディレクトリに複製し、macOS / bun 1.4.4 / Next.js 16.4.1 / Playwright の Chromium で、このチケットの手順どおりに動かした。

- 手を入れる前の `/posts/blog` は、`article` が画面の幅いっぱい、題名・見出し・本文がすべて 16px・太さ 400・行の高さ 27.2px、上下の余白は 0
- 手順のあと、幅 1280px の画面で `article` は 640px になり、真ん中に置かれる（左端から 320px）。題名は 32px・700・48px、`##` の見出しは 24px・700・36px で上 48px・下 16px、段落は下 16px
- 本文の字間は 0.32px（16px の 2%）。コードの中は 0
- リンクは明るいとき `rgb(0, 49, 216)`、暗いとき `rgb(157, 183, 249)` で下線が付く
- 幅 375px の画面では、`width: "full"` がないと `article` が 640px のままで、ページが横にはみ出す。足すと 375px に収まり、長いコードはコードブロックの中だけで横にスクロールする
- `&` を付けずに `h2: { ... }` と書くと、型検査が止まる
- `theme/text-styles.ts` の中に `fontSize: "23px"` と生の値を書いても、型検査も codegen も止まらない
- 最後の状態で、色のトークンは 29、サイズは 2、字間は 3。`bun run typecheck`、`bun run lint`、`bun run build` が通る

**検証の方法について**: Claude は `theme/tokens.ts` を読めない（`~/.claude/settings.json` の `Read(**/*token*)`）。そのため一時ディレクトリでは、手順 2 と 3 で `theme/tokens.ts` に足す値を、`panda.config.ts` の `theme.tokens` の側で同じ値を足して確かめた。できる CSS 変数と型は同じになる。

**未確認**: Vercel でのビルド。Chrome の DevTools の画面操作（スマートフォンの幅に切り替える操作を含む）。Windows での日本語の見え方。

**既知のエラー**: 記事ページでは、手を入れる前から Console に `Route "/posts/[slug]": Next.js encountered URL data during prerendering or a navigation.` が出ている。この回の変更とは関係ない。

### 現時点のバージョン（2026-11-07 確認）

| パッケージ              | バージョン | この回での扱い |
| ----------------------- | ---------- | -------------- |
| `@pandacss/dev`         | 2.5.0      | そのまま       |
| `@pandacss/preset-base` | 2.5.0      | そのまま       |

## 作業手順（全体の地図）

1. 今の記事ページの値を測る
2. 記事の幅を決め、真ん中に置く
3. 文字の型（textStyle）を作り、題名に当てる
4. 本文の中を `&` で整える（**この回の本題**）
5. リンクに色と下線を付ける
6. スマートフォンの幅で見て、はみ出しを直す
7. わざと書き間違え、止まる場所と止まらない場所を確かめる
8. この回で決めたことを ADR に書く
9. lint・型検査・ビルドを通し、コミットして push する

## 確認事項

- [ ] **記事の幅。** 推奨案「最大 640px（`40rem`）。左右に 16px の余白」で作成。理由は本文 16px で1行が 38 字前後になり、目で行の端から次の行の頭へ戻りやすいから。デジタル庁には1行の文字数の決まりがないので、自分で決めた。ただし、広い画面では左右に大きな空きができる。コードブロックも 608px に収まり、長い行は横にスクロールする
- [ ] **文字の型の段。** 推奨案「題名は Std-32B-150、`##` の見出しは Std-24B-150、本文は Std-16N-170（デジタル庁の値）」で作成。理由は2-2 で決めた文字の大きさと行の高さの段だけで組めて、デジタル庁が確かめた組み合わせをそのまま使えるから。ただし、`###` の見出し用の型（Std-20B-150）はまだ作らない。記事に `###` が出てきたら足す
- [ ] **文字の型の名前。** 推奨案「`heading.1`・`heading.2`・`body`」で作成。理由は見出しの階層の数と名前がそろい、`h2` の要素に `heading.2` を当てると読めば分かるから。ただし、ページの題名以外で大きな文字を使いたくなったとき（トップページの見出しなど）に、`heading.1` という名前が合わないことがある
- [ ] **字間。** 推奨案「デジタル庁どおり。題名は 1%、見出しと本文は 2%、コードは 0」で作成。理由は2-2 と同じく手本の値に寄せるため。ただし、字間のトークン（`letterSpacings`）を新しく3つ作ることになる。日本語は 2% あくと、少しゆったり見える
- [ ] **本文の中の整え方。** 推奨案「本文を `<div className={prose}>` で包み、`& h2` のような子孫セレクタで中の要素を整える」で作成。理由は本文の `h2` や `p` は MDX が作るので、1つ1つに `className` を書けないから。ただし、包んだ中のすべての `a` や `p` に当たるので、2-5 で本文の中に部品を置くと、部品の見た目と重なることがある。そのときは、MDX の `components`（要素を自分の部品に差し替える仕組み）に移るかを考える
- [ ] **何を整えるか。** 推奨案「今の記事に出てくる `##` の見出し・段落・リンク・コードブロック・インラインコードだけ」で作成。理由は使う場所のない見た目は、正しく効くかを確かめられないから。ただし、初めて `###` やリストを書いた記事では、そこだけ整っていない状態になる
- [ ] **段落と見出しの間隔。** 推奨案「段落の下は 16px、`##` の見出しの上は 48px・下は 16px」で作成。理由は見出しが次の段落とひとまとまりに見えるよう、上を大きく下を小さくするため。値は 2-2 の余白の段から選んだ。ただし、デジタル庁には段落の間隔の決まりがなく、自分で決めた値になる
- [ ] **リンクの色。** 推奨案「明るいときは `blue.800`（白の上で 8.64:1）、暗いときは `blue.300`（黒の上で 10.57:1）。どちらも下線を付ける」で作成。理由は背景とのコントラスト比が 4.5:1 を大きく超え、青だと分かる段だから。ただし、本文の文字との差は明るいとき 2.01、暗いとき 1.77 しかなく、色だけではリンクと分からない。下線は外せない。訪問済みのリンクの色は作らない。デジタル庁のリンクの色の決まりは、ページが見つからず確かめられなかった
- [ ] **題名・日付の外の部分（タグ・目次）。** 推奨案「この回では触らない」で作成。理由はタグは 2-5 で部品にし、目次はリンクの集まりなので、部品の回で一緒に考えたいから。ただし、記事の上のほうは、題名と日付だけ整って、タグと目次は今のままになる
- [ ] **ファイルの置き場所と名前。** 推奨案「文字の型は `theme/text-styles.ts`、本文の見た目は `app/posts/[slug]/prose.ts`」で作成。理由は文字の型はサイト全体で使うので `theme/` に、本文の見た目は記事ページだけで使うので記事ページの隣に置くため。`prose.ts` は `app/` の中にあるので、`panda.config.ts` の `include` で読まれる。名前に `token` を入れていないのは、完了の確認で Claude が中身を読めるようにするため
- [ ] **ADR を書くか。** 推奨案「書く（手順 8）」で作成。理由は記事の幅や本文の整え方は、2-5 で部品を作るときの前提になるから。ただし、手順が1つ増える
- [ ] **【標準ルールからの逸脱】TDD を適用しない。** 本人の判断（2026-11-03）による。確かめるのは型検査の結果と、ブラウザで計算された値

## ハンズオン

コマンドの出力とブラウザの値は、`f3a78fc` を一時ディレクトリに複製して実際に動かし、写したもの（2026-11-07、bun 1.4.4 / Next.js 16.4.1 / Playwright の Chromium）。画面の幅は特に書いていなければ 1280px で測った。

---

### 準備：この回で何をするのか

記事ページの本文を、読める文字組みにする。決めるのは4つで、1行の長さ（記事の幅）、見出しと本文の大きさの差、段落と見出しの間隔、リンクの見た目だ。

#### 文字組みは「教科書の版面」

教科書を開くと、どのページも同じ幅に文字が並び、章の見出しは大きく太く、段落の間は少しあいている。見出しの前は広くあき、見出しのすぐあとの本文は詰まっている。だから、ページをめくっても迷わずに読める。

この回は記事ページにこの「版面」を作る回だ。2-2 で作った絵の具セット（基本トークン）と、2-3 の塗り分けの約束（意味トークン）に加えて、この回では文字の型を作る。「見出しはこの大きさ・この太さ・この行の高さ」というハンコのようなもので、押せば4つの値がまとめて決まる。

#### 用意するもの

- 2-3 を終えた `dev`
- Chrome
- `docs/learn/reading-css.md`。手順 4 の子孫セレクタと、手順 6 で読み返す

---

### 手順 1：今の記事ページの値を測る

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
git switch dev
git pull
bun dev
```

http://localhost:3000/posts/blog を開き、DevTools の Console に次のコードを貼る。手順 2〜6 でも同じコードを使うので、どこかに控えておく。

```js
console.table(
  ["article", "article > h1", "article h2", "article p", "article pre"].map((selector) => {
    const e = document.querySelector(selector);
    const s = getComputedStyle(e);
    return {
      selector,
      width: Math.round(e.getBoundingClientRect().width),
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
      lineHeight: s.lineHeight,
      letterSpacing: s.letterSpacing,
      marginTop: s.marginTop,
      marginBottom: s.marginBottom,
    };
  }),
);
```

期待される出力（`width` は自分の画面の幅になる。下は 1280px のとき）:

| selector     | width | fontSize | fontWeight | lineHeight | letterSpacing | marginTop | marginBottom |
| ------------ | ----- | -------- | ---------- | ---------- | ------------- | --------- | ------------ |
| article      | 1280  | 16px     | 400        | 27.2px     | normal        | 0px       | 0px          |
| article > h1 | 1280  | 16px     | 400        | 27.2px     | normal        | 0px       | 0px          |
| article h2   | 1280  | 16px     | 400        | 27.2px     | normal        | 0px       | 0px          |
| article p    | 1280  | 16px     | 400        | 27.2px     | normal        | 0px       | 0px          |
| article pre  | 1280  | 16px     | 400        | 27.2px     | normal        | 0px       | 0px          |

**なぜ** — 題名（`h1`）も見出し（`h2`）も本文（`p`）も、すべて同じ大きさ・同じ太さで、間もあいていない。`docs/learn/reading-css.md` の 7-1 で見たとおり、Panda のリセット（preflight）が、ブラウザが見出しに付けていた大きさと余白を消しているからだ。リセットで更地にしたぶん、この回で自分の値を置いていく。

---

### 手順 2：記事の幅を決め、真ん中に置く

`theme/tokens.ts` の `sizes` に `640` を足す。

```ts
  sizes: {
    full: { value: "100%" },
    640: { value: "40rem" },
  },
```

`app/posts/[slug]/page.tsx` の import に `css` を足す。

```ts
import { siteOpenGraph } from "../../../lib/siteMetadata";
import { css } from "../../../styled-system/css";
```

`<article>` に `className` を足す。

変える前:

```tsx
    <article>
```

変えたあと:

```tsx
    <article
      className={css({
        maxWidth: "640",
        marginX: "auto",
        paddingX: "16",
        paddingY: "48",
      })}
    >
```

```bash
bun run panda codegen
```

ブラウザを再読み込みし、手順 1 のコードを貼る。

期待される出力（`article` の行）:

| selector | width | fontSize | fontWeight | lineHeight | letterSpacing | marginTop | marginBottom |
| -------- | ----- | -------- | ---------- | ---------- | ------------- | --------- | ------------ |
| article  | 640   | 16px     | 400        | 27.2px     | normal        | 0px       | 0px          |

**なぜ** — `maxWidth: "640"` は「640px より広くしない」、`marginX: "auto"` は「左右の余りを同じだけあける」という意味で、合わせると記事が真ん中に置かれる。`paddingX: "16"` は、画面が狭いときに文字が画面の端にくっつかないための内側の余白だ。

640px は 40rem で、16px の文字なら左右の余白を除いて1行 38 字ほどになる。1行が長すぎると、行の終わりから次の行の頭へ目を戻すときに、行を読み違えやすい。

`h1` や `p` の `width` は 608 になっている。640 から左右の `paddingX`（16 × 2）を引いた幅だ。

---

### 手順 3：文字の型（textStyle）を作り、題名に当てる

#### 3-a：字間のトークンを足す

デジタル庁の文字組みには、字間（文字と文字の間）の値がある。2-2 では字間のトークンを作っていなかったので、`theme/tokens.ts` に `letterSpacings` を足す。名前は 2-2 の行の高さと同じく % の数にする。

```ts
  letterSpacings: {
    0: { value: "0" },
    1: { value: "0.01em" },
    2: { value: "0.02em" },
  },
```

`em` は「その要素の文字の大きさ」を1とする単位だ。`0.02em` は 16px の文字なら 0.32px、24px の文字なら 0.48px になる。文字が大きくなれば字間も一緒に広がる。

#### 3-b：文字の型を作る

`theme/text-styles.ts` を作り、次の内容を貼る。

```ts
import { defineTextStyles } from "@pandacss/dev";

export const textStyles = defineTextStyles({
  heading: {
    1: {
      value: { fontSize: "32", fontWeight: "bold", lineHeight: "150", letterSpacing: "1" },
    },
    2: {
      value: { fontSize: "24", fontWeight: "bold", lineHeight: "150", letterSpacing: "2" },
    },
  },
  body: {
    value: { fontSize: "16", fontWeight: "normal", lineHeight: "170", letterSpacing: "2" },
  },
});
```

周辺知識の表の Std-32B-150・Std-24B-150・Std-16N-170 を、2-2 で作ったトークンの名前で書き写したものだ。

`panda.config.ts` を2か所書き換える。import を足す。

```ts
import { semanticTokens } from "./theme/semantic";
import { textStyles } from "./theme/text-styles";
```

`theme` に `textStyles` を足す。

```ts
  theme: {
    // カスタムテーマ
    tokens,
    semanticTokens,
    textStyles,
  },
```

#### 3-c：題名と日付に当てる

`app/posts/[slug]/page.tsx` の題名と日付を書き換える。

変える前:

```tsx
      <h1>{frontmatter.title}</h1>
      <time>{frontmatter.date}</time>
```

変えたあと:

```tsx
      <h1 className={css({ textStyle: "heading.1" })}>{frontmatter.title}</h1>
      <time className={css({ color: "fg.muted" })}>{frontmatter.date}</time>
```

```bash
bun run panda codegen
```

ブラウザを再読み込みし、手順 1 のコードを貼る。

期待される出力（`article > h1` の行）:

| selector     | width | fontSize | fontWeight | lineHeight | letterSpacing | marginTop | marginBottom |
| ------------ | ----- | -------- | ---------- | ---------- | ------------- | --------- | ------------ |
| article > h1 | 608   | 32px     | 700        | 48px       | 0.32px        | 0px       | 0px          |

**なぜ** — `textStyle: "heading.1"` の1つで、大きさ・太さ・行の高さ・字間の4つが決まった。題名を書く場所が増えても、このハンコを押せば同じ見た目になる。見出しを少し小さくしたくなったら、`theme/text-styles.ts` の1か所を直せば、押した場所が全部変わる。

日付には 2-3 で作った `fg.muted` をそのまま使った。2-3 の記事一覧の日付と同じ色になる。

---

### 手順 4：この回の本題。本文の中を `&` で整える

本文（`<Content />`）の中の `h2` や `p` は、MDX が原稿から作る。`page.tsx` には `<h2>` と書いていないので、手順 3 のように `className` を付けられない。

そこで、本文を1つの `<div>` で包み、「この `<div>` の中の `h2`」という形で見た目を書く。

`app/posts/[slug]/prose.ts` を作り、次の内容を貼る。

```ts
import { css } from "../../../styled-system/css";

export const prose = css({
  textStyle: "body",
  "& h2": { textStyle: "heading.2", marginTop: "48", marginBottom: "16" },
  "& p": { marginBottom: "16" },
  "& pre": { padding: "16", overflowX: "auto", marginBottom: "16" },
  "& code": { letterSpacing: "0" },
});
```

`app/posts/[slug]/page.tsx` の import に `prose` を足す。

```ts
import { css } from "../../../styled-system/css";
import { prose } from "./prose";
```

`<Content />` を包む。

変える前:

```tsx
<Content />
```

変えたあと:

```tsx
<div className={prose}>
  <Content />
</div>
```

```bash
bun run panda codegen
```

ブラウザを再読み込みし、手順 1 のコードを貼る。

期待される出力:

| selector     | width | fontSize | fontWeight | lineHeight | letterSpacing | marginTop | marginBottom |
| ------------ | ----- | -------- | ---------- | ---------- | ------------- | --------- | ------------ |
| article      | 640   | 16px     | 400        | 27.2px     | normal        | 0px       | 0px          |
| article > h1 | 608   | 32px     | 700        | 48px       | 0.32px        | 0px       | 0px          |
| article h2   | 608   | 24px     | 700        | 36px       | 0.48px        | 48px      | 16px         |
| article p    | 608   | 16px     | 400        | 27.2px     | 0.32px        | 0px       | 16px         |
| article pre  | 608   | 16px     | 400        | 27.2px     | 0.32px        | 0px       | 16px         |

ページを目で見ても、見出しが大きく太くなり、段落の間があいたはずだ。

**`&` は「このクラスが付いた要素」を指す。** `"& h2"` は、`prose` のクラスが付いた `<div>` の中の `h2` という意味の CSS になる。`docs/learn/reading-css.md` の2章で見たセレクタを、`css()` の中で書けるようにしたものだ。値の側（`"48"`、`"heading.2"`）は、これまでと同じく `strictTokens` で検査される。

見出しの上を 48px、下を 16px にしたのは、見出しが前の段落から離れ、次の段落とひとまとまりに見えるようにするためだ。教科書の章の見出しと同じ形になる。

`"& code"` の字間を 0 にしたのは、`prose` の `textStyle: "body"` が字間 2% を決め、それが中のコードにも受け継がれるからだ（`reading-css.md` の3章）。デジタル庁はコード用の文字（Mono）の字間を 0 にしている。`pre` の行の `letterSpacing` は 0.32px のままだが、`pre` の中の `code` で 0 に戻っている。

---

### 手順 5：リンクに色と下線を付ける

`theme/semantic.ts` の `fg` に `link` を足す。

```ts
      link: {
        value: { base: "{colors.blue.800}", _dark: "{colors.blue.300}" },
      },
```

`app/posts/[slug]/prose.ts` に `"& a"` の行を足す。

```ts
  "& p": { marginBottom: "16" },
  "& a": { color: "fg.link", textDecoration: "underline" },
  "& pre": { padding: "16", overflowX: "auto", marginBottom: "16" },
```

```bash
bun run panda codegen
```

本文にリンクがある記事 http://localhost:3000/posts/umami を開き、Console に貼る。

```js
const a = document.querySelector("article div a");
console.table([
  {
    text: a.textContent,
    color: getComputedStyle(a).color,
    textDecoration: getComputedStyle(a).textDecorationLine,
  },
]);
```

期待される出力（明るいとき）:

| text  | color           | textDecoration |
| ----- | --------------- | -------------- |
| umami | rgb(0, 49, 216) | underline      |

DevTools の `Cmd + Shift + P` で「Emulate CSS prefers-color-scheme: dark」を選び、もう一度貼る。

期待される出力（暗いとき）:

| text  | color              | textDecoration |
| ----- | ------------------ | -------------- |
| umami | rgb(157, 183, 249) | underline      |

確かめたら「Emulate CSS prefers-color-scheme: light」に戻す。

**なぜ** — Panda のリセットはリンクの青と下線も消していた（`reading-css.md` の 7-1）。リンクだと分からなければ押せないので、ここで戻す。

周辺知識の表を見ると、`blue.800` は白の上で 8.64:1 あるが、本文の `gray.900` との差は 2.01 しかない。色だけでは「ここがリンクだ」と分かりにくい。下線を付けるのは、デジタル庁が言うとおり、色だけで伝えないためだ。

---

### 手順 6：スマートフォンの幅で見て、はみ出しを直す

DevTools の `Cmd + Shift + M` で端末の幅に切り替える画面を開き、幅を 375 にする（この操作は、この環境では確かめていない）。http://localhost:3000/posts/blog を再読み込みし、Console に貼る。

```js
console.table([
  {
    screen: innerWidth,
    page: document.documentElement.scrollWidth,
    article: Math.round(document.querySelector("article").getBoundingClientRect().width),
  },
]);
```

期待される出力:

| screen | page | article |
| ------ | ---- | ------- |
| 375    | 640  | 640     |

画面は 375px なのに、記事は 640px のままで、ページが横にはみ出している。指で横にずらせてしまう状態だ。

#### なぜ縮まないのか

`app/layout.tsx` の `<body>` には `display: "flex"` と `flexDirection: "column"` が付いている。flex は中の要素を縦や横に並べる仕組みで、その中に入った要素（ここでは `<article>`）は、ふつうは「中身より細くならない」。記事の中には、長い行のコードブロックがある。だから `<article>` は、上限の 640px まで広がったまま縮まなかった。

#### 直す

`<article>` の `css()` の先頭に `width: "full"` を足す。

```tsx
      className={css({
        width: "full",
        maxWidth: "640",
        marginX: "auto",
        paddingX: "16",
        paddingY: "48",
      })}
```

`full` は 2-2 で作った `100%` のトークンだ。ブラウザを再読み込みし、もう一度貼る。

期待される出力:

| screen | page | article |
| ------ | ---- | ------- |
| 375    | 375  | 375     |

**なぜ** — `width: "full"` で「親（`<body>`）の幅と同じ」と幅をはっきり決めると、中身の長さではなく、その幅に合わせて縮むようになる。広い画面では `maxWidth: "640"` が上限になるので、1280px の画面では 640px のままだ。

長いコードは手順 4 の `overflowX: "auto"` のおかげで、コードブロックの中だけで横にスクロールする。ページ全体ははみ出さない。

確かめたら、端末の幅の画面を `Cmd + Shift + M` で閉じる。

---

### 手順 7：わざと書き間違え、止まる場所と止まらない場所を確かめる

1つ確かめるたびに、元に戻してから次に進む。

#### 7-a：`&` を付け忘れる

`app/posts/[slug]/prose.ts` の `"& h2"` を `h2` に書き換える。

```ts
  h2: { textStyle: "heading.2", marginTop: "48", marginBottom: "16" },
```

```bash
bun run typecheck
```

期待される出力（抜粋。行と列の番号は変わることがある）:

```
app/posts/[slug]/prose.ts(5,3): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Object literal may only specify known properties, and 'h2' does not exist in type 'SystemStyleObject'.
```

`&` のない `h2` は、セレクタではなく「`h2` という名前のプロパティ」と読まれる。そんなプロパティはないので、型検査が止める。

#### 7-b：文字の型の名前を間違える

`"heading.2"` を `"heading.20"` に書き換える。

```bash
bun run typecheck
```

期待される出力（抜粋）:

```
    Type '"heading.20"' is not assignable to type 'ConditionalValue<TextStyleValue>'. Did you mean '"heading.2"'?
```

#### 7-c：文字の型の中に生の値を書く

`theme/text-styles.ts` の `heading.2` の `fontSize: "24"` を `fontSize: "23px"` に書き換える。

```bash
bun run panda codegen
bun run typecheck
```

期待される出力（`typecheck` の最後の行。`codegen` も警告を出さない）:

```
✓ Types generated successfully
```

**型検査が見張っているのは、`css()` を書く側だけだ。** 2-2 の `globalCss`、2-3 の `theme/semantic.ts` と同じく、`theme/text-styles.ts` の中は型で守られない。2-2 で作った文字の大きさの一覧にない `23px` も、そのまま通ってしまう。`theme/` の中を書くときは、値が一覧の名前になっているかを自分の目で確かめる。

確かめたら `"24"` に戻し、`bun run panda codegen` を実行する。

---

### 手順 8：この回で決めたことを ADR に書く

`docs/adr/` に ADR を作る。ファイル名の `yyyymmdd-hhmm` は作った日時に書き換える（例: `20261108-1030-article-typography.md`）。

```markdown
# 記事ページは幅 640px、デジタル庁の文字の型で組み、本文の中は子孫セレクタで整える

- 日付: 2026-11-xx
- 状態: 採用

## 背景

記事ページは題名・見出し・本文がすべて 16px で、段落の間もなく、1行が画面の幅いっぱいに伸びていた。2-2 と 2-3 で作ったトークンを、初めて実際のページに使う。

## 決めたこと

- 記事の幅は最大 640px（`sizes.640` = `40rem`）。左右に 16px の余白をとり、真ん中に置く。`width: "full"` も付ける
- 文字の型を `theme/text-styles.ts` に置く。`heading.1`（Std-32B-150）、`heading.2`（Std-24B-150）、`body`（Std-16N-170）
- 字間のトークン `letterSpacings` を 0・1・2（%）の3段で作る。コードの字間は 0
- 本文は `<div className={prose}>` で包み、`app/posts/[slug]/prose.ts` の子孫セレクタ（`& h2` など）で整える。今の記事に出てくる要素だけを整え、出てきたら足す
- 段落の下は 16px、`##` の見出しの上は 48px・下は 16px
- リンクは `fg.link`（`blue.800` / `blue.300`）と下線

## 理由

- 1行 38 字前後に収まり、行を読み違えにくい
- デジタル庁が確かめた大きさ・行の高さ・字間の組み合わせを、2-2 の段だけで組める
- 本文の要素は MDX が作るので、1つ1つに `className` を書けない

## 採らなかった案

- **MDX の `components` で要素を自分の部品に差し替える。** 要素ごとに部品を作る手間がかかる。2-5 で本文の中に部品を置くときに考え直す
- **リンクを色だけで示す。** `blue.800` と本文の `gray.900` のコントラスト比は 2.01 しかなく、色だけではリンクと分からない

## 気をつけること

- `body` が flex なので、`<article>` に `width: "full"` がないと、スマートフォンの幅で横にはみ出す
- `theme/text-styles.ts` の中の値は型検査で止まらない
- 本文の中に部品を置くと、`prose` の `& a` や `& p` が部品にも当たる
```

**なぜ** — 2-5 ではタグやカードの部品を作る。部品の余白や文字の大きさを決めるとき、記事の本文がどの値で組まれているかが前提になる。

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

```bash
git status --short
```

期待される出力（ADR のファイル名は自分のものになる）:

```
 M app/posts/[slug]/page.tsx
 M panda.config.ts
 M theme/semantic.ts
 M theme/tokens.ts
?? app/posts/[slug]/prose.ts
?? docs/adr/20261108-1030-article-typography.md
?? theme/text-styles.ts
```

`content/` の下書きや `docs/design/inventory/` のように、この回と関係ないファイルが出ていても、下の `git add` には含めない。

```bash
git add "app/posts/[slug]" panda.config.ts theme docs/adr
git commit -m "feat: 記事ページを幅 640px とデジタル庁の文字の型で組み、読める文字組みにする"
git push
```

`app/posts/[slug]` を `"` で囲むのは、zsh が `[` と `]` を特別な記号として読むからだ。

push したら、Vercel のビルドが通り、本番の記事ページが手順 4 の見た目になっていることを確かめる。

---

### うまくいかないとき

| 症状                                                                               | 原因と対処                                                                                                                           |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `'h2' does not exist in type 'SystemStyleObject'`                                  | 手順 7-a のとおり。`&` を付け忘れている。`"& h2"` と、`"` で囲んで書く                                                               |
| `Type '"heading.20"' is not assignable to type 'ConditionalValue<TextStyleValue>'` | 手順 7-b のとおり。文字の型の名前を書き間違えている。`Did you mean` のあとの名前に直す                                               |
| `maxWidth: "640"` の行で型エラーになる（エラー文は未確認）                         | 手順 2 の `sizes.640` を `theme/tokens.ts` に足していないか、`codegen` をし直していない                                              |
| 題名の字間が `normal` のまま（`letterSpacing` が効かない）                         | 手順 3-a の `letterSpacings` を足していない。`theme/text-styles.ts` の中は検査されないので、型検査では気づけない（この症状は未確認） |
| `Cannot find module './theme/text-styles'`                                         | `theme/text-styles.ts` の場所か名前が違う                                                                                            |
| 見出しの大きさが変わらない                                                         | `<Content />` を `<div className={prose}>` で包んでいない。手順 1 のコードで `article h2` の `fontSize` を見る                       |
| スマートフォンの幅で横にはみ出す                                                   | 手順 6 の `width: "full"` がない                                                                                                     |
| `git add` で `no matches found: app/posts/[slug]`                                  | zsh が `[slug]` を特別な記号として読んでいる。`"app/posts/[slug]"` と `"` で囲む                                                     |

ここに載っていないエラーが出たら、そのまま貼って聞いてほしい。

---

## 受け入れ条件

- [x] `theme/text-styles.ts` があり、`heading.1`・`heading.2`・`body` の3つが、大きさ・太さ・行の高さ・字間を持っている
- [x] `theme/semantic.ts` に `fg.link` があり、`base` と `_dark` の両方の値を持っている
- [x] `app/posts/[slug]/prose.ts` があり、`& h2`・`& p`・`& a`・`& pre`・`& code` が書かれている
- [x] `app/posts/[slug]/page.tsx` で、`<Content />` が `<div className={prose}>` に包まれている
- [x] 次のコマンドで `SizeToken 2`・`LetterSpacingToken 3` と出る: `for t in SizeToken LetterSpacingToken; do printf "%-18s %s\n" $t "$(grep -o "export type $t = [^>]*" styled-system/types/tokens.d.ts | grep -o '"[a-z0-9.-]*"' | wc -l | tr -d ' ')"; done`
- [x] 幅 1280px の画面で、`/posts/blog` の `article` が 640px、`h2` が 24px・700・上 48px・下 16px、`p` が下 16px になる
- [x] `/posts/umami` の本文のリンクが明るいとき `rgb(0, 49, 216)`、暗いとき `rgb(157, 183, 249)` で、下線が付いている
- [x] 幅 375px の画面で、`/posts/blog` の `document.documentElement.scrollWidth` が 375 になる
- [x] `docs/adr/` に、この回の ADR がある
- [x] `bun run lint` と `bun run build` が通る
- [ ] `dev` にコミットして push し、Vercel のビルドが通っている（コミットの時点では未 push）

## この回で理解したこと

着手後に埋める。受け入れ条件とは別に、何が分かったかを残す。

未チェックのままコミットした（2026-11-07、本人の了承あり）。分かったかどうかの記録なので、Claude はチェックを入れていない。ADR は本人の依頼で Claude が書いた。はみ出しの直し方（`<body>` を書き換えていた）と見出しの下線は、本人の依頼で Claude がチケットの形に直した。

- [ ] トークンと文字の型（textStyle）の違いを、`fontSize: "24"` と `textStyle: "heading.2"` を例に説明できる
- [ ] 本文の `h2` に `className` を書けず、`& h2` で整えた理由を説明できる
- [ ] 見出しの上を広く、下を狭くした理由を説明できる
- [ ] リンクに下線が要る理由を、本文の文字とのコントラスト比で説明できる
- [ ] 手順 6 で、`width: "full"` がないと記事が縮まなかった理由を説明できる
- [ ] 型検査で止まる書き間違いと止まらない書き間違いを、手順 7 の3つを例に説明できる

## 参考

- Panda CSS の文字の型: https://panda-css.com/docs/theming/text-styles
- Panda CSS のスタイルの書き方（子孫セレクタ）: https://panda-css.com/docs/concepts/writing-styles
- デジタル庁デザインシステム タイポグラフィ: https://design.digital.go.jp/dads/foundations/typography/
- WCAG 2.2 色の使用（1.4.1）: https://www.w3.org/TR/WCAG22/#use-of-color
- `docs/learn/reading-css.md`
- ADR `20261107-1637-primitive-values.md`
- ADR `20261107-1722-semantic-colors.md`
- 2-3 のチケット `tickets/2-3-semantic-colors.md`
