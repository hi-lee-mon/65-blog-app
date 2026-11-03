# 1-1: MDX で書いた記事を1本、`/posts/hello` に表示する

- 起票日: 2026-09-25
- 学習計画: まだない（設計の全体像は `docs/design/20260925-blog-design-proposal.md`）
- ステータス: 完了（2026-11-03）

## 全体のどこか

「記事を表示する」までを5段に分けた、その1段目。

| Step | 内容                                                                                                                             | 進捗           |
| ---- | -------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 1-1  | 記事1本を `/posts/[slug]` に表示する                                                                                             | ■□□ ← いまここ |
| 1-2  | `/posts` に記事の一覧を出す                                                                                                      | □□□            |
| 1-3  | Shiki でコードブロックに色を付ける                                                                                               | □□□            |
| 1-4  | Valibot で frontmatter の中身を検査し、`lib/createPostReader.ts` の `file.data.matter as MyFrontmatter` のような `as` を取り除く | □□□            |

1-2 以降は、このチケットが終わってから起票する。

## 作るもの

| パス（リポジトリ直下から）           | 中身                                         |
| ------------------------------------ | -------------------------------------------- |
| `content/hello.mdx`                  | 記事の原稿1本                                |
| `blog-app/lib/posts.ts`              | 原稿を読み込む処理。Next.js の機能は使わない |
| `blog-app/app/posts/[slug]/page.tsx` | 記事ページ                                   |

依存パッケージを3つ足す（`@mdx-js/mdx`、`vfile`、`vfile-matter`）。

今回は扱わないもの: 見た目（CSS）、記事一覧、コードの色付け、存在しない記事を開いたときの 404 ページ、frontmatter の中身の検査。

## なぜこれをやるか

ブログの中心は「原稿ファイル → 画面」の流れで、一覧も色付けも Zenn・Qiita への変換も、この流れの上に乗る。ここで流れを一本通しておくと、あとは部品を足すだけになる。

逆に、一覧や見た目から作り始めると、原稿の読み込み方が決まらないまま仮のデータで作ることになり、あとで作り直しが出る。

## 周辺知識

ここは事実の早見表。**かみ砕いた説明はハンズオンのほうに書いたので、初めて読むならそちらから読んでよい。**

### 現時点のバージョン（2026-09-25 に `npm view` で確認）

| パッケージ                                   | バージョン               | 役割                                                        |
| -------------------------------------------- | ------------------------ | ----------------------------------------------------------- |
| `@mdx-js/mdx`                                | 3.1.1                    | MDX を React コンポーネントに変える                         |
| `vfile`                                      | 6.0.3                    | 「中身＋メタ情報」をまとめて持つファイルの入れ物            |
| `vfile-matter`                               | 5.0.1                    | 原稿先頭の frontmatter を読んで `file.data.matter` に入れる |
| `yaml`                                       | 2.9.1                    | `vfile-matter` が内部で使う。直接は入れない                 |
| `unified` / `remark-parse` / `remark-rehype` | 11.0.5 / 11.0.0 / 11.1.2 | `@mdx-js/mdx` が内部で使う。直接は入れない                  |

ADR `20260925-1914-unified-content-pipeline.md` には `yaml`・`unified`・`remark-parse`・`remark-rehype` も並んでいるが、どれも上の3つの依存として自動で入る。直接 import するのは、Zenn・Qiita 用の変換を書くときになる見込み。

### Cache Components のもとでファイルを読むとき（出典: `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`）

- コンポーネントの中で `await readFile()` すると、Next.js は「キャッシュされていないデータ」とみなす
- そのままだと、ビルド時の事前生成（prerender）でエラーになる。`"use cache"` を付けるか `<Suspense>` で囲む必要がある
- `fs.readFileSync`（同期読み込み）なら、事前生成の中で完了するものとして扱われる

### 動的ルートと `generateStaticParams`（出典: `03-api-reference/04-functions/generate-static-params.md`）

- `generateStaticParams` が返した `slug` のページは、ビルド時に HTML まで作られる
- Cache Components を有効にしていると、空配列を返すとビルドエラーになる。最低1件は返す

### 実測したこと

2026-09-25、macOS / Node v24.19.0 / bun 1.4.2 / Next.js 16.3.6 で、このリポジトリを一時ディレクトリに複製して確かめた。

- ハンズオンの手順 4-a・4-b・完成形は、どれも `bun run build` が通る
- 完成形のビルドで作られた HTML に `<h1>はじめての記事</h1><time>2026-09-25</time><h2>こんにちは</h2>` が入っている
- frontmatter の `date: 2026-09-25` は日付型ではなく文字列 `"2026-09-25"` として読まれる
- 手順 6 と手順 4-b のエラー文は、実際に出たもの

**未確認**: `bun dev` で画面を開いたときの見え方（確認はビルドの出力でしか行っていない）。存在しない slug（例: `/posts/nope`）を開いたときの挙動。

## 作業手順（全体の地図）

詳しい手順とコマンドはすべて下の「ハンズオン」にある。

1. 作業用のブランチを切る
2. 依存パッケージを3つ入れる
3. 記事の原稿を1本書く
4. 読み込み処理と記事ページを、4段階に分けて組み上げる（**この回の本題**）
5. ビルドして、HTML が事前に作られたことを確かめる
6. `"use cache"` を外して、わざとビルドを失敗させる
7. コミットする

## 確認事項

着手前に決めたいこと。推奨案は書いたが、決めるのは本人。

- [ ] **読み込み処理をどこに置くか。** 推奨は「`blog-app/lib/posts.ts`」。理由は、Next.js の `@/` の別名でそのまま import でき、設定を足さずに済むから。ただし `blog-app/` の中にある以上、ほかのフレームワークへ移るときにファイルを動かす手間は残る。リポジトリ直下に `packages/content/` を作って切り離す案もあるが、ワークスペースの設定が要るので今は重い
- [ ] **`"use cache"` と `readFileSync` のどちらで Cache Components の制約を満たすか。** 推奨は「ページ側に `"use cache"` を書く」。理由は、`lib/posts.ts` に Next.js 固有の書き方を持ち込まずに済むことと、Cache Components を試すというこのリポジトリの目的に合うこと。ただし `"use cache"` の仕組み（キャッシュの寿命など）を理解する負担が増える。`readFileSync` にすれば Next.js の知識なしで通るが、`@mdx-js/mdx` の `evaluate` は非同期のままなので、別の形で同じ問題に当たるかもしれない（未確認）
- [ ] **frontmatter の型を `as` で決めつけてよいか。** 推奨は「今回は `as Frontmatter` で済ませる」。理由は、検査の仕組みを入れると今回の本題（原稿 → 画面の流れ）がぼやけるから。ただし原稿に `title` を書き忘れても型チェックでは気づけず、画面の見出しが空になるだけで終わる。ADR にある Velite や Zod による検査を再検討するきっかけにしてよい
- [ ] **作業ブランチをどこから切るか。** 推奨は「今の `docs/blog-design` から切る」。理由は、設計メモと ADR がまだ `main` に入っておらず、`main` から切るとそれらが手元から消えるから。ただしプルリクエストの差分に設計メモのコミットも混ざる。先に `docs/blog-design` を `main` へマージしておけば避けられる
- [ ] **【標準ルールからの逸脱】このチケットでは TDD を適用しない。** 共通ルールは「実装は基本的に TDD」だが、テストランナーがまだ入っていない。Vitest の導入を先にやると、記事が表示されるまでが遠くなるので後回しにする（起票前に本人と合意済み）。1-2 に進む前に、`lib/posts.ts` のテストを書く回を挟むかどうかを決めたい

## ハンズオン

**このセクションを上から順に実行すれば、このチケットは完了する。** コマンドとファイルの中身はすべて書いてあるので、読んで、貼って、動かすだけでよい。各手順の後ろに「なぜそうするのか」を付けた。

---

### 準備：この回で何をするのか

`content/hello.mdx` という原稿ファイルを、`http://localhost:3000/posts/hello` で読める記事ページにする。そのあいだに原稿は「ただの文字列 → タイトルと本文に分かれたもの → React コンポーネント」と3回姿を変える。この変身を1回ずつ画面で見るのが、この回の中身になる。

#### MDX と frontmatter

**MDX** は、Markdown の中に React コンポーネントや JavaScript の式を書ける形式。普通の Markdown が「印刷された紙」だとすると、MDX は「紙のところどころに動く部品を埋め込める」紙になる。記事の中に動くデモを置けるのはこのおかげ。

**frontmatter** は、原稿の先頭で `---` に挟んで書くメタ情報。本の奥付のようなもので、タイトルや日付を本文と分けて書いておく場所。中身は YAML という「`キー: 値`」を並べる書式で書く。

#### 用意するもの

- `bun` が使えること（`bun -v` で `1.4.2` などと出れば OK）
- ターミナルを2つ（片方で開発サーバー、片方でコマンド）

---

### 手順 1：作業用のブランチを切る

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
git switch docs/blog-design
git switch -c feat/1-1-show-first-post
```

**なぜ** — 作業の途中で壊れても、ブランチごと捨てればやり直せる。ブランチ名にチケット番号を入れておくと、`git branch` を見ただけでどのチケットの作業か分かる（切る元の選び方は確認事項を参照）。

---

### 手順 2：依存パッケージを3つ入れる

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app/blog-app
bun add @mdx-js/mdx vfile vfile-matter
```

最後のほうに次のような行が出る。

```
installed @mdx-js/mdx@3.1.1
installed vfile@6.0.3
installed vfile-matter@5.0.1
```

**なぜ** — Next.js アプリは `blog-app/` にあるので、`package.json` もそこにある。リポジトリ直下で `bun add` すると、別の `package.json` が新しく作られてしまう。

---

### 手順 3：記事の原稿を1本書く

リポジトリ直下に `content/` を作り、`content/hello.mdx` を置く。`blog-app/` の中ではないので注意。

```bash
mkdir -p ~/ghq/github.com/hi-lee-mon/65-blog-app/content
```

`content/hello.mdx` の中身:

```mdx
---
title: はじめての記事
date: 2026-09-25
---

## こんにちは

これは **MDX** で書いた最初の記事です。

export const year = 2026;

今年は {year} 年です。
```

**なぜ** — 原稿は Zenn・Qiita 用にも変換するので、アプリの外に置く（ADR `20260925-1907-content-in-same-repo.md`）。最後の2行は MDX でしか書けない部分で、手順 4-c で「MDX が JavaScript を実行した」ことを確かめるために入れている。

---

### 手順 4：原稿を画面に出すまでを、4段階で組み上げる（この回の本題）

ここがこの回の中心になる。一度に完成形を書かず、原稿が姿を変えるたびに画面で確かめる。

先に開発サーバーを起動しておく（ターミナル1）。

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app/blog-app
bun dev
```

以降、ファイルを保存するたびに `http://localhost:3000/posts/hello` を再読み込みする。

#### 4-a：原稿を、ただの文字列として画面に出す

`blog-app/lib/posts.ts` を作る。

```ts
import { readFile } from "node:fs/promises";
import path from "node:path";

const CONTENT_DIR = path.join(process.cwd(), "..", "content");

export async function getPost(slug: string) {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  return readFile(filePath, "utf8");
}
```

`blog-app/app/posts/[slug]/page.tsx` を作る。フォルダ名の `[slug]` は角かっこまで含めて、この名前にする。

```tsx
import { getPost } from "@/lib/posts";

export function generateStaticParams() {
  return [{ slug: "hello" }];
}

export default async function Page({ params }: PageProps<"/posts/[slug]">) {
  "use cache";
  const { slug } = await params;
  const raw = await getPost(slug);
  return <pre>{raw}</pre>;
}
```

ブラウザには、原稿がそのまま出る。先頭の `---` や `title:` の行も、`**MDX**` のアスタリスクも見える。

**`[slug]` とは** — フォルダ名を角かっこで囲むと、そこは「空欄」になる。`/posts/hello` を開けば空欄に `hello` が入り、`params.slug` で受け取れる。記事が100本あってもページのファイルは1つで済む。

**`process.cwd()` と `".."`** — `process.cwd()` は「今どのフォルダでコマンドを実行しているか」。`bun dev` は `blog-app/` で実行するので、そこから1つ上（`..`）に上がった `content/` を指している。

**`generateStaticParams` と `"use cache"`** — どちらも「ビルドのときに、このページを先に作っておいてよい」と Next.js に伝える印。詳しくは手順 6 で、わざと外して確かめる。

#### 4-b：frontmatter と本文を切り分ける

`blog-app/lib/posts.ts` を次の全文に置き換える。

```ts
import { readFile } from "node:fs/promises";
import path from "node:path";
import { VFile } from "vfile";
import { matter } from "vfile-matter";

const CONTENT_DIR = path.join(process.cwd(), "..", "content");

type Frontmatter = {
  title: string;
  date: string;
};

export async function getPost(slug: string) {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  const file = new VFile({ path: filePath, value: await readFile(filePath, "utf8") });
  matter(file, { strip: true });
  const frontmatter = file.data.matter as Frontmatter;
  return { frontmatter, body: String(file) };
}
```

`blog-app/app/posts/[slug]/page.tsx` も置き換える。

```tsx
import { getPost } from "@/lib/posts";

export function generateStaticParams() {
  return [{ slug: "hello" }];
}

export default async function Page({ params }: PageProps<"/posts/[slug]">) {
  "use cache";
  const { slug } = await params;
  const { frontmatter, body } = await getPost(slug);
  return (
    <article>
      <h1>{frontmatter.title}</h1>
      <time>{frontmatter.date}</time>
      <pre>{body}</pre>
    </article>
  );
}
```

画面の一番上に「はじめての記事」と日付が出て、`<pre>` の中から `---` のブロックが消える。本文の Markdown はまだ記号のまま。

**VFile とは** — 中身の文字列に加えて、「どこから来たか（`path`）」や「途中で分かったこと（`data`）」を貼り付けておける封筒。unified の仲間のツールはみな、この封筒を受け渡しして作業する。`matter()` は封筒を開けて先頭の奥付を読み、`file.data.matter` に書き写す。`strip: true` は「読んだ奥付は本文から切り取っておいて」という指定。

**なぜ `as Frontmatter` が要るのか** — 試しに `as Frontmatter` を消して、ターミナル2で型チェックを走らせてみる。

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app/blog-app
bunx tsc --noEmit
```

次のエラーが出る。

```
app/posts/[slug]/page.tsx(13,12): error TS18046: 'frontmatter' is of type 'unknown'.
app/posts/[slug]/page.tsx(14,14): error TS18046: 'frontmatter' is of type 'unknown'.
```

`vfile-matter` は、原稿に何が書いてあるかを知らない。だから中身の型を `unknown`（「開けるまで何が入っているか分からない箱」）にしている。`as Frontmatter` は「この箱には `title` と `date` が入っている」と人間が保証する書き方で、TypeScript はそれを信じるだけで中身は確かめない。確かめたら `as Frontmatter` を元に戻しておく。

#### 4-c：本文を MDX として実行し、React コンポーネントにする

`blog-app/lib/posts.ts` を置き換える。

```ts
import { readFile } from "node:fs/promises";
import path from "node:path";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { VFile } from "vfile";
import { matter } from "vfile-matter";

const CONTENT_DIR = path.join(process.cwd(), "..", "content");

type Frontmatter = {
  title: string;
  date: string;
};

export async function getPost(slug: string) {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  const file = new VFile({ path: filePath, value: await readFile(filePath, "utf8") });
  matter(file, { strip: true });
  const frontmatter = file.data.matter as Frontmatter;
  const { default: Content } = await evaluate(file, runtime);
  return { frontmatter, Content };
}
```

`blog-app/app/posts/[slug]/page.tsx` を置き換える。

```tsx
import { getPost } from "@/lib/posts";

export function generateStaticParams() {
  return [{ slug: "hello" }];
}

export default async function Page({ params }: PageProps<"/posts/[slug]">) {
  "use cache";
  const { slug } = await params;
  const { frontmatter, Content } = await getPost(slug);
  return (
    <article>
      <h1>{frontmatter.title}</h1>
      <time>{frontmatter.date}</time>
      <Content />
    </article>
  );
}
```

`## こんにちは` が見出しになり、`**MDX**` が太字になる。最後の行は「今年は 2026 年です。」と出る。`{year}` が変数として計算された証拠で、ここが普通の Markdown との違いになる。

**`evaluate` が中でしていること** — 原稿を、次の順に作り替えている。

```
MDX の文字列
   │ remark-parse       ：文章を「見出し」「段落」「太字」の部品に分解する（mdast）
   ▼
Markdown の構文木
   │ remark-rehype      ：部品を HTML の部品に置き換える（hast）
   ▼
HTML の構文木
   │ rehype-recma など   ：HTML の部品を、React の関数呼び出しに書き換える
   ▼
JavaScript のコード → その場で実行 → React コンポーネント（Content）
```

この図から分かることは2つある。

- 「構文木」は、文章を部品の木にしたもの。木の段階なら「`:::message` を Zenn 用に書き換える」といった加工が文字列置換より安全にできる。ADR で unified を選んだ理由がここにある
- `evaluate` の最後は「その場で実行」なので、原稿は信頼できる人（自分）しか書かない前提になる。他人が書いた MDX を `evaluate` してはいけない

**`runtime` を渡す理由** — MDX が作るコードは「見出しを作るときは `jsx()` を呼ぶ」とだけ書いてあり、その `jsx()` をどこから持ってくるかは決めていない。`react/jsx-runtime` を渡すと React の部品になり、Preact の同名モジュールを渡せば Preact の部品になる。Next.js 以外へ移れる余地は、この1行が残している。

#### 4-d：記事の一覧をファイルから作る

今は `generateStaticParams` に `"hello"` を手で書いている。記事を足すたびにここを直すのは面倒なので、`content/` の中身から作る。

`blog-app/lib/posts.ts` の完成形:

```ts
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { VFile } from "vfile";
import { matter } from "vfile-matter";

const CONTENT_DIR = path.join(process.cwd(), "..", "content");

type Frontmatter = {
  title: string;
  date: string;
};

export async function getPostSlugs() {
  const files = await readdir(CONTENT_DIR);
  return files.filter((file) => file.endsWith(".mdx")).map((file) => file.replace(/\.mdx$/, ""));
}

export async function getPost(slug: string) {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  const file = new VFile({ path: filePath, value: await readFile(filePath, "utf8") });
  matter(file, { strip: true });
  const frontmatter = file.data.matter as Frontmatter;
  const { default: Content } = await evaluate(file, runtime);
  return { frontmatter, Content };
}
```

`blog-app/app/posts/[slug]/page.tsx` の完成形:

```tsx
import { getPost, getPostSlugs } from "@/lib/posts";

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function Page({ params }: PageProps<"/posts/[slug]">) {
  "use cache";
  const { slug } = await params;
  const { frontmatter, Content } = await getPost(slug);
  return (
    <article>
      <h1>{frontmatter.title}</h1>
      <time>{frontmatter.date}</time>
      <Content />
    </article>
  );
}
```

画面は 4-c と変わらない。変わるのは手順 5 のビルド結果で、`content/` に `.mdx` を足すと、ビルドで作られるページも自動で増える。

**`lib/posts.ts` に `next` の import が1つもないこと** — 完成形を見返すと、`lib/posts.ts` が読み込んでいるのは Node.js 標準の `fs`・`path` と、MDX・vfile・React だけになっている。Next.js 固有の書き方（`generateStaticParams`、`"use cache"`、`PageProps`）はすべて `page.tsx` 側に寄せた。フレームワークを移るときに書き直すのは `page.tsx` だけで済む。

---

### 手順 5：ビルドして、HTML が先に作られたことを確かめる

ターミナル1の `bun dev` を `Ctrl + C` で止めてから実行する。

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app/blog-app
bun run build
```

最後に次の表が出る。

```
Route (app)
┌ ○ /
├ ○ /_not-found
└   /posts/[slug]
  ├ ◐ /posts/[slug]
  └ ○ /posts/hello
```

`/posts/hello` の前の `○` は「ビルドの時点で HTML まで作り終えた」印。作られた HTML も覗いてみる。

```bash
grep -o '<article>.\{0,80\}' .next/server/app/posts/hello.html
```

```
<article><h1>はじめての記事</h1><time>2026-09-25</time><h2>こんにちは</h2>
```

**なぜ確かめるのか** — 記事は読まれるたびに変わるものではないので、ビルドで一度作っておけば、アクセスのたびに MDX を実行し直さずに済む。`◐ /posts/[slug]` の行は、`generateStaticParams` が返さなかった slug のための受け皿を表している。

---

### 手順 6：`"use cache"` を外して、わざとビルドを失敗させる

`page.tsx` から `"use cache";` の1行を消して、もう一度ビルドする。

```bash
bun run build
```

次のエラーで止まる。

```
Error: Route "/posts/[slug]": Next.js encountered uncached or runtime data during prerendering.

`fetch(...)`, `cookies()`, `headers()`, `params`, `searchParams`, or `connection()` accessed outside of `<Suspense>` prevents the route from being prerendered, blocking the page load and leading to a slower user experience.

Ways to fix this:
  - [stream] Provide a placeholder with `<Suspense fallback={...}>` around the data access
  - [cache] For uncached data (`fetch`, database calls): cache the access with `"use cache"` (does not apply to `connection()`)
  - [block] Set `export const instant = false` to allow a blocking route
```

このリポジトリは `next.config.ts` で `cacheComponents: true` にしている。この設定のもとで Next.js は、ページを作るときに待たされる処理を見つけると「これは毎回結果が変わるかもしれない」と疑う。`readFile` はファイルを読み終わるまで待つ処理なので、疑われる側に入る。

`"use cache"` は、その疑いに「この関数の結果は、同じ入力なら毎回同じ。取っておいて使い回してよい」と答える印。答えがないと、Next.js はページを事前に作ってよいか判断できずに止まる。エラー文にある残り2つの直し方（`<Suspense>` で囲む、`instant = false`）は「毎回作り直す」側の選択肢で、記事には合わない。

確かめたら `"use cache";` を元に戻し、`bun run build` が通ることを確認する。

---

### 手順 7：コミットする

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
git status
git add content/hello.mdx blog-app/lib/posts.ts "blog-app/app/posts/[slug]/page.tsx" blog-app/package.json blog-app/bun.lock
git commit -m "feat: MDX の原稿を1本、記事ページとして表示する

原稿から画面までの流れを先に通しておき、一覧や色付けをこの上に足していけるようにするため。
読み込み処理は lib/posts.ts に置き、Next.js 固有の書き方は page.tsx に寄せた。"
```

`git add` でファイルを名前で指定しているのは、`.next/` などの生成物を誤って含めないため。

---

### うまくいかないとき

上の3行は実際に出たエラー。下の3行は起きると予想されるもので、文面は確かめていない。

| 症状                                                                              | 原因と対処                                                                                                                                          |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `'frontmatter' is of type 'unknown'`                                              | `as Frontmatter` が抜けている（手順 4-b）                                                                                                           |
| `Next.js encountered uncached or runtime data during prerendering`                | `page.tsx` の `"use cache";` が抜けている（手順 6）                                                                                                 |
| `bunx tsc --noEmit` で `Cannot find name 'PageProps'`                             | `PageProps` の型は `bun dev` か `bun run build` を一度動かすと作られる。先にどちらかを実行する                                                      |
| `ENOENT: no such file or directory` と `content/hello.mdx` のパスが出る（未確認） | 原稿の場所が違う。`content/` は `blog-app/` の中ではなく、リポジトリ直下に置く。`bun dev` を `blog-app/` 以外の場所で実行した場合も同じことが起きる |
| `Cannot find module '@mdx-js/mdx'` のようなエラー（未確認）                       | 手順 2 を `blog-app/` 以外で実行した。`blog-app/` で `bun add` し直す                                                                               |
| 見出しが空で、日付だけ出る（未確認）                                              | 原稿の frontmatter に `title:` がない。型チェックでは気づけない（確認事項の3つ目）                                                                  |

ここに載っていないエラーが出たら、そのまま貼って聞いてほしい。

---

## 受け入れ条件

- [x] `bun dev` で `http://localhost:3000/posts/hello` を開くと、「はじめての記事」が見出しとして、「こんにちは」が小見出しとして表示される（2026-11-03、`bun run build` が出力した HTML で確認。`bun dev` の画面では未確認）
- [x] 同じページに「今年は 2026 年です。」と表示される（`{year}` のままではない）（同上）
- [x] `bun run build` が通り、表に `○ /posts/hello` が出る
- [x] `content/` に2本目の `.mdx` を足して `bun run build` すると、表にそのページが増える（確かめたら消してよい）（`content/lib-or-util.mdx` で確認）
- [x] `blog-app/lib/posts.ts` に `next` から import している行がない（読み込み処理は `lib/createPostReader.ts` に置いた。そこで確認）
- [ ] `"use cache";` を消すとビルドが失敗し、戻すと通ることを自分で確かめた（未確認のまま、本人の了承を得て完了にした）

## この回で理解したこと

着手後に埋める。動いたか（受け入れ条件）とは別に、何が分かったかを残す。

2026-11-03 時点では未記入のまま、本人の了承を得て完了にした。

- [ ] 原稿が「文字列 → frontmatter と本文 → React コンポーネント」と変わる3段階を、どの関数が担っているかを言える
- [ ] `vfile-matter` の結果が `unknown` になる理由と、`as` が何を保証しないかを説明できる
- [ ] `"use cache"` を外すとビルドが止まる理由を、`cacheComponents` の設定と結びつけて説明できる
- [ ] Next.js 以外へ移るとき、どのファイルを書き直せばよいかを言える

## 参考

- MDX の `evaluate`: https://mdxjs.com/packages/mdx/#evaluatefile-options
- vfile-matter: https://github.com/vfile/vfile-matter
- Next.js 同梱ドキュメント: `blog-app/node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`、`03-api-reference/04-functions/generate-static-params.md`
- ADR: `docs/adr/20260925-1914-unified-content-pipeline.md`、`docs/adr/20260925-1907-content-in-same-repo.md`
