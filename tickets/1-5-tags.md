# 1-5: 原稿にタグを付け、タグの数だけ `/tags/[tag]` のページをビルド時に作る

- 起票日: 2026-11-03
- 学習計画: まだない（設計の全体像は `docs/design/20260925-blog-design-proposal.md`）
- ステータス: 完了

## 全体のどこか

「記事を表示する」段の5段目にあたる。1-4 までで記事を1本ずつ正しく読めるようになったので、ここから記事同士をつなぐ。

| Step | 内容                                                   | 進捗     |
| ---- | ------------------------------------------------------ | -------- |
| 1-1  | 記事1本を `/posts/[slug]` に表示する                   | ■■■ 完了 |
| 1-2  | `/posts` に記事の一覧を出す                            | ■■■ 完了 |
| 1-3  | Shiki でコードブロックに色を付ける                     | ■■■ 完了 |
| 1-4  | Valibot で frontmatter の中身を検査し、`as` を取り除く | ■■■ 完了 |
| 1-5  | タグを付け、`/tags` と `/tags/[tag]` を作る            | ■■■ 完了 |

このチケットは 1-4 を完了してコミットしたあとの状態から始める。

## 作るもの

| パス（リポジトリ直下から）  | 中身                                                            |
| --------------------------- | --------------------------------------------------------------- |
| `lib/createPostReader.ts`   | schema に `tags` を足し、`getAllTags` と `getPostsByTag` を足す |
| `content/hello.mdx`         | frontmatter に `tags: [mdx, nextjs]` を足す                     |
| `content/lib-or-util.mdx`   | frontmatter に `tags: [nextjs]` を足す                          |
| `app/tags/page.tsx`         | タグの一覧（新規）                                              |
| `app/tags/[tag]/page.tsx`   | タグごとの記事一覧（新規）                                      |
| `app/posts/[slug]/page.tsx` | 記事の見出しの下に、タグへのリンクを出す                        |

依存パッケージは足さない。

今回は扱わないもの: 見た目（CSS）、タグごとの記事数の表示、`/posts` の一覧へのタグの表示、Lab へのタグ付け、`/about` の技術一覧、Zenn・Qiita への変換。

## なぜこれをやるか

設計書は `/tags/[tag]` を「技術を見に来た人」の入口にしている。React を知りたい人は React の記事と Lab だけを見たい。日付順の一覧から探してもらうのでは遠い。

設計書には `/about` の技術一覧を「React ★★★」のような自己採点ではなく、「React: この記事とこの Lab で使った」というリンクで示す案もある。その一覧も、記事に技術タグが付いていれば自動で作れる。タグはその一覧の材料にもなる。

1-4 で作った schema を、初めて広げる回でもある。項目を1つ足すと、型とビルド時の検査がまとめてついてくることを確かめる。

## 周辺知識

### タグの形を決める制約

原稿は Zenn と Qiita にも配る（ADR `20260925-1714-cross-post-articles.md`）。タグはそのまま Zenn の `topics` と Qiita の `tags` に写すことになるので、Zenn の制約に合わせておく。

Zenn の `topics` の検証（zenn-editor の `packages/zenn-model/src/utils.ts`、2026-11-03 に確認）:

| 制約 | Zenn のエラー文                                                                                          |
| ---- | -------------------------------------------------------------------------------------------------------- |
| 個数 | `topicsは最大5つまで指定できます`                                                                        |
| 長さ | `topicsは18字以内にしてください`                                                                         |
| 文字 | `topicsに記号やスペースを使用することはできません。例えばC++は「cpp」、C#は「csharp」と記載してください` |

Zenn の検証は日本語や大文字を禁止していない。今回は URL にそのまま使うため、さらに「小文字の英数字だけ」に絞る（確認事項）。

**未確認**: Qiita の `tags` の上限と使える文字。Qiita CLI の README には書かれていない。Qiita へ配る回で確かめる。

### `generateStaticParams` と Cache Components（出典: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md`）

- `generateStaticParams` が返した値の数だけ、ビルド時にページが作られる
- Cache Components を有効にしていると、`generateStaticParams` は少なくとも1つの値を返さなければならない。空の配列を返すとビルドエラーになる
- 返さなかった値の URL は、アクセスされたときにサーバーで作られる（ビルドの表の `◐`）

### 実測したこと

2026-11-03、macOS / Node v26.13.0 / bun 1.4.4 / Next.js 16.4.1 / valibot 1.5.0 で、1-4 のコミット（`0b89440`）を一時ディレクトリに複製して確かめた。

- ハンズオンの各段階で `bun run build` と `bunx tsc --noEmit` が通る（手順 2 と手順 8 は、ビルドが落ちるのが期待どおり）
- エラー文、ビルドの表、HTML の抜き出しは、実際に出たものを写した
- YAML の `tags: [mdx, nextjs]` は文字列の配列 `["mdx", "nextjs"]` として読まれる
- 新しく作る2つのページは `bun run lint` の markuplint を通る

**未確認**: 存在しないタグの URL（`/tags/unknown` など）を開いたときに 404 になるか。ビルドで作られないページなので、`bun run start` でサーバーを動かさないと確かめられない。手順 6 の最後で確かめる。

## 作業手順（全体の地図）

1. 作業用のブランチを切る
2. schema に `tags` を足し、ビルドが止まるのを見る
3. 原稿にタグを書く
4. タグを集める関数を足す
5. `/tags` を作る
6. `/tags/[tag]` を作る（**この回の本題**）
7. 記事ページにタグへのリンクを出す
8. 書き方の崩れたタグで、ビルドが止まるのを見る
9. コミットする

## 確認事項

- [ ] **タグに使える文字。** 推奨案「小文字の英数字だけ、1〜18字（`/^[a-z0-9]{1,18}$/`）」で作成。理由は Zenn の制約に収まり、そのまま URL の一部にできるから。大文字やドットが入らないので、`/tags/Next.js` と `/tags/nextjs` が別のページになることもない。ただし、画面にも `nextjs` と出て `Next.js` とは表示できない。ハイフンも使えないので、GitHub Actions は `githubactions` になる。見た目の名前が欲しくなったら、タグとは別に表示名の対応表を持つ
- [ ] **タグの個数と、付けないことを許すか。** 推奨案「1〜5個、必ず付ける」で作成。理由は Zenn の上限が5つで、Zenn は `topics` がないと警告を出すから。必須にしておくと、付け忘れがビルドで分かる。ただし、技術と関係の薄い雑記にもタグを1つ考えることになる
- [ ] **既存の記事に付けるタグ。** 推奨案「`hello.mdx` に `[mdx, nextjs]`、`lib-or-util.mdx` に `[nextjs]`」で作成。理由は本文から読み取れる技術で、`nextjs` が2本に付くので「1つのタグに複数の記事」という形を確かめられるから。ただし `hello.mdx` は Next.js の記事とは言いにくい。中身に合わせて変えてよい
- [ ] **タグを集める関数の置き場所。** 推奨案「`createPostReader` に `getAllTags` と `getPostsByTag` を足す」で作成。理由は原稿を読む処理を1か所に集める 1-1 からの方針どおりで、どちらも Next.js に依存しないから。ただし、どちらも呼ぶたびに全部の原稿の frontmatter を読む。ビルドではタグの数だけ読み直すので、原稿が数百本になったら一度読んだ結果を使い回す形に直す
- [ ] **タグ一覧の並べ方。** 推奨案「アルファベット順、記事数は出さない」で作成。理由は並べ方の決まりが単純で、出力を見て正しいかをすぐ確かめられるから。ただし、よく書いている技術が上に来ない
- [ ] **存在しないタグの URL。** 推奨案「記事が0本なら `notFound()` で 404 にする」で作成。理由は `/posts/[slug]` の作りと同じで、タグの形を別に確かめなくても、形の崩れたタグは記事が0本になるから。ただし、手順 6 の確かめ方は手元でサーバーを動かす必要があり、まだ実測していない
- [ ] **【標準ルールからの逸脱】TDD を適用しない。** 本人の判断（2026-11-03）による

## ハンズオン

ここに出てくるコマンドの出力とエラー文は、実際に動かして写したもの（2026-11-03、bun 1.4.4 / Next.js 16.4.1 / valibot 1.5.0）。

---

### 準備：この回で何をするのか

原稿の frontmatter に `tags` を足し、そのタグから2種類のページを作る。`/tags` にはタグの一覧を、`/tags/nextjs` のような各タグのページには、そのタグが付いた記事の一覧を出す。タグのページは原稿に書かれたタグの数だけビルド時に作られる。

#### タグのページはどこから来るのか

本の索引にたとえる。索引の「Next.js」の項には、Next.js が出てくるページ番号が並んでいる。索引は誰かが別に書いたものではない。本文を頭から読み、出てきた言葉を拾い集めて作る。

`/tags/[tag]` も同じで、タグのページを1枚ずつ手で作ることはしない。全部の原稿の `tags` を読んで、出てきたタグの数だけページを作る。原稿にタグを1つ足せば、次のビルドでページが1枚増える。

#### 用意するもの

- 1-4 を完了してコミットした状態のリポジトリ
- ターミナルを1つ

---

### 手順 1：作業用のブランチを切る

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
git switch feat/1-4-validate-frontmatter
git status
git switch -c feat/1-5-tags
```

`git status` で `nothing to commit, working tree clean` と出ることを確かめてから、最後の行を実行する。

**なぜ** — 1-1 から 1-4 の作業は、まだ `main` に入っていない。1-4 のブランチから切ると、Valibot の schema を引き継げる。

---

### 手順 2：schema に `tags` を足し、ビルドが止まるのを見る

`lib/createPostReader.ts` の `SLUG_PATTERN` の次の行に、タグの形を決める正規表現を足す。

```ts
const SLUG_PATTERN = /^[a-z0-9-]+$/;
const TAG_PATTERN = /^[a-z0-9]{1,18}$/;
```

`FrontmatterSchema` に `tags` を足す。

```ts
const FrontmatterSchema = v.object({
  title: v.pipe(v.string(), v.nonEmpty()),
  date: v.pipe(v.string(), v.isoDate()),
  tags: v.pipe(v.array(v.pipe(v.string(), v.regex(TAG_PATTERN))), v.minLength(1), v.maxLength(5)),
});
```

ビルドする。

```bash
bun run build
```

```
Error: hello.mdx の frontmatter が正しくありません
× Invalid key: Expected "tags" but received undefined
  → at tags
```

**`tags` の行の読み方** — 内側から外へ読む。

| 部分                                                   | 意味                          |
| ------------------------------------------------------ | ----------------------------- |
| `v.pipe(v.string(), v.regex(TAG_PATTERN))`             | 1つのタグは、決めた形の文字列 |
| `v.array(...)`                                         | それが並んだ配列              |
| `v.pipe(v.array(...), v.minLength(1), v.maxLength(5))` | 配列の長さは1以上5以下        |

`v.minLength` は、文字列に使えば文字数、配列に使えば要素の数を数える。

**なぜ先に schema を足すのか** — 原稿より先に「正しい形」を決めると、まだ直していない原稿をビルドが名指しで教えてくれる。今回は `hello.mdx` が先に見つかった。原稿が100本あっても、直し忘れをビルドが1本ずつ見つけてくれる。1-4 で入れた検査がここで初めて「決まりを変えたときの道具」として働く。

---

### 手順 3：原稿にタグを書く

`content/hello.mdx` の frontmatter の `date` の次の行に、`tags` を足す。

```mdx
---
title: はじめての記事
date: 2026-09-25
tags: [mdx, nextjs]
---
```

`content/lib-or-util.mdx` にも同じように足す。

```mdx
---
title: libとutilの使い分けルール
date: 2026-11-02
tags: [nextjs]
---
```

ビルドする。

```bash
bun run build
```

エラーが出ずに、表に今までどおり `○ /posts/hello` と `○ /posts/lib-or-util` が出る。

**`[mdx, nextjs]` の書き方** — YAML で配列を1行に書く形で、`["mdx", "nextjs"]` と同じ意味になる。英数字だけの値なら `"` で囲まなくてよい。1行に1つずつ `- mdx` と書く形もあり、読み込んだ結果は同じになる。

---

### 手順 4：タグを集める関数を足す

`lib/createPostReader.ts` の `getAllPosts` の下に、2つの関数を足す。最後の `return` にも2つの名前を足す。

```ts
async function getAllTags() {
  const posts = await getAllPosts();
  const tags = posts.flatMap((post) => post.frontmatter.tags);
  return [...new Set(tags)].toSorted();
}

async function getPostsByTag(tag: string) {
  const posts = await getAllPosts();
  return posts.filter((post) => post.frontmatter.tags.includes(tag));
}

return { getPost, getAllSlugs, getAllPosts, getAllTags, getPostsByTag };
```

```bash
bunx tsc --noEmit
```

何も出さずに終わる。

**`getAllTags` の3行** — 記事ごとのタグの配列 `[mdx, nextjs]` と `[nextjs]` を、`flatMap` で1本の `[nextjs, mdx, nextjs]` につなぐ（`getAllPosts` が新しい順に返すので `lib-or-util` が先）。`new Set(...)` は重複を許さない入れ物で、入れると `nextjs` が1つにまとまる。最後に `[...]` で配列に戻し、`toSorted()` でアルファベット順に並べる。

**`post.frontmatter.tags` が型エラーにならない理由** — 1-4 で、型は schema から作られるようにした。schema に `tags` を足した時点で、`frontmatter.tags` は `string[]` として扱えるようになっている。型を書き足す作業はない。

---

### 手順 5：`/tags` を作る

`app/tags/page.tsx` を新しく作り、次の全文を書く。

```tsx
import path from "node:path";
import Link from "next/link";
import { createPostReader } from "../../lib/createPostReader";

const { getAllTags } = createPostReader(path.join(process.cwd(), "content"));

export default async function Page() {
  "use cache";

  const tags = await getAllTags();

  return (
    <main>
      <h1>タグ一覧</h1>
      <ul>
        {tags.map((tag) => (
          <li key={tag}>
            <Link href={`/tags/${tag}`}>{tag}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

```bash
bun run build
grep -o '<main>.*</main>' .next/server/app/tags.html
```

```
<main><h1>タグ一覧</h1><ul><li><a href="/tags/mdx">mdx</a></li><li><a href="/tags/nextjs">nextjs</a></li></ul></main>
```

**なぜ** — 1-2 の `app/posts/page.tsx` と同じ形にしている。違うのは、呼ぶ関数が `getAllPosts` から `getAllTags` に変わったことと、リンク先だけになる。リンク先の `/tags/mdx` は次の手順で作る。

---

### 手順 6：`/tags/[tag]` を作る（この回の本題）

`app/tags/[tag]/page.tsx` を新しく作り、次の全文を書く。フォルダ名の `[tag]` は角かっこまで含めて1つの名前になる。

```bash
mkdir -p "app/tags/[tag]"
```

```tsx
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPostReader } from "../../../lib/createPostReader";

const { getAllTags, getPostsByTag } = createPostReader(path.join(process.cwd(), "content"));

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag }));
}

export default async function Page({ params }: PageProps<"/tags/[tag]">) {
  "use cache";

  const { tag } = await params;
  const posts = await getPostsByTag(tag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <main>
      <h1>タグ: {tag}</h1>
      <ul>
        {posts.map(({ slug, frontmatter }) => (
          <li key={slug}>
            <time dateTime={frontmatter.date}>{frontmatter.date}</time>
            <Link href={`/posts/${slug}`}>{frontmatter.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

ビルドして、表と HTML を見る。

```bash
bun run build
grep -o '<main>.*</main>' .next/server/app/tags/nextjs.html
grep -o '<main>.*</main>' .next/server/app/tags/mdx.html
```

表の終わりに、次の行が増えている。

```
├ ○ /tags                        15m      1y
└   /tags/[tag]
  ├ ◐ /tags/[tag]
  ├ ○ /tags/mdx                  15m      1y
  └ ○ /tags/nextjs               15m      1y
```

```
<main><h1>タグ: <!-- -->nextjs</h1><ul><li><time dateTime="2026-11-02">2026-11-02</time><a href="/posts/lib-or-util">libとutilの使い分けルール</a></li><li><time dateTime="2026-09-25">2026-09-25</time><a href="/posts/hello">はじめての記事</a></li></ul></main>
<main><h1>タグ: <!-- -->mdx</h1><ul><li><time dateTime="2026-09-25">2026-09-25</time><a href="/posts/hello">はじめての記事</a></li></ul></main>
```

`nextjs` のページには2本、`mdx` のページには1本の記事が並んだ。

**ページの数は誰が決めたか** — `app/tags/` の下に `mdx` や `nextjs` という名前のファイルは1つもない。ビルドのとき Next.js が `generateStaticParams` を呼び、返ってきた `[{ tag: "mdx" }, { tag: "nextjs" }]` の数だけ `Page` を動かして HTML を作った。準備で書いた索引のたとえどおり、ページの数は原稿に書かれたタグの数で決まる。

**`/posts/[slug]` と並べて見る** — 1-1 で作った `app/posts/[slug]/page.tsx` もまったく同じ形をしている。

|                      | `/posts/[slug]`             | `/tags/[tag]`                  |
| -------------------- | --------------------------- | ------------------------------ |
| ページの元になる一覧 | `getAllSlugs`（ファイル名） | `getAllTags`（原稿の中のタグ） |
| 1ページ分の中身      | `getPost(slug)`             | `getPostsByTag(tag)`           |
| 見つからないとき     | `null` → `notFound()`       | 0本 → `notFound()`             |

違うのは、一覧の出どころだけになる。`/posts/[slug]` はファイル名から、`/tags/[tag]` は原稿の**中身**から一覧を作っている。この形を覚えておくと、年ごとのアーカイブ（`/posts/2026`）や Lab のページも、同じ3点を決めれば作れる。

**`<!-- -->` は何か** — `タグ: ` という文字と `{tag}` の値の境目に React が入れる印で、画面には出ない。

**存在しないタグの URL（任意、未確認）** — ビルドの表の `◐ /tags/[tag]` は、ビルドで作らなかったタグの URL が来たら、サーバーでその場で作るという意味になる。`/tags/unknown` を開くと `getPostsByTag` が0本を返し、`notFound()` で 404 になる想定だが、まだ確かめていない。確かめるなら、次のコマンドでサーバーを動かし、ブラウザで `http://localhost:3000/tags/unknown` を開く。止めるときは `Ctrl+C` を押す。

```bash
bun run start
```

---

### 手順 7：記事ページにタグへのリンクを出す

`app/posts/[slug]/page.tsx` を2か所書き換える。

1つ目。`import` に `Link` を足す。

```tsx
import path from "node:path";
import Link from "next/link";
import { createPostReader } from "../../../lib/createPostReader";
import { notFound } from "next/navigation";
```

2つ目。`<time>` の行の下にタグの一覧を足す。

```tsx
      <time>{frontmatter.date}</time>
      <ul>
        {frontmatter.tags.map((tag) => (
          <li key={tag}>
            <Link href={`/tags/${tag}`}>{tag}</Link>
          </li>
        ))}
      </ul>
      <Content />
```

```bash
bun run build
grep -o '<article>.\{0,200\}' .next/server/app/posts/hello.html
```

```
<article><h1>はじめての記事</h1><time>2026-09-25</time><ul><li><a href="/tags/mdx">mdx</a></li><li><a href="/tags/nextjs">nextjs</a></li></ul><h2>こんにちは</h2>
```

**なぜ** — これで記事 → タグ → 同じタグの別の記事、と行き来できるようになる。タグのページへの入口が `/tags` だけだと、読者は記事を読み終えたあとに次の記事を探しにくい。

---

### 手順 8：書き方の崩れたタグで、ビルドが止まるのを見る

`content/lib-or-util.mdx` の `tags` の行を、次の4通りに1つずつ書き換えてビルドする。

```bash
bun run build
```

| `tags` の行                | エラー文（`× ` の行）                                                |
| -------------------------- | -------------------------------------------------------------------- |
| `tags: [Next.js]`          | `Invalid format: Expected /^[a-z0-9]{1,18}$/ but received "Next.js"` |
| `tags: nextjs`             | `Invalid type: Expected Array but received "nextjs"`                 |
| `tags: [a, b, c, d, e, f]` | `Invalid length: Expected <=5 but received 6`                        |
| `tags: []`                 | `Invalid length: Expected >=1 but received 0`                        |

`[Next.js]` のときは、その下に `→ at tags.0` と出る。「`tags` の0番目（1つ目）が違う」という意味になる。

**いちばん起きやすいのは2つ目** — `[ ]` を付け忘れると、YAML は配列ではなく1つの文字列として読む。見た目はほとんど同じなので、検査がなければ気づきにくい。

検査がなかった場合を考えてみる。`tags: nextjs` の記事では、`getPostsByTag` の `includes` が配列の `includes` ではなく文字列の `includes` になり、「`nextjs` という文字が含まれるか」を調べる。`nextjs` のページでは偶然正しく見えるが、`js` というタグを別の記事に付けると、この記事も `/tags/js` に並んでしまう。`tags: mdx nextjs` と書けば、空白を含む `mdx nextjs` という1つのタグになり、URL に空白の入ったページができる。どれもエラーにならない。

確かめたら `tags: [nextjs]` に戻し、ビルドが通ることを確かめる。

```bash
bun run build
```

---

### 手順 9：コミットする

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
git status
git add lib/createPostReader.ts content/hello.mdx content/lib-or-util.mdx app/tags app/posts
git commit -m "feat: 原稿にタグを付け、/tags と /tags/[tag] を作る

技術ごとに記事をたどれる入口が欲しいため。タグは Zenn の topics に
そのまま写せるよう、小文字の英数字で1〜5個に限り、schema で検査する。
タグのページは原稿のタグから generateStaticParams で作る。"
```

---

### うまくいかないとき

上の4行は実際に出たもの。下の2行は起きると予想されるもので、文面は確かめていない。

| 症状                                                             | 原因と対処                                                                                         |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `× Invalid key: Expected "tags" but received undefined`          | その原稿に `tags` がない。手順 3 のとおり frontmatter に足す                                       |
| `× Invalid format: Expected /^[a-z0-9]{1,18}$/ but received ...` | タグに大文字・記号・空白・日本語が入っているか、19字以上ある。`Next.js` なら `nextjs` のように書く |
| `× Invalid type: Expected Array but received ...`                | `[ ]` を付け忘れている。`tags: [nextjs]` と書く                                                    |
| `× Invalid length: Expected <=5 but received ...`                | タグが6つ以上ある。5つまでに減らす                                                                 |
| `Cannot find name 'PageProps'`（未確認）                         | `/tags/[tag]` の型がまだ作られていない。`bun run typecheck` を一度動かすと `next typegen` が作る   |
| `generateStaticParams` が空でビルドが止まる（未確認）            | 原稿が1本もないか、タグを持つ原稿がない。Cache Components ではタグが1つ以上必要（周辺知識）        |

ここに載っていないエラーが出たら、そのまま貼って聞いてほしい。

---

## 受け入れ条件

- [x] `bun run build` が通り、表に `○ /tags`、`○ /tags/mdx`、`○ /tags/nextjs` が出る
- [x] `.next/server/app/tags/nextjs.html` に、`libとutilの使い分けルール` と `はじめての記事` の2本がこの順で並んでいる
- [x] `.next/server/app/posts/hello.html` に、`/tags/mdx` と `/tags/nextjs` へのリンクがある
- [x] `content/` の2本の原稿の frontmatter に `tags` がある
- [ ] `tags: nextjs`（`[ ]` なし）にするとビルドが `Invalid type` で止まることを自分で確かめた（未チェックのままコミット。本人の了承あり、2026-11-03）
- [x] `bunx tsc --noEmit` がエラーなしで終わる
- [x] `bun run lint` で `app/tags/` の2つのファイルが markuplint を通る

## この回で理解したこと

着手後に埋める。動いたか（受け入れ条件）とは別に、何が分かったかを残す。

- [ ] `/tags/[tag]` のページの数が何で決まるかを、`generateStaticParams` を使って説明できる（未チェックのままコミット。本人の了承あり、2026-11-03）
- [ ] `/posts/[slug]` と `/tags/[tag]` が同じ形で、違うのは一覧の出どころだけだと言える（未チェックのままコミット。本人の了承あり、2026-11-03）
- [ ] schema を先に変えると、直し忘れた原稿をビルドが見つけてくれる理由を説明できる（未チェックのままコミット。本人の了承あり、2026-11-03）
- [ ] `[ ]` を付け忘れたタグが、検査がなければどんなおかしなページを作ったかを説明できる（未チェックのままコミット。本人の了承あり、2026-11-03）

## 参考

- Zenn の topics の検証: https://github.com/zenn-dev/zenn-editor/blob/main/packages/zenn-model/src/utils.ts
- Zenn CLI の使い方: https://zenn.dev/zenn/articles/zenn-cli-guide
- `generateStaticParams`: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md`
- Valibot `regex`: https://valibot.dev/api/regex/
- Valibot `array`: https://valibot.dev/api/array/
- 設計書: `docs/design/20260925-blog-design-proposal.md`（`/tags/[tag]` と `/about` の技術一覧）
- 前の回: `tickets/1-4-validate-frontmatter.md`
