# 1-7: 記事ごとに、タイトルと日付を載せたシェア用の画像（OGP）をビルド時に作る

- 起票日: 2026-11-03
- 学習計画: まだない（設計の全体像は `docs/design/20260925-blog-design-proposal.md`）
- ステータス: 完了

## 全体のどこか

「記事を表示する」段の7段目にあたる。設計書の「記事詳細」に残っていた最後の1つで、これが済むと記事詳細の項目はすべてそろう。

| Step | 内容                                                   | 進捗     |
| ---- | ------------------------------------------------------ | -------- |
| 1-1  | 記事1本を `/posts/[slug]` に表示する                   | ■■■ 完了 |
| 1-2  | `/posts` に記事の一覧を出す                            | ■■■ 完了 |
| 1-3  | Shiki でコードブロックに色を付ける                     | ■■■ 完了 |
| 1-4  | Valibot で frontmatter の中身を検査し、`as` を取り除く | ■■■ 完了 |
| 1-5  | タグを付け、`/tags` と `/tags/[tag]` を作る            | ■■■ 完了 |
| 1-6  | 見出しから目次を作る                                   | ■■■ 完了 |
| 1-7  | 記事ごとにシェア用の画像を作る                         | ■■■ 完了 |

このチケットは 1-6 を完了してコミットしたあとの状態（`8819247`）から始める。

RSS・sitemap・404 ページは設計書の「裏方」の残りで、この回では扱わない。

## 作るもの

| パス（リポジトリ直下から）             | 中身                                                      |
| -------------------------------------- | --------------------------------------------------------- |
| `app/posts/[slug]/page.tsx`            | `generateMetadata` を足し、ページのタイトルを記事名にする |
| `app/posts/[slug]/opengraph-image.tsx` | 記事のタイトルと公開日を描いた PNG 画像を返す（新規）     |

足すパッケージはない。画像を作る `ImageResponse` は Next.js に入っている（`next/og`）。

今回は扱わないもの: サイト全体の `metadataBase`（公開する URL がまだ決まっていない）、`og:description`（原稿に要約の欄がまだない）、画像の凝った見た目、太字のフォント、X（旧 Twitter）向けの `twitter-image`。

## なぜこれをやるか

記事の URL を X や Slack に貼ると、カードの形で表示される。カードに出るタイトルと画像は、ページの `<head>` に書かれた `og:` で始まる `<meta>` から取られる。いまの記事ページは、どの記事もタイトルが「Create Next App」で、画像がない。これでは貼られても何の記事か分からない。

もう1つの狙いは Cache Components の「ビルド時に焼けるもの、焼けないもの」の境目を、画像という目で見える形で確かめることにある。1-1 からページに `"use cache"` を書いてきたが、書かなかったらどうなるかは試していない。今回は、書き忘れるとビルドが止まる場所と、止まらずに黙って動的に変わる場所の両方に出会う。

## 周辺知識

### 使う仕組み（出典: `node_modules/next/dist/docs/` の Next.js 16.4 のドキュメント）

| 仕組み                       | 役割                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------- |
| `generateMetadata`           | ページごとに `<title>` や `og:title` を決める関数。`page.tsx` から `export` する                  |
| `opengraph-image.tsx`        | 置いたフォルダのページに `og:image` を付けるファイル。default export の関数が画像を返す           |
| `ImageResponse`（`next/og`） | JSX を PNG 画像に変える。中身は Vercel の `@vercel/og`（satori で SVG にし、resvg で PNG にする） |
| `size`・`contentType`・`alt` | `opengraph-image.tsx` から `export` すると、`og:image:width` などの `<meta>` になる               |

- 画像の大きさは 1200×630 が定番。Next.js のドキュメントの例もこの大きさを使う
- `ImageResponse` が使える CSS は一部だけ。要素を2つ以上並べる `<div>` には `display: "flex"` が要る
- Cache Components を有効にしていると、`GET` のルート（`opengraph-image` もこれにあたる）はページと同じ規則で動く。非同期のファイル読み込みに出会うとビルド時の生成をやめ、リクエストが来てから作る形に変わる（`01-app/01-getting-started/15-route-handlers.md`）

### 日本語のフォント（出典: `node_modules/next/dist/compiled/@vercel/og/index.node.js` を読んだ。実測あり）

- `ImageResponse` が最初から持っているフォントは `Geist-Regular.ttf` だけで、日本語の文字は入っていない
- 日本語の文字に出会うと、Google Fonts から Noto Sans JP を取りに行く。取るのは画像に出てくる文字の分だけで、太さは 400 に決まっている
- 取りに行けなかったときはビルドを止めず、`Failed to load dynamic font for` とログに出して先へ進む。そのとき画像の文字がどう描かれるかは**未確認**

### 実測したこと

2026-11-03、macOS / Node v26.13.0 / bun 1.4.4 / Next.js 16.4.1 で、1-6 のコミット（`8819247`）を一時ディレクトリに複製して確かめた。

- ハンズオンの各段階で `bun run build` の出力とルートの表を見た。表の `ƒ` と `●` の変わり方は手順 3〜5 に写したとおり
- 完成形で `bun run typecheck`・`bun run lint`・`bun run format:check` が通る
- 生成された PNG を開き、日本語のタイトルと日付が描かれていることを目で見た
- 手順 2・手順 7・手順 8 のエラー文は、実際に出たものを写した

**未確認**: `bun dev` で画像の URL を開いたときの表示。手順 9 で自分の画面で確かめる。

## 作業手順（全体の地図）

1. 作業用のブランチを切る
2. `generateMetadata` でページのタイトルを記事名にする
3. いちばん小さい画像を返し、`og:image` が付くのを見る
4. `generateStaticParams` を足し、画像をビルド時に作らせる
5. 記事のタイトルを画像に載せる（**この回の本題**）
6. 日本語の文字がどこから来たのかを確かめる
7. わざと壊して、キャッシュに入れられないものを知る
8. わざと壊して、`display: "flex"` の決まりを知る
9. 開発サーバーで画像を開いて見る
10. コミットする

## 確認事項

- [x] **画像の作り方。** 推奨案「`opengraph-image.tsx` で、記事ごとにコードから作る」で作成。理由は記事を足すたびに画像を手で作らずに済み、タイトルを直せば画像も追いつくから。ただし、凝った絵や写真を載せたいときは、コードで描くより画像ファイルを置くほうが楽になる。Next.js は `opengraph-image.png` を置く方式にも対応しているので、記事ごとに差し替えたくなったら併用できる
- [x] **日本語のフォント。** 推奨案「`ImageResponse` が自動で Google Fonts から取ってくる Noto Sans JP に任せる」で作成。理由はフォントのファイルをリポジトリに入れずに済み、コードも増えないから。ただし、太さが 400 に決まっていて太字にできない。ビルドのたびに Google Fonts へつなぎに行くので、ネットが切れているとビルドは通るのに文字が描けない画像ができる恐れがある。太字にしたくなったら、フォントを自分で読み込んで `fonts` に渡す形に変える（Panda CSS で見た目を作る回に回す）
- [x] **データを読む場所。** 推奨案「`"use cache"` を付けた `getFrontmatter` に分け、`Image` 関数からはそれを呼ぶ」で作成。理由は`Image` 関数そのものに `"use cache"` を付けるとビルドが止まるから（手順 7）。ただし、ページの `Page` 関数とは書き方がそろわない。ページは関数ごとキャッシュし、画像は中のデータだけをキャッシュする
- [x] **記事を読む部品。** 推奨案「ページと同じ `getPost` を使い、frontmatter だけを取り出す」で作成。理由は`createPostReader` に新しい関数を足さずに済むから。ただし、`getPost` は本文の MDX まで組み立てるので、タイトルを知りたいだけにしては仕事が多い。記事が増えてビルドが遅くなったら、frontmatter だけを読む関数を `createPostReader` に足す
- [x] **画像に載せるもの。** 推奨案「タイトルと公開日だけ」で作成。理由は見た目を作り込むのは Panda CSS でデザインシステムを組んでからにしたいから。ただし、いまのままではサイト名もロゴもなく、どこのブログの記事かは画像から分からない
- [x] **`metadataBase` を設定しない。** 推奨案「今回は設定せず、ビルド時の警告をそのまま残す」で作成。理由は公開する URL（ドメイン）がまだ決まっていないから。設計書もホスティング先とドメインを「今回は論じていない」としている。ただし、このままだと `og:image` の URL が `http://localhost:3000/...` になり、公開しても SNS は画像を取りに来られない。公開先を決める回で必ず設定する
- [x] **【標準ルールからの逸脱】TDD を適用しない。** 本人の判断（2026-11-03）による。画像は目で見て確かめるもので、テストで確かめにくい

## ハンズオン

ここに出てくるコマンドの出力とエラー文は、実際に動かして写したもの（2026-11-03、bun 1.4.4 / Next.js 16.4.1）。

---

### 準備：この回で何をするのか

記事のページに、SNS 向けの名札を付ける。名札は2つある。1つはタイトルで、`generateMetadata` で記事名を入れる。もう1つは画像で、`opengraph-image.tsx` というファイルを置き、記事のタイトルと日付を描いた PNG をビルド時に作らせる。

#### OGP は、本屋の平台に置かれた本の「帯」

OGP（Open Graph Protocol）は、Facebook が 2010 年に決めた「ページの紹介文の書き方」の約束ごとだ。本屋の平台で、客は本を開かずに帯と表紙だけを見て手に取るかを決める。SNS のカードも同じで、X や Slack はページの中身を読まずに、`<head>` に書かれた帯の部分だけを読んでカードを作る。

```html
<meta property="og:title" content="はじめての記事" />
<meta property="og:image" content="https://.../opengraph-image" />
```

帯の書き方が決まっているので、SNS ごとに別の書き方をしなくて済む。この回で作るのは、この帯の中身になる。

#### ビルド時に「焼く」か、来てから「作る」か

1-1 から `bun run build` の最後に出るルートの表を見てきた。印の意味をもう一度並べておく。

| 印  | 意味                                                             |
| --- | ---------------------------------------------------------------- |
| `○` | ビルド時に作り終えたページ                                       |
| `●` | ビルド時に作り終えたもの。`generateStaticParams` で URL を決めた |
| `ƒ` | 誰かが開きに来てから、その場で作るもの                           |

パン屋で言えば、`○` と `●` は朝のうちに焼いて棚に並べたパン、`ƒ` は注文を受けてから焼くパンにあたる。ブログの記事は朝に焼いておけば足りるので、この回では画像も棚に並べる側に入れる。

#### 用意するもの

- 1-6 を完了してコミットした状態のリポジトリ
- ターミナルを1つ
- ブラウザ（手順 9 で使う）

---

### 手順 1：作業用のブランチを切る

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
git switch feat/1-6-toc
git status
git switch -c feat/1-7-og-image
```

`git status` で `nothing to commit, working tree clean` と出ることを確かめてから、最後の行を実行する。

**なぜ** — 1-6 の目次の作業もまだ `main` に入っていない。1-6 のブランチから切ると、目次を出している記事ページを引き継げる。

---

### 手順 2：`generateMetadata` でページのタイトルを記事名にする

いまのタイトルを先に見ておく。

```bash
bun run build
grep -o '<title>[^<]*</title>\|<meta property="og:[^>]*>' .next/server/app/posts/hello.html
```

```
<title>Create Next App</title>
```

`app/layout.tsx` に create-next-app が書いた仮のタイトルが、全部のページにそのまま出ている。`og:` で始まる `<meta>` は1つもない。

#### 2-a：`generateMetadata` を足す

`app/posts/[slug]/page.tsx` を2か所書き換える。

1つ目。ファイルの先頭に1行足す。

```tsx
import type { Metadata } from "next";
import path from "node:path";
```

2つ目。`generateStaticParams` と `Page` の間に、次の関数を足す。

```tsx
export async function generateMetadata({ params }: PageProps<"/posts/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return { title: post.frontmatter.title };
}
```

ビルドする。

```bash
bun run build
```

ビルドが止まる。

```
Route "/posts/[slug]": Next.js encountered uncached or runtime data in `generateMetadata()`.

This route's metadata is blocked, but the rest of its content can be prerendered.

Ways to fix this:
  - [static] Use a static metadata export instead of `generateMetadata()`
  - [cache] Cache the metadata with `"use cache"` in `generateMetadata()` (does not apply to `connection()`)
  - [dynamic] Render a marker component that calls `await connection()` inside `<Suspense>` on the page

Learn more: https://nextjs.org/docs/messages/blocking-prerender-metadata-runtime
```

**何が起きたのか** — `getPost` は `content/` の原稿をファイルから読む。Cache Components はファイルの読み込みを「毎回結果が変わるかもしれない読み込み」として扱う。ページの本体は `"use cache"` で棚に並べる許可を出していたが、`generateMetadata` には出していなかった。タイトルが決まらないとページの `<head>` を焼けないので、Next.js はビルドを止めて知らせてくれた。

#### 2-b：`"use cache"` を足す

エラーの `[cache]` の案に従う。関数の1行目に足す。

```tsx
export async function generateMetadata({ params }: PageProps<"/posts/[slug]">): Promise<Metadata> {
  "use cache";

  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return { title: post.frontmatter.title };
}
```

```bash
bun run build
grep -o '<title>[^<]*</title>\|<meta property="og:[^>]*>' .next/server/app/posts/hello.html
```

```
<title>はじめての記事</title>
```

ブラウザのタブに出るタイトルは記事名になった。ただし、帯の `og:title` はまだない。次の手順で画像を置くと一緒に出てくる。

---

### 手順 3：いちばん小さい画像を返し、`og:image` が付くのを見る

`app/posts/[slug]/opengraph-image.tsx` を新しく作る。

```tsx
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "white",
        fontSize: 64,
      }}
    >
      Hello OGP
    </div>,
    { ...size },
  );
}
```

```bash
bun run build
```

ルートの表に1行増える。印は `ƒ` になる。

```
├ ƒ /posts/[slug]/opengraph-image
```

記事ページの `<head>` を見る。

```bash
grep -o '<title>[^<]*</title>\|<meta property="og:[^>]*>' .next/server/app/posts/hello.html
```

```
<title>はじめての記事</title>
<meta property="og:title" content="はじめての記事"/>
<meta property="og:image" content="http://localhost:3000/posts/hello/opengraph-image?b021051efd4dcb71"/>
<meta property="og:image:type" content="image/png"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
```

`?` のあとの文字列はビルドごとに変わる。

**ファイルを置いただけで `<meta>` が付いた理由** — `opengraph-image` は Next.js が名前で見分ける特別なファイルで、`page.tsx` や `layout.tsx` の仲間にあたる。置かれたフォルダのページに、画像の URL を指す `og:image` を自動で書き足す。`size` と `contentType` を `export` しておくと、幅・高さ・形式の `<meta>` も付く。

**`og:title` も一緒に出てきた理由** — 帯の欄（`og:` の `<meta>`）が1つでもできると、Next.js は `<title>` の値を `og:title` にも写す。手順 2 では帯の欄が1つもなかったので、`og:title` も出なかった。

**なぜ `ƒ` なのか** — このファイルは `[slug]` のフォルダにある。Next.js から見ると、どの `slug` の画像を作ればよいかが分からない。分からないので、開きに来た URL を見てから作ることにした。

ビルドの途中に出る次の警告は、確認事項にあるとおり今回はそのままにする。

```
⚠ metadataBase property in metadata export is not set for resolving social open graph or twitter images, using "http://localhost:3000".
```

---

### 手順 4：`generateStaticParams` を足し、画像をビルド時に作らせる

`opengraph-image.tsx` を次の全文に書き換える。

```tsx
import path from "node:path";
import { ImageResponse } from "next/og";
import { createPostReader } from "../../../lib/createPostReader";

const { getAllSlugs } = createPostReader(path.join(process.cwd(), "content"));

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "white",
        fontSize: 64,
      }}
    >
      Hello OGP
    </div>,
    { ...size },
  );
}
```

```bash
bun run build
```

```
├   /posts/[slug]/opengraph-image
│ ├ ● /posts/hello/opengraph-image
│ └ ● /posts/lib-or-util/opengraph-image
```

`ƒ` が消え、記事の数だけ `●` が並んだ。

**なぜこれを足すのか** — `generateStaticParams` は「作るべき URL の一覧」を Next.js に渡す関数で、`page.tsx` にも同じものを書いてある。ページと画像は別のファイルなので、画像の側にも一覧を渡す必要がある。一覧があれば、Next.js はビルド中に記事の数だけ画像を焼ける。

---

### 手順 5：記事のタイトルを画像に載せる（この回の本題）

「Hello OGP」を記事のタイトルに置き換える。2段階で進める。

#### 5-a：素直に `getPost` を呼ぶ

`opengraph-image.tsx` を次の全文に書き換える。

```tsx
import path from "node:path";
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { createPostReader } from "../../../lib/createPostReader";

const { getAllSlugs, getPost } = createPostReader(path.join(process.cwd(), "content"));

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (post === null) notFound();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "white",
        fontSize: 64,
      }}
    >
      {post.frontmatter.title}
    </div>,
    { ...size },
  );
}
```

```bash
bun run build
```

ビルドは**エラーなしで通る**。ところが、ルートの表を見ると `●` が消えて `ƒ` に戻っている。

```
├ ƒ /posts/[slug]/opengraph-image
```

#### 5-b：読み込みを `"use cache"` の関数に分ける

`getPost` を呼ぶ部分を `getFrontmatter` という関数に切り出し、そこに `"use cache"` を付ける。`opengraph-image.tsx` を次の全文に書き換える。

```tsx
import path from "node:path";
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { createPostReader } from "../../../lib/createPostReader";

const { getAllSlugs, getPost } = createPostReader(path.join(process.cwd(), "content"));

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

async function getFrontmatter(slug: string) {
  "use cache";

  const post = await getPost(slug);
  return post?.frontmatter ?? null;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const frontmatter = await getFrontmatter(slug);
  if (frontmatter === null) notFound();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "white",
        fontSize: 64,
      }}
    >
      {frontmatter.title}
    </div>,
    { ...size },
  );
}
```

```bash
bun run build
```

```
├   /posts/[slug]/opengraph-image
│ ├ ● /posts/hello/opengraph-image               15m      1y
│ └ ● /posts/lib-or-util/opengraph-image         15m      1y
```

`●` に戻った。焼いた画像はビルドの出力の中にある。拡張子が `.body` になっているので、`.png` を付けて写してから開く。

```bash
cp .next/server/app/posts/hello/opengraph-image.body /tmp/og-hello.png
open /tmp/og-hello.png
```

白い画像の真ん中に「はじめての記事」と出ていれば成功。

**手順 2 とどこが違ったのか** — どちらも「ファイルを読んだのに `"use cache"` がない」という同じ間違いだった。ところが、手順 2 のページではビルドが止まり、5-a の画像では黙って `ƒ` に変わった。

ページは、ビルド時に焼く部分（静的な殻）と、来てから作る部分を1枚の中に混ぜられる。混ぜるときは `<Suspense>` で境目を示す決まりがあり、`<head>` を焼けないのは決まり違反にあたる。だから Next.js はビルドを止めた。

画像は1枚の PNG で、半分だけ焼いておけない。焼けなければ全部を来てから作るしかなく、それは決まり違反ではない。だから止めずに `ƒ` にした。

**この違いが今後どこに効くか** — `route.ts` で作る API（RSS の `/feed.xml` など）も画像と同じ側に入る。ファイルや外のデータを読むのに `"use cache"` を忘れると、エラーは出ず、表の印だけが変わる。この先、ルートを足したら `bun run build` の表で `●` か `○` になっているかを毎回見る、という習慣がここで要る理由になる。

**`15m 1y` は何か** — `"use cache"` の既定のキャッシュの寿命で、15分たったら作り直してよく、1年たったら必ず捨てる、という意味になる。ページの行にも同じ値が出ている。

---

### 手順 6：日本語の文字がどこから来たのかを確かめる

手順 5 の画像には日本語がきちんと描けていた。ところが `ImageResponse` が持っているフォントを見ると、日本語を描けるものは入っていない。

```bash
ls node_modules/next/dist/compiled/@vercel/og/
```

```
Geist-Regular.ttf
index.edge.d.ts
index.edge.js
index.node.d.ts
index.node.js
LICENSE
package.json
resvg.wasm
satori
types.d.ts
yoga.wasm
```

フォントは `Geist-Regular.ttf` の1つだけで、これは英字用だ。では日本語はどこから来たのか。`index.node.js` の中を探す。

```bash
grep -o '"ja-JP": "Noto+Sans+JP"' node_modules/next/dist/compiled/@vercel/og/index.node.js
grep -o 'https://fonts.googleapis.com/css2?family=' node_modules/next/dist/compiled/@vercel/og/index.node.js
```

```
"ja-JP": "Noto+Sans+JP"
https://fonts.googleapis.com/css2?family=
```

**何をしているのか** — フォントは「文字の形の見本帳」にあたる。`Geist` の見本帳には「は」の形が載っていない。そこで `ImageResponse` は、見本帳にない文字に出会うと、その文字が何語かを調べ、日本語なら Google Fonts から Noto Sans JP の見本帳を取り寄せる。取り寄せるのは画像に出てくる文字の分だけなので、日本語のフォント全体（数 MB）を落とすよりずっと軽い。

ただし、取り寄せるのはビルドしているその場になる。ネットにつながらない場所でビルドすると取り寄せに失敗する。失敗してもビルドは止まらない。確認事項に書いた欠点はここから来ている。

---

### 手順 7：わざと壊して、キャッシュに入れられないものを知る

手順 5 で `getFrontmatter` を分けたのは回り道に見える。`Image` 関数そのものに `"use cache"` を付ければ1行で済みそうだ。試す。

`opengraph-image.tsx` の `Image` 関数の1行目に `"use cache";` を足す。

```tsx
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  "use cache";

  const { slug } = await params;
```

```bash
bun run build
```

```
Error: Only plain objects, and a few built-ins, can be passed to Client Components from Server Components. Classes or null prototypes are not supported.
Error occurred prerendering page "/posts/hello/opengraph-image". Read more: https://nextjs.org/docs/messages/prerender-error
```

**何が起きたのか** — `"use cache"` は、関数の戻り値を一度文字の形（データ）に書き写して棚にしまう。書き写せるのは、ただのオブジェクト・文字列・数・配列のような、中身がデータだけのものに限られる。`ImageResponse` は `Response` という仕組みつきの入れ物（クラス）なので、書き写せない。エラー文の「Client Components」は今回の話とは関係がなく、書き写しの仕組みがページ用と同じなのでその名前が出ている。

frontmatter は文字列と配列だけでできているので、書き写せる。だから、データを読む部分だけを分けて棚にしまい、画像はそのデータから描く形にした。Next.js のドキュメントも `GET` のルートでは「キャッシュするデータの取得を別の関数に分ける」形を勧めている。

確かめたら、足した `"use cache";` と空行を消す。`bun run build` が通り、`●` に戻ることを確かめる。

---

### 手順 8：タイトルの下に日付を足し、`display: "flex"` の決まりを知る

#### 8-a：日付を足す

`ImageResponse` の中の JSX を、タイトルと日付を縦に並べる形に変える。あわせて、画像の説明文 `alt` を足す。`opengraph-image.tsx` を次の全文に書き換える。

```tsx
import path from "node:path";
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { createPostReader } from "../../../lib/createPostReader";

const { getAllSlugs, getPost } = createPostReader(path.join(process.cwd(), "content"));

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "記事のタイトルと公開日を載せた画像";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

async function getFrontmatter(slug: string) {
  "use cache";

  const post = await getPost(slug);
  return post?.frontmatter ?? null;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const frontmatter = await getFrontmatter(slug);
  if (frontmatter === null) notFound();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "white",
      }}
    >
      <div style={{ fontSize: 72 }}>{frontmatter.title}</div>
      <div style={{ fontSize: 32, color: "#555" }}>{frontmatter.date}</div>
    </div>,
    { ...size },
  );
}
```

```bash
bun run build
cp .next/server/app/posts/hello/opengraph-image.body /tmp/og-hello.png
open /tmp/og-hello.png
grep -o '<meta property="og:image:alt"[^>]*>' .next/server/app/posts/hello.html
```

画像の左上に「はじめての記事」、左下に「2026-09-25」が出る。

```
<meta property="og:image:alt" content="記事のタイトルと公開日を載せた画像"/>
```

**`alt` は何のためにあるのか** — 画面を読み上げて使う人には、画像の中身が見えない。`og:image:alt` は、カードの画像の代わりに読み上げられる説明になる。ページの `<img>` に付ける `alt` と同じ役割を持つ。

#### 8-b：わざと `display: "flex"` を外す

外側の `<div>` から `display: "flex",` の1行を消して、ビルドする。

```bash
bun run build
```

```
Error: Expected <div> to have explicit "display: flex", "display: contents", or "display: none" if it has more than one child node.
Error occurred prerendering page "/posts/hello/opengraph-image". Read more: https://nextjs.org/docs/messages/prerender-error
```

**何が起きたのか** — `ImageResponse` の中身は、ブラウザではなく satori という小さな描画器が描いている。satori は CSS のうち「箱を並べる」ためのやり方として flexbox しか持っていない。ブラウザなら `<div>` は何も書かなくても上から下へ積まれるが、satori はその既定の並べ方を持たない。だから子を2つ以上持つ `<div>` には並べ方を必ず書かせる。

確かめたら、消した `display: "flex",` を元に戻す。`bun run build` が通ることを確かめる。

---

### 手順 9：開発サーバーで画像を開いて見る

```bash
bun dev
```

ブラウザで次の2つを開く。

- http://localhost:3000/posts/hello/opengraph-image
- http://localhost:3000/posts/lib-or-util/opengraph-image

それぞれの記事のタイトルと日付が描かれた画像が出る。ブラウザのタブのタイトルが記事名になっていることも、http://localhost:3000/posts/hello で確かめる。

見終わったら `Ctrl + C` でサーバーを止める。

**なぜ開発サーバーでも見るのか** — 実際の SNS は、この URL に画像を取りに来る。ビルドの出力の中の `.body` ファイルを開くのとは違い、URL で画像が返ってくることをここで確かめておく。

---

### 手順 10：コミットする

```bash
bun run typecheck
bun run lint
git status
git add 'app/posts/[slug]/page.tsx' 'app/posts/[slug]/opengraph-image.tsx' tickets/1-7-og-image.md
git commit -m "feat: 記事ごとにタイトルと日付を載せたシェア用の画像を作る"
```

コミットの直前に lefthook が format・oxlint・markuplint・typecheck を走らせる。

**なぜパスを `'` で囲むのか** — zsh は `[slug]` を「s・l・u・g のどれか1文字」というファイル名の型として読む。そのまま書くと `no matches found` で止まるので、囲んで文字どおりのパスとして渡す。

---

### うまくいかないとき

| 症状                                                                          | 原因と対処                                                                                                                             |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `Next.js encountered uncached or runtime data in \`generateMetadata()\``      | `generateMetadata` の1行目に `"use cache";` がない。手順 2-b を見る                                                                    |
| ビルドは通るのに、表で `opengraph-image` が `ƒ` のまま                        | `generateStaticParams` がないか、ファイルを読む部分が `"use cache"` の関数に入っていない。手順 4 と手順 5-b を見る                     |
| `Only plain objects, and a few built-ins, can be passed to Client Components` | `Image` 関数に `"use cache"` が付いている。手順 7 のとおり消す                                                                         |
| `Expected <div> to have explicit "display: flex"`                             | 子を2つ以上持つ `<div>` に `display: "flex"` がない                                                                                    |
| `⚠ metadataBase property in metadata export is not set`                       | 今回は想定どおり。公開先を決める回で直す                                                                                               |
| 画像の日本語が描けていない／ログに `Failed to load dynamic font for`          | ビルド中に Google Fonts へつながらなかった。ネットにつながる場所でビルドし直す                                                         |
| `open /tmp/og-hello.png` で開けない                                           | `cp` の前に `bun run build` が通っているかを見る。`.next/server/app/posts/hello/` に `opengraph-image.body` があるかを `ls` で確かめる |

ここに載っていないエラーが出たら、そのまま貼って聞いてほしい。

---

## 受け入れ条件

- [x] `bun run build` の表で、`/posts/hello/opengraph-image` と `/posts/lib-or-util/opengraph-image` が `●` で並んでいる
- [x] `.next/server/app/posts/hello.html` に `<title>はじめての記事</title>` と `<meta property="og:title" content="はじめての記事"/>` がある
- [x] `.next/server/app/posts/hello.html` に `og:image`・`og:image:width`（1200）・`og:image:height`（630）・`og:image:alt` の `<meta>` がある
- [x] `.next/server/app/posts/hello/opengraph-image.body` が 1200×630 の PNG で、タイトルと日付が描かれていることを自分の目で確かめた
- [x] `"use cache"` のない 5-a の形でビルドが通り、表の印だけが `ƒ` に変わることを自分で確かめた
- [x] `bun dev` で `/posts/hello/opengraph-image` を開き、画像が出ることを自分で確かめた
- [x] `bun run typecheck` と `bun run lint` がエラーなしで終わる

## この回で理解したこと

着手後に埋める。動いたか（受け入れ条件）とは別に、何が分かったかを残す。

- [x] SNS がカードを作るとき、ページのどこを読んでいるかを説明できる
- [x] 同じ「`"use cache"` の書き忘れ」で、ページの `generateMetadata` はビルドが止まり、画像は黙って `ƒ` になった理由を説明できる
- [x] `Image` 関数に `"use cache"` を付けられず、データを読む関数を分けた理由を説明できる
- [x] フォントを渡していないのに日本語が描けた仕組みと、その仕組みが抱える弱点を説明できる
- [x] `generateStaticParams` を、ページと画像の両方に書く理由を説明できる

## 参考

- `opengraph-image` のファイル規約: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md`
- `ImageResponse`: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/image-response.md`
- Cache Components での `GET` ルートの扱い: `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- `generateMetadata`: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`
- The Open Graph protocol: https://ogp.me/
- satori が使える CSS: https://github.com/vercel/satori#css
- 前の回: `tickets/1-6-toc.md`
