# 2-5: タグとカードを部品にして3つのページで使い回し、`/design-system` に並べる

- 起票日: 2026-11-07
- 学習計画: 設計の全体像は `docs/design/20260925-blog-design-proposal.md` の「デザインシステムの作り方」。技術と順番は ADR `20261106-2104-design-system-panda-v2-react-aria.md`
- ステータス: 完了

## 全体のどこか

「見た目を作る」段の6回目で、全8回の6回目にあたる。2-4 で、トークンを初めて実際のページ（記事ページ）に使った。この回では何度も出てくる見た目を**部品**にまとめる。作るのは、タグ（`Tag`）と記事のカード（`PostCard`）の2つだ。作った部品は、見本のページ `/design-system` に並べる。

| Step | 内容                                                                | 進捗       |
| ---- | ------------------------------------------------------------------- | ---------- |
| 2-0  | デザインシステムとは何かを知り、今のサイトを棚卸しする              | ■□□ 進行中 |
| 2-1  | Panda CSS v2 を入れ、Tailwind CSS を外す                            | ■■■ 完了   |
| 2-2  | 基本トークン（色・文字の大きさ・余白）を作る                        | ■■■ 完了   |
| 2-3  | 意味トークンとダークモードを作る                                    | ■■■ 完了   |
| 2-4  | 記事ページの文字組みを整える（最初の実戦）                          | ■■■ 完了   |
| 2-5  | 状態を持たない部品（タグ・カード）を作り、`/design-system` に並べる | □□□ ← つぎ |
| 2-6  | React Aria で状態を持つ部品（テーマ切り替え・メニュー）を作る       | □□□        |
| 2-7  | React Aria のフックに置き換え、さらに自作に置き換える               | □□□        |

設計書の 2-5 には、リンク（Anchor）とコードブロック（CodeBlock）も挙がっている。1回には多いので、この回はタグとカードだけにし、残りの2つは次の回に回す（確認事項を参照）。作業ブランチは作らず、`dev` に直接コミットする。

## 作るもの

| 場所                                                     | 中身                                                                        |
| -------------------------------------------------------- | --------------------------------------------------------------------------- |
| `theme/tokens.ts`                                        | 角丸（`radii`）の `8`・`full` と、枠線の太さ（`borderWidths`）の `1` を足す |
| `theme/semantic.ts`                                      | 枠線の色 `border.default` を足す                                            |
| `panda.config.ts`                                        | `include` に `components/` を足す                                           |
| `components/tag.tsx`（新規）                             | タグの部品。大きさ `sm`・`md` の2種類                                       |
| `components/post-card.tsx`（新規）                       | 記事のカードの部品。日付と題名                                              |
| `app/posts/[slug]/page.tsx`                              | 記事の上のタグを `Tag`（`sm`）にする                                        |
| `app/tags/page.tsx`、`app/tags/_components/tag-link.tsx` | タグ一覧を `Tag`（`md`）にする。押された回数の計測は残す                    |
| `app/posts/page.tsx`、`app/tags/[tag]/page.tsx`          | 記事の並びを `PostCard` にする                                              |
| `app/design-system/page.tsx`（新規）                     | 部品の見本のページ                                                          |
| `docs/adr/<yyyymmdd-hhmm>-tag-and-card.md`（新規）       | この回で決めたこと（部品の置き場所、レシピの書き方、押せる大きさ）          |

今回は扱わないもの: リンクとコードブロックの部品（次の回）、記事一覧とタグ一覧のページの幅（カードは画面の幅いっぱいに並ぶ）、`/design-system` へのトークンの一覧、カーソルを載せたときの見た目（2-6）。

## なぜこれをやるか

今のサイトでは、同じ見た目が別々の場所に書かれている。記事の並び（日付と題名）は `app/posts/page.tsx` と `app/tags/[tag]/page.tsx` の2か所に、タグは記事ページとタグ一覧の2か所にある。この形のまま見た目を整えると、同じ `css()` を2か所に書くことになり、片方だけ直し忘れる。

そこで、見た目と中身をひとまとめにした部品を作り、使う場所はその部品を置くだけにする。2-4 の文字の型が「値のハンコ」だったのに対し、部品は「HTML ごとのハンコ」だ。

もう1つ、部品にはいくつかの種類（大きさなど）を持たせたいことがある。タグは記事の上では小さく、タグ一覧では大きくしたい。種類ごとの見た目を型つきで書ける Panda の仕組み（`cva`）を、この回で使う。

## 周辺知識

### Panda のレシピ（出典: https://panda-css.com/docs/concepts/recipes 、https://panda-css.com/docs/reference/css 、2026-11-07 確認）

- 見た目の種類（大きさ・色の違いなど）を名前で切り替えられるようにしたものを**レシピ**と呼ぶ
- 書き方は2つある。部品のファイルの中に `cva()` で書く形（atomic recipe）と、`panda.config.ts` に `defineRecipe()` で書く形（config recipe）
- `cva()` には `base`（いつも当てる見た目）、`variants`（種類ごとの見た目）、`defaultVariants`（種類を指定しなかったときの値）を書く
- `cva()` が返す関数に `{ size: "sm" }` を渡すと、クラス名の文字列が返る
- `RecipeVariantProps<typeof tagStyle>` で、種類の型（`{ size?: "sm" | "md" }`）を取り出せる
- Panda が CSS を作るのは、`panda.config.ts` の `include` に入っているファイルの中の `css()` と `cva()` だけ

### 枠線と押せる大きさ（出典: WCAG 2.2 の 1.4.11、2.5.8、https://www.w3.org/TR/WCAG22/ ）

- **1.4.11 文字以外のコントラスト**: 部品の形を見分けるのに要る線（枠線など）は、隣の色と 3:1 以上
- **2.5.8 押せる大きさ（最低限）**: 押せるものは 24 × 24px 以上。小さくてもまわりに十分なすき間があればよい、という例外がある

灰色の段を、枠線の色として白い背景と黒い背景に置いたときのコントラスト比（WCAG の式で計算した値）:

| 色         | 白い背景の上 | 黒い背景の上 |
| ---------- | ------------ | ------------ |
| `gray.300` | 2.10         | 10.02        |
| `gray.400` | 2.85         | 7.37         |
| `gray.500` | 4.00         | 5.24         |
| `gray.600` | 5.74         | 3.66         |

### デジタル庁デザインシステムの角丸（出典: `@digital-go-jp/design-tokens` 2.1.0 の `dist/tokens.css`、2026-11-07 確認）

- 角丸は 4・6・8・12・16・24・32px と `full`（`624.9375rem` = 9999px）の8段

### 実測したこと

2026-11-07、`dev` の `b233a77` を一時ディレクトリに複製し、macOS / bun 1.4.4 / Next.js 16.4.1 / Playwright の Chromium（幅 1280px）で、このチケットの手順どおりに動かした。

- `components/` を `include` に足さないと、型検査は通るのに、部品のクラス名（`bd-w_1 bdr_full ...`）に当たる CSS が書き出されない。タグの枠線・角丸・余白はすべて 0px になる
- `sm` のタグは、上下の余白がないと高さ 23px で、24px に届かない。上下に 4px 足すと 31px になる。`md` は 34px
- タグの枠線は明るいときも暗いときも `rgb(127, 127, 127)`（`gray.500`）
- カードは余白 16px、枠線 1px、角丸 8px、日付 14px・`rgb(102, 102, 102)`、題名 `rgb(0, 49, 216)`・700・下線
- タグに `size="lg"` を渡すと、型検査が `Type '"lg"' is not assignable to type '"md" | "sm" | undefined'.` と止める
- 最後の状態で、色のトークンは 30、角丸は 2、枠線の太さは 1。`bun run typecheck`、`bun run lint`、`bun run build` が通り、`/design-system` が静的なページとして作られる

**検証の方法について**: Claude は `theme/tokens.ts` を読めない（`~/.claude/settings.json` の `Read(**/*token*)`）。一時ディレクトリでは、手順 1 で `theme/tokens.ts` に足す値を、`panda.config.ts` の `theme.tokens` の側で同じ値を足して確かめた。

**未確認**: Vercel でのビルド。タグ一覧のタグを押したときに、Umami に `tag-click` が送られること（部品に置き換えても `onClick` は同じものを渡している）。Chrome の DevTools の画面操作。

### 現時点のバージョン（2026-11-07 確認）

| パッケージ              | バージョン | この回での扱い |
| ----------------------- | ---------- | -------------- |
| `@pandacss/dev`         | 2.5.0      | そのまま       |
| `@pandacss/preset-base` | 2.5.0      | そのまま       |
| `next`                  | 16.4.1     | そのまま       |

## 作業手順（全体の地図）

1. 部品で使う値（角丸・枠線の太さ・枠線の色）を足す
2. タグの部品を `cva` で作り、記事ページで使う（**この回の本題**）
3. 枠が出ないのを確かめ、`include` に `components/` を足す
4. タグ一覧でも使い、押された回数の計測を残す
5. 押せる大きさを測り、小さいタグを直す
6. 記事のカードの部品を作り、記事一覧とタグ別のページで使う
7. `/design-system` に部品を並べる
8. わざとない大きさを渡し、型検査が止めるのを確かめる
9. この回で決めたことを ADR に書く
10. lint・型検査・ビルドを通し、コミットして push する

## 確認事項

- [ ] **この回で作る部品。** 推奨案「タグ（`Tag`）とカード（`PostCard`）だけ。リンクとコードブロックは次の回」で作成。理由はどちらも今のサイトの2か所以上に同じ見た目があり、部品にする効き目がすぐ確かめられるから。4つを1回でやると、1回の分量が 2-4 の倍近くになる。ただし、設計書と ADR の表の「2-5」と中身がずれる。次の回を「2-5 の続き」として作るか、表を書き直すかは、次のチケットを作るときに決める
- [ ] **部品の置き場所。** 推奨案「リポジトリ直下の `components/`。`panda.config.ts` の `include` に足す」で作成。理由は部品は記事ページにもタグ一覧にも `/design-system` にも置くので、特定のページのフォルダに入れると場所が合わないから。ただし、`include` に足すのを忘れると、型検査は通るのに見た目が出ない（手順 3）。Next.js の `app/_components/` に置く形もある
- [ ] **レシピの書き方。** 推奨案「部品のファイルの中に `cva()` で書く」で作成。理由はタグの見た目を使うのはタグの部品だけで、見た目と HTML を1つのファイルで読めるから。ただし、ほかの部品とレシピを共有したくなったら、`panda.config.ts` の config recipe に移す必要がある
- [ ] **タグの大きさの種類。** 推奨案「`sm`（記事の上、14px）と `md`（タグ一覧、16px）の2つ。指定しないときは `md`」で作成。理由は今のサイトでタグを置く場所がこの2つで、それぞれ目立たせたい度合いが違うから。ただし、14px はデジタル庁が「補足の情報や場所が限られるとき」に限っている大きさで、本文の基準の 16px より小さい
- [ ] **タグの見た目。** 推奨案「枠線だけで背景は塗らない。角丸は `full`（両端が丸い形）。下線は付けない」で作成。理由は枠で囲んだ丸い形がタグだと分かる印になり、下線がなくても押せるものだと分かるから。2-4 では「下線＝リンクの印」と決めたが、タグはこの例外にする。ただし、デジタル庁はリンクに下線を付けるよう勧めている。枠の形を見てもリンクだと分からない人がいるかもしれない
- [ ] **枠線の色。** 推奨案「`border.default` に `gray.500` を1つ。明るいときも暗いときも同じ」で作成。理由は白の上で 4.00、黒の上で 5.24 になり、どちらも 1.4.11 の 3:1 を超えるから。1つの色で足りるので `_dark` は書かない。ただし、明るいときの枠は少し濃く見える。`gray.400`（白の上で 2.85）にすると薄くなるが、3:1 に届かない
- [ ] **角丸と枠線の太さのトークン。** 推奨案「角丸はデジタル庁の 8 と `full` の2つ、枠線の太さは 1px の1つ」で作成。理由はこの回で使うのがこの3つだけだから。2-2 と同じく、使う場所が来たら足す。ただし、デジタル庁の角丸は8段あり、ほかの6段はまだ入っていない
- [ ] **押せる大きさ。** 推奨案「タグは 24px 以上の高さにする。`sm` に上下 4px の余白を足して 31px」で作成。理由は2.5.8 の 24px に届かないと、指で押し損ねやすいから（手順 5）。ただし、`sm` と `md` の高さの差が 3px しかなく、大きさの違いは主に文字の大きさと左右の余白になる
- [ ] **カードの中身と押せる範囲。** 推奨案「日付（14px・`fg.muted`）と題名（リンク・太字・下線）。押せるのは題名だけ」で作成。理由はカード全体をリンクにすると、中の文字がすべて読み上げでリンクの名前になり、長くなるから。ただし、カードの空いているところを押しても記事に移れない
- [ ] **`/design-system` の中身。** 推奨案「部品の見本（タグの2種類とカード）だけを並べる」で作成。理由は設計書の「作るたびに並べていけば、見本ページが育っていく」に沿って、まず部品から始めるため。ただし、色や文字の大きさのトークンの一覧はまだ載せない。ページの幅の `css()` は記事ページと同じものをもう一度書くことになる
- [ ] **記事一覧とタグ一覧のページの幅。** 推奨案「この回では触らない」で作成。理由はページ全体の枠組み（幅・ヘッダー）は、部品とは別にまとめて考えたいから。ただし、広い画面ではカードが画面の幅いっぱいに伸びる
- [ ] **タグ一覧の計測。** 推奨案「`TagLink` を残し、中で `Tag` に `onClick` を渡す」で作成。理由は`Tag` を Server Component のまま使えるようにするため。関数（`onClick`）を渡せるのは Client Component からだけなので、計測が要るタグ一覧だけ `TagLink`（`"use client"`）を通す。ただし、タグの部品が `Tag` と `TagLink` の2つに見えて、どちらを使うか迷うことがある
- [ ] **ADR を書くか。** 推奨案「書く（手順 9）」で作成。理由は部品の置き場所とレシピの書き方は、次の回と 2-6 で前提になるから。ただし、手順が1つ増える
- [ ] **【標準ルールからの逸脱】TDD を適用しない。** 本人の判断（2026-11-03）による。確かめるのは型検査の結果と、ブラウザで計算された値

## ハンズオン

コマンドの出力とブラウザの値は、`b233a77` を一時ディレクトリに複製して実際に動かし、写したもの（2026-11-07、bun 1.4.4 / Next.js 16.4.1 / Playwright の Chromium、幅 1280px）。

---

### 準備：この回で何をするのか

タグとカードの見た目を、それぞれ1つのファイルにまとめる。使う場所では `<Tag tag="blog" size="sm" />` のように部品を置くだけにする。

#### 部品は「型抜き」

クッキーの型抜きを思い浮かべるとよい。星の型で抜けば、何枚作っても同じ星になる。星の形を少し変えたくなったら、型を1つ直せば、そのあとに抜くクッキーは全部変わる。

今のサイトはクッキーを1枚ずつ手で切っている状態だ。記事一覧とタグ別のページで、同じ「日付と題名」を別々に書いている。この回では、型（部品）を作り、3つのページでその型を使う。

型には大きさ違いを持たせられる。タグなら「小さい星」と「大きい星」の2つの型を用意しておき、置く場所で選ぶ。この大きさ違いを書く仕組みが `cva`（レシピ）だ。

#### 用意するもの

- 2-4 を終えた `dev`
- Chrome

---

### 手順 1：部品で使う値（角丸・枠線の太さ・枠線の色）を足す

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
git switch dev
git pull
```

`theme/tokens.ts` に、角丸（`radii`）と枠線の太さ（`borderWidths`）を足す。

```ts
  radii: {
    8: { value: "0.5rem" },
    full: { value: "624.9375rem" },
  },
  borderWidths: {
    1: { value: "1px" },
  },
```

角丸の値はデジタル庁の `--border-radius-8` と `--border-radius-full` と同じだ。`full` は 9999px で、どんな大きさの箱でも両端が半円になる。

`theme/semantic.ts` の `colors` の中、`fg` の後ろに `border` を足す。

```ts
    border: {
      default: { value: "{colors.gray.500}" },
    },
```

```bash
bun run panda codegen
```

**なぜ** — 2-2 では使う場所がなかったので、角丸と枠線の値を作っていなかった。部品で初めて要るので、ここで一覧に足す。

`border.default` には `base` と `_dark` を書いていない。値を1つだけ書くと、明るいときも暗いときも同じ色になる。周辺知識の表のとおり、`gray.500` は白の上でも黒の上でも 3:1 を超えるので、1つで足りる。

---

### 手順 2：この回の本題。タグの部品を `cva` で作り、記事ページで使う

リポジトリの直下に `components` フォルダを作る。

```bash
mkdir -p components
```

`components/tag.tsx` を作り、次の内容を貼る。

```tsx
import Link from "next/link";
import { cva, type RecipeVariantProps } from "../styled-system/css";

export const tagStyle = cva({
  base: {
    display: "inline-block",
    borderWidth: "1",
    borderColor: "border.default",
    borderRadius: "full",
    color: "fg.default",
    lineHeight: "150",
  },
  variants: {
    size: {
      sm: { fontSize: "14", paddingX: "8" },
      md: { fontSize: "16", paddingX: "16", paddingY: "4" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type TagProps = { tag: string; onClick?: () => void } & RecipeVariantProps<typeof tagStyle>;

export function Tag({ tag, size, onClick }: TagProps) {
  return (
    <Link href={`/tags/${tag}`} className={tagStyle({ size })} onClick={onClick}>
      {tag}
    </Link>
  );
}
```

上から順に読む。

- `cva({ ... })` の `base` は、どの大きさでもいつも当てる見た目だ。枠線・角丸・文字の色がここに入る
- `variants.size` は、大きさの種類ごとの見た目だ。`sm` と `md` で、文字の大きさと余白が違う
- `defaultVariants` は、`size` を指定しなかったときに使う種類だ
- `tagStyle({ size })` は、選んだ種類に合うクラス名の文字列を返す
- `RecipeVariantProps<typeof tagStyle>` は、`cva` の定義から `{ size?: "sm" | "md" }` という型を取り出す。`TagProps` に混ぜることで、`<Tag size="..." />` に書ける値が `sm` と `md` に限られる

`app/posts/[slug]/page.tsx` で使う。import の `Link` を消し、`Tag` を足す（`Link` はタグにしか使っていなかった）。

```ts
import { prose } from "./prose";
import { Tag } from "../../../components/tag";
```

記事の上のタグの並びを書き換える。

変える前:

```tsx
<ul>
  {frontmatter.tags.map((tag) => (
    <li key={tag}>
      <Link href={`/tags/${tag}`}>{tag}</Link>
    </li>
  ))}
</ul>
```

変えたあと:

```tsx
<ul className={css({ display: "flex", flexWrap: "wrap", gap: "8" })}>
  {frontmatter.tags.map((tag) => (
    <li key={tag}>
      <Tag tag={tag} size="sm" />
    </li>
  ))}
</ul>
```

```bash
bun run typecheck
```

期待される出力（最後の行）:

```
✓ Types generated successfully
```

**大きさの違いは `variants` に名前で書く。** `sm` のときは 14px、`md` のときは 16px、と条件分岐を書く代わりに、種類の名前と見た目の組を並べるだけで済む。使う側は `size="sm"` と名前で選ぶ。2-3 の意味トークンで「色の名前」を選んだのと同じく、ここでは「見た目の種類の名前」を選んでいる。

`<ul>` に付けた `display: "flex"` と `flexWrap: "wrap"` は、タグを横に並べ、入りきらなければ次の行に送る指定だ。`gap: "8"` はタグ同士のすき間になる。

---

### 手順 3：枠が出ないのを確かめ、`include` に `components/` を足す

```bash
bun dev
```

http://localhost:3000/posts/blog を開く。記事の上のタグに枠が出ていないはずだ。Console に貼って確かめる。

```js
const a = document.querySelector('article a[href^="/tags/"]');
console.table([
  {
    className: a.className,
    border: getComputedStyle(a).borderTopWidth,
    radius: getComputedStyle(a).borderTopLeftRadius,
    padding: getComputedStyle(a).padding,
  },
]);
```

期待される出力:

| className                                                                         | border | radius | padding |
| --------------------------------------------------------------------------------- | ------ | ------ | ------- |
| d_inline-block bd-w_1 bd-c_border.default bdr_full c_fg.default lh_150 fs_14 px_8 | 0px    | 0px    | 0px     |

クラス名は付いているのに、枠も角丸も余白も 0 になっている。

**Panda が CSS を作るのは、`include` に入っているファイルだけだ。** `panda.config.ts` の `include` は `["./app/**/*.{ts,tsx}"]` で、`components/` は入っていない。Panda は `components/tag.tsx` の中の `cva()` を読まないので、`bdr_full` のようなクラスの中身（CSS）を書き出さない。クラス名だけが HTML に付き、中身がない状態になる。型検査はファイルの場所を気にしないので、ここでは止まらない。

`panda.config.ts` の `include` に `components/` を足す。

```ts
  include: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
```

```bash
bun run panda codegen
```

ブラウザを再読み込みし（変わらなければ `bun dev` を止めて起動し直す）、もう一度同じコードを貼る。

期待される出力:

| className | border | radius    | padding |
| --------- | ------ | --------- | ------- |
| （同じ）  | 1px    | 9999.01px | 0px 8px |

`radius` が 9999.01px と出るのは、`624.9375rem` を px に直した値だ。

---

### 手順 4：タグ一覧でも使い、押された回数の計測を残す

`app/tags/_components/tag-link.tsx` を、次の内容に置き換える。

```tsx
"use client";

import { Tag } from "../../../components/tag";

export function TagLink({ tag }: { tag: string }) {
  return <Tag tag={tag} onClick={() => window.umami?.track("tag-click", { tag })} />;
}
```

`app/tags/page.tsx` の import に `css` を足し、`<ul>` に横に並べる指定を付ける。

```ts
import { TagLink } from "./_components/tag-link";
import { css } from "../../styled-system/css";
```

```tsx
      <ul className={css({ display: "flex", flexWrap: "wrap", gap: "8" })}>
```

http://localhost:3000/tags を開き、Console に貼る。

```js
const a = document.querySelector("main a");
console.table([
  {
    href: a.getAttribute("href"),
    fontSize: getComputedStyle(a).fontSize,
    border: getComputedStyle(a).borderTopWidth,
  },
]);
```

期待される出力:

| href       | fontSize | border |
| ---------- | -------- | ------ |
| /tags/blog | 16px     | 1px    |

**なぜ** — `size` を書いていないので、`defaultVariants` の `md` になった。

`Tag` に `"use client"` を付けていないのは、記事ページのような Server Component（サーバーで HTML を作る部品）からも使いたいからだ。ただ、`onClick` のような関数は、Server Component から渡せない。だから、計測が要るタグ一覧だけ、`"use client"` の付いた `TagLink` を通して `onClick` を渡す。`TagLink` が `Tag` を読み込むと、その中の `Tag` はブラウザ側で動く。

---

### 手順 5：押せる大きさを測り、小さいタグを直す

http://localhost:3000/posts/blog を開き、Console に貼る。

```js
const a = document.querySelector('article a[href^="/tags/"]');
const r = a.getBoundingClientRect();
console.table([
  {
    fontSize: getComputedStyle(a).fontSize,
    width: Math.round(r.width),
    height: Math.round(r.height),
  },
]);
```

期待される出力（`width` はタグの文字の長さで変わる）:

| fontSize | width | height |
| -------- | ----- | ------ |
| 14px     | 46    | 23     |

高さが 23px で、WCAG 2.5.8 の 24px に1px 足りない。スマートフォンで指で押すとき、押し損ねやすい大きさだ。

`components/tag.tsx` の `sm` に、上下の余白を足す。

```ts
      sm: { fontSize: "14", paddingX: "8", paddingY: "4" },
```

ブラウザを再読み込みし、もう一度貼る。

期待される出力:

| fontSize | width | height |
| -------- | ----- | ------ |
| 14px     | 46    | 31     |

**なぜ** — 高さは文字の行の高さ（14px × 1.5 = 21px）と、上下の余白と、上下の枠線（1px × 2）の合計になる。余白が 0 だと 23px、上下 4px ずつ足すと 31px だ。

見た目を小さくすることと、押せる場所を小さくすることは別の話だ。文字は 14px のまま、押せる範囲だけを広げた。

---

### 手順 6：記事のカードの部品を作り、記事一覧とタグ別のページで使う

`components/post-card.tsx` を作り、次の内容を貼る。

```tsx
import Link from "next/link";
import { css } from "../styled-system/css";

type PostCardProps = { slug: string; title: string; date: string };

export function PostCard({ slug, title, date }: PostCardProps) {
  return (
    <article
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "4",
        padding: "16",
        borderWidth: "1",
        borderColor: "border.default",
        borderRadius: "8",
      })}
    >
      <time dateTime={date} className={css({ color: "fg.muted", fontSize: "14" })}>
        {date}
      </time>
      <Link
        href={`/posts/${slug}`}
        className={css({ color: "fg.link", textDecoration: "underline", fontWeight: "bold" })}
      >
        {title}
      </Link>
    </article>
  );
}
```

カードには大きさの種類がないので、`cva` ではなく `css()` で書いた。種類が要るようになったら、タグと同じく `cva` に書き換える。

`app/posts/page.tsx` で使う。import の `Link` を消し、`PostCard` を足す。

```ts
import { css } from "../../styled-system/css";
import { PostCard } from "../../components/post-card";
```

記事の並びを書き換える。

変える前:

```tsx
<ul>
  {posts.map(({ slug, frontmatter }) => (
    <li key={slug}>
      <time dateTime={frontmatter.date} className={css({ color: "fg.muted" })}>
        {frontmatter.date}
      </time>
      <Link href={`/posts/${slug}`}>{frontmatter.title}</Link>
    </li>
  ))}
</ul>
```

変えたあと:

```tsx
<ul className={css({ display: "flex", flexDirection: "column", gap: "16" })}>
  {posts.map(({ slug, frontmatter }) => (
    <li key={slug}>
      <PostCard slug={slug} title={frontmatter.title} date={frontmatter.date} />
    </li>
  ))}
</ul>
```

`app/tags/[tag]/page.tsx` も同じように書き換える。import の `Link` を消し、`css` と `PostCard` を足す（このファイルには `css` の import がまだない）。

```ts
import { notFound } from "next/navigation";
import { css } from "../../../styled-system/css";
import { PostCard } from "../../../components/post-card";
```

`<ul>` から `</ul>` までを、`app/posts/page.tsx` の「変えたあと」と同じ内容にする。

http://localhost:3000/posts を開き、Console に貼る。

```js
const card = document.querySelector("main article");
const s = getComputedStyle(card);
console.table([
  {
    cards: document.querySelectorAll("main article").length,
    padding: s.padding,
    border: s.borderTopWidth,
    radius: s.borderTopLeftRadius,
    titleColor: getComputedStyle(card.querySelector("a")).color,
  },
]);
```

期待される出力（`cards` は記事の数で変わる）:

| cards | padding | border | radius | titleColor      |
| ----- | ------- | ------ | ------ | --------------- |
| 7     | 16px    | 1px    | 8px    | rgb(0, 49, 216) |

http://localhost:3000/tags/blog も開き、同じ見た目のカードが並んでいることを目で確かめる。

**なぜ** — 2つのページの「日付と題名」が、1つの `PostCard` になった。カードの余白を変えたくなったら、`components/post-card.tsx` を直せば、両方のページが変わる。2-3 で記事一覧の日付に当てた `fg.muted` も、部品の中に移った。

---

### 手順 7：`/design-system` に部品を並べる

`app/design-system/page.tsx` を作り、次の内容を貼る。

```tsx
import { Metadata, ResolvingMetadata } from "next";
import { siteOpenGraph } from "../../lib/siteMetadata";
import { css } from "../../styled-system/css";
import { Tag } from "../../components/tag";
import { PostCard } from "../../components/post-card";

export async function generateMetadata(
  _props: PageProps<"/design-system">,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // openGraphを上書きすると親で指定したopengraph-imageを上書きしてしまうため、parentで参照
  const { openGraph } = await parent;
  return {
    title: "デザインシステム",
    alternates: { canonical: "/design-system" },
    openGraph: {
      ...siteOpenGraph,
      type: "website",
      url: "/design-system",
      images: openGraph?.images,
    },
  };
}

const section = css({ display: "flex", flexDirection: "column", gap: "16", marginTop: "48" });

export default function Page() {
  return (
    <main
      className={css({
        width: "full",
        maxWidth: "640",
        marginX: "auto",
        paddingX: "16",
        paddingY: "48",
      })}
    >
      <h1 className={css({ textStyle: "heading.1" })}>デザインシステム</h1>

      <section className={section}>
        <h2 className={css({ textStyle: "heading.2" })}>Tag</h2>
        <div className={css({ display: "flex", flexWrap: "wrap", gap: "8", alignItems: "center" })}>
          <Tag tag="blog" size="sm" />
          <Tag tag="blog" size="md" />
        </div>
      </section>

      <section className={section}>
        <h2 className={css({ textStyle: "heading.2" })}>PostCard</h2>
        <PostCard slug="blog" title="65banseki.devを作ってみた" date="2026-11-06" />
      </section>
    </main>
  );
}
```

`generateMetadata` は、`app/tags/page.tsx` と同じ形にした。1-13 で作った oxlint のルールは、`page.tsx` に `canonical` と `og:url` がないとコミットの前に止める。

http://localhost:3000/design-system を開き、Console に貼る。

```js
console.table(
  [...document.querySelectorAll('main a[href^="/tags/"]')].map((a) => ({
    fontSize: getComputedStyle(a).fontSize,
    padding: getComputedStyle(a).padding,
    height: Math.round(a.getBoundingClientRect().height),
  })),
);
```

期待される出力:

| fontSize | padding  | height |
| -------- | -------- | ------ |
| 14px     | 4px 8px  | 31     |
| 16px     | 4px 16px | 34     |

**なぜ** — 部品を1つのページに並べておくと、種類ごとの見た目を見比べられる。部品を直したとき、使っているページを1つずつ開かなくても、ここで変化を確かめられる。設計書の「作るたびに `/design-system` に並べていけば、見本ページが育っていく」の最初の1歩だ。

---

### 手順 8：わざとない大きさを渡し、型検査が止めるのを確かめる

`app/posts/[slug]/page.tsx` の `size="sm"` を `size="lg"` に書き換える。

```tsx
<Tag tag={tag} size="lg" />
```

```bash
bun run typecheck
```

期待される出力（抜粋。行と列の番号は変わることがある）:

```
app/posts/[slug]/page.tsx(63,28): error TS2322: Type '"lg"' is not assignable to type '"md" | "sm" | undefined'.
```

**なぜ** — `RecipeVariantProps<typeof tagStyle>` が、`cva` の `variants` に書いた `sm` と `md` だけを型にしている。部品に種類を足したいときは、まず `components/tag.tsx` の `variants` に足す。使う側で勝手に新しい種類を作ることはできない。

2-2 の `strictTokens` が「一覧にない値」を止めたように、ここでは「部品にない種類」が止まる。

確かめたら `size="sm"` に戻す。開発サーバーを `Ctrl + C` で止める。

---

### 手順 9：この回で決めたことを ADR に書く

`docs/adr/` に ADR を作る。ファイル名の `yyyymmdd-hhmm` は作った日時に書き換える（例: `20261108-1030-tag-and-card.md`）。

```markdown
# タグとカードを components/ の部品にし、大きさの違いは cva の variants で書く

- 日付: 2026-11-xx
- 状態: 採用

## 背景

記事の並び（日付と題名）は記事一覧とタグ別のページに、タグは記事ページとタグ一覧に、同じ見た目が別々に書かれていた。見た目を整えると、同じ指定を2か所に書くことになる。

## 決めたこと

- 部品はリポジトリ直下の `components/` に置き、`panda.config.ts` の `include` に足す
- 大きさなどの種類がある部品は、部品のファイルの中に `cva()` で書く。種類の型は `RecipeVariantProps` で取り出す
- 種類のない部品は `css()` で書く
- タグは `sm`（14px）と `md`（16px）。枠線だけ・角丸 `full`・下線なし。高さは 24px 以上
- カードは日付と題名。押せるのは題名だけ
- 枠線の色は `border.default`（`gray.500`）。明るいときも暗いときも同じ
- 部品は `/design-system` に並べる

## 理由

- 部品にすると、見た目を直す場所が1か所になる
- `variants` に書いた種類だけが型になり、使う側で勝手な種類を作れない
- `gray.500` は白の上で 4.00、黒の上で 5.24 で、WCAG 1.4.11 の 3:1 を超える
- 押せるものを 24px 以上にするのは、WCAG 2.5.8 に合わせるため

## 採らなかった案

- **`panda.config.ts` の config recipe に書く。** 部品のファイルと見た目が離れる。ほかの部品と共有したくなったら移す
- **カード全体をリンクにする。** 読み上げで、カードの中の文字がすべてリンクの名前になる
- **リンクとコードブロックの部品も、この回で作る。** 1回の分量が多すぎる

## 気をつけること

- `components/` を `include` に入れ忘れると、型検査は通るのに CSS が出ない
- タグは下線のないリンクで、2-4 の「下線＝リンクの印」の例外
- `onClick` を渡せるのは Client Component からだけ。タグ一覧は `TagLink` を通す
```

**なぜ** — 次の回のリンクとコードブロック、2-6 の状態を持つ部品も、`components/` に置き、`cva` で種類を書くことになる。最初の部品で決めた形を残しておく。

---

### 手順 10：lint・型検査・ビルドを通し、コミットして push する

```bash
bun run format
bun run lint
bun run build
```

期待される出力（`lint` の oxlint の部分と、`build` のページの一覧の一部）:

```
✔ 17 files checked, 0 problems
```

```
├ ○ /design-system
```

`/design-system` の前の `○` は、ビルドのときに HTML を作っておく静的なページという印だ。

```bash
git status --short
```

期待される出力（ADR のファイル名は自分のものになる）:

```
 M app/posts/[slug]/page.tsx
 M app/posts/page.tsx
 M app/tags/[tag]/page.tsx
 M app/tags/_components/tag-link.tsx
 M app/tags/page.tsx
 M panda.config.ts
 M theme/semantic.ts
 M theme/tokens.ts
?? app/design-system/
?? components/
?? docs/adr/20261108-1030-tag-and-card.md
```

`content/` の下書きや `docs/design/inventory/` のように、この回と関係ないファイルが出ていても、下の `git add` には含めない。

```bash
git add app components panda.config.ts theme docs/adr
git commit -m "feat: タグとカードを部品にして3つのページで使い回し、/design-system に並べる"
git push
```

push したら、Vercel のビルドが通り、本番の `/design-system` が開けることを確かめる。

---

### うまくいかないとき

| 症状                                                                                | 原因と対処                                                                                                                                 |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| タグにクラス名は付いているのに、枠も余白も出ない                                    | 手順 3 のとおり。`include` に `./components/**/*.{ts,tsx}` がない。足したら `bun run panda codegen`。変わらなければ `bun dev` を起動し直す |
| `Type '"lg"' is not assignable to type '"md" \| "sm" \| undefined'`                 | 手順 8 のとおり。`variants` にない種類を渡している                                                                                         |
| `'Link' is declared but its value is never read` のような警告やエラー（文は未確認） | 部品に置き換えたあと、ページの `import Link from "next/link";` が残っている。消す                                                          |
| `Cannot find module '../../components/tag'`                                         | `components/` の場所か、`../` の数が違う。`app/tags/page.tsx` からは `../../`、`app/tags/[tag]/page.tsx` からは `../../../`                |
| タグ一覧のタグを押しても計測されない                                                | `TagLink` の `onClick` を `Tag` に渡していないか、`Tag` の `<Link>` に `onClick={onClick}` がない                                          |
| `/design-system` でコミットの前に止まる                                             | 1-13 の oxlint のルール。`generateMetadata` に `alternates.canonical` と `openGraph.url` があるかを見る                                    |

ここに載っていないエラーが出たら、そのまま貼って聞いてほしい。

---

## 受け入れ条件

- [x] `components/tag.tsx` があり、`cva` の `variants.size` に `sm` と `md`、`defaultVariants` に `md` がある（置き場所は `app/_components/tag.tsx` に変更。ADR に記録）
- [x] `components/post-card.tsx` があり、`app/posts/page.tsx` と `app/tags/[tag]/page.tsx` の両方で使われている（置き場所は `app/_components/post-card.tsx`）
- [x] `app/posts/[slug]/page.tsx` で `<Tag size="sm" />`、`app/tags/_components/tag-link.tsx` で `<Tag onClick={...} />` が使われている
- [x] `panda.config.ts` の `include` に `./components/**/*.{ts,tsx}` がある（`app/_components/` は既存の `./app/**` に含まれるので不要になった）
- [x] `theme/semantic.ts` に `border.default` がある
- [x] 次のコマンドで `RadiusToken 2`・`BorderWidthToken 1` と出る: `for t in RadiusToken BorderWidthToken; do printf "%-18s %s\n" $t "$(grep -o "export type $t = [^>]*" styled-system/types/tokens.d.ts | grep -o '"[a-z0-9.-]*"' | wc -l | tr -d ' ')"; done`
- [ ] `/posts/blog` の記事の上のタグが、14px・高さ 31px・枠線 1px になる（ブラウザでの確認は未実施）
- [ ] `/posts` のカードが、余白 16px・枠線 1px・角丸 8px で、題名が `rgb(0, 49, 216)` になる（ブラウザでの確認は未実施）
- [ ] `/design-system` が開け、タグの2種類とカードが並んでいる（ブラウザでの確認は未実施）
- [x] `docs/adr/` に、この回の ADR がある
- [x] `bun run lint` と `bun run build` が通る
- [ ] `dev` にコミットして push し、Vercel のビルドが通っている（push は本人が行う）

## この回で理解したこと

着手後に埋める。受け入れ条件とは別に、何が分かったかを残す。

未チェックのまま、本人の指示でコミットした（2026-11-11）。

- [ ] 文字の型（2-4）と部品の違いを、「値のハンコ」と「HTML ごとのハンコ」で説明できる
- [ ] `cva` の `base`・`variants`・`defaultVariants` が、それぞれ何を決めているかを説明できる
- [ ] 手順 3 で、クラス名が付いているのに見た目が出なかった理由を説明できる
- [ ] 手順 5 で、文字の大きさを変えずに押せる範囲を広げた方法を説明できる
- [ ] `Tag` と `TagLink` を分けた理由を、Server Component と Client Component の違いで説明できる
- [ ] 手順 8 で `size="lg"` が止まった仕組みを、`RecipeVariantProps` で説明できる

## 参考

- Panda CSS のレシピ: https://panda-css.com/docs/concepts/recipes
- Panda CSS の `cva`: https://panda-css.com/docs/reference/css
- WCAG 2.2 文字以外のコントラスト（1.4.11）: https://www.w3.org/TR/WCAG22/#non-text-contrast
- WCAG 2.2 押せる大きさ（2.5.8）: https://www.w3.org/TR/WCAG22/#target-size-minimum
- デジタル庁のデザイントークン: https://github.com/digital-go-jp/design-tokens
- ADR `20261107-1919-article-typography.md`
- 2-4 のチケット `tickets/2-4-article-typography.md`
