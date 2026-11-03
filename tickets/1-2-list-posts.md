# 1-2: `/posts` に記事を新しい順に並べ、壊れた原稿が黙って紛れ込むのを見る

- 起票日: 2026-11-03
- 学習計画: まだない（設計の全体像は `docs/design/20260925-blog-design-proposal.md`）
- ステータス: 未着手

## 全体のどこか

「記事を表示する」までの段のうち、2段目にあたる。

| Step | 内容                                                   | 進捗           |
| ---- | ------------------------------------------------------ | -------------- |
| 1-1  | 記事1本を `/posts/[slug]` に表示する                   | ■■■ 完了       |
| 1-2  | `/posts` に記事の一覧を出す                            | ■□□ ← いまここ |
| 1-3  | Shiki でコードブロックに色を付ける                     | □□□            |
| 1-4  | Valibot で frontmatter の中身を検査し、`as` を取り除く | □□□            |

## 作るもの

| パス（リポジトリ直下から） | 中身                                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| `app/posts/page.tsx`       | 記事一覧のページ（新規）                                                                                 |
| `lib/createPostReader.ts`  | 一覧用の `getAllPosts` を足す。あわせて、原稿を開いて frontmatter を読む部分を `readPostFile` に切り出す |
| `content/lib-or-util.mdx`  | frontmatter が読めていない原稿を直す                                                                     |

依存パッケージは増えない。

今回は扱わないもの: 見た目（CSS）、日付の表示形式（`2026-11-02` のまま出す）、タグ、ページ送り、トップページ `/` の slug 一覧の整理、frontmatter の中身の検査（1-4 でやる）。

## なぜこれをやるか

1-1 で「原稿1本 → 記事ページ」の流れが通った。読者はまず一覧から記事を選ぶので、次は記事の入口を作る。

一覧は全部の原稿の frontmatter を一度に読む最初の場所でもある。記事ページは開いた1本しか読まないが、一覧は1本でも壊れた原稿があればその影響を受ける。実際、いまの `content/lib-or-util.mdx` は frontmatter が読めていない。一覧を作ると、この壊れ方が目に見える形で出てくる。1-4 で検査を入れる理由を体験しておく回でもある。

## 周辺知識

### 現時点のバージョン（2026-11-03 確認）

| パッケージ     | 入っている版 | npm の最新版 |
| -------------- | ------------ | ------------ |
| `next`         | 16.4.1       | 16.4.4       |
| `react`        | 19.2.9       | 19.3.1       |
| `@mdx-js/mdx`  | 3.1.1        | 3.1.1        |
| `vfile`        | 6.0.3        | 6.0.3        |
| `vfile-matter` | 5.0.1        | 5.0.1        |

`next` と `react` は最新版より古いが、このチケットでは上げない。

### 一覧ページの作り方（出典: `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`）

- `app/posts/page.tsx` を置くと `/posts` が開けるようになる。`app/posts/[slug]/page.tsx` とは別のページとして共存する
- ページ間のリンクには `next/link` の `<Link>` を使う。HTML の `<a>` に、先読み（prefetch）と画面の再読み込みなしの遷移を足したもの

### 実測したこと

2026-11-03、macOS / Node v26.13.0 / bun 1.4.4 / Next.js 16.4.1 で、このリポジトリを一時ディレクトリに複製して確かめた。

- ハンズオンの 2-a・2-b・2-c と手順 3 の修正後は、どれも `bun run build` と `bunx tsc --noEmit` が通る
- 各段階の「出てくる HTML」はビルドで作られた `.next/server/app/posts.html` から実際に抜き出したもの
- いまの `content/lib-or-util.mdx` を `vfile-matter` で読むと、`file.data.matter` は `{}`（空のオブジェクト）になる。エラーは出ない
- `"2026-09-25".localeCompare(undefined)` はエラーにならない。`undefined` が文字列 `"undefined"` として比べられ、日付のない記事が一覧の先頭に来る
- 手順 4 のエラー文は実際に出たもの

**未確認**: `bun dev` で画面を開いたときの見え方（確認はビルドの出力でしか行っていない）。

**このチケットとは別の問題**: `bun run lint` は、いまのリポジトリでは `Error: typescript-eslint does not support TS 7.0.` で止まる。`typescript` が 7 系なのに、`eslint-config-next` が使う typescript-eslint がまだ対応していないため。受け入れ条件には入れていない。

## 作業手順（全体の地図）

1. 作業用のブランチを切る
2. 一覧ページを3段階で組み上げる
3. 一覧に出た空の行の正体を突き止め、原稿を直す（**この回の本題**）
4. frontmatter のない原稿を足して、わざとビルドを落とす
5. コミットする

## 確認事項

- [ ] **一覧で本文まで実行するか。** 推奨案「frontmatter だけ読む `getAllPosts` を新しく作る」で作成。理由は `getPost` を流用すると記事の本数だけ MDX の `evaluate`（本文を JavaScript として実行する処理）が走り、一覧には使わない部品まで作ってしまうから。ただし、記事を読む関数が2つになるので、片方だけ直して食い違う心配が出る。原稿を開く部分を `readPostFile` に切り出して共通にし、この心配を小さくしている
- [ ] **1-1 で書いた `getPost` に手を入れてよいか。** 推奨案「`readPostFile` を使う形に書き換える」で作成。理由は同じ処理を2か所に書かずに済むから。ついでに、いまの `getPost` で `path.join` を2回書いている箇所も1回になる。ただし、動いているコードを触るので、手順 2-b のあとで `/posts/hello` が今までどおり作られるかを確かめる必要がある
- [ ] **日付をどう比べて並べるか。** 推奨案「文字列のまま `localeCompare` で比べる」で作成。理由は `2026-11-02` のように年・月・日を固定の桁数で書いていれば、文字列の順番と日付の順番が一致するから。`Date` に変換する手間が要らない。ただし、`2026-9-5` のように桁を省いて書くと順番が崩れる。日付がない原稿では、並びが崩れるか、手順 4 のようにビルドが落ちる
- [ ] **壊れた原稿を、コードで弾くか、原稿を直すか。** 推奨案「今回は原稿を直すだけにする」で作成。理由は検査の仕組みは 1-4 で Valibot を使って入れる予定で、ここで別の書き方をすると二度手間になるから。ただし 1-4 までは、同じ書き間違いをしてもビルドが通ってしまい、一覧に空の行が出るまで気づけない
- [ ] **トップページ `/` の slug 一覧をどうするか。** 推奨案「今回は触らない」で作成。理由はトップに何を置くかはまだ決めておらず、今回の本題から外れるから。ただし、しばらくは `/` と `/posts` の両方に一覧がある状態になる
- [ ] **作業ブランチをどこから切るか。** 推奨案「`feat/1-1-show-first-post` から切る」で作成。理由は 1-1 の作業がまだ `main` に入っておらず、`main` から切ると `lib/createPostReader.ts` が手元から消えるから。ただし、1-2 のプルリクエストに 1-1 のコミットも混ざる。先に 1-1 を `main` へマージしておけば避けられる
- [ ] **【標準ルールからの逸脱】このチケットでも TDD を適用しない。** 共通ルールは「実装は基本的に TDD」だが、テストランナーがまだ入っていない。Vitest の導入まで入れると、今回の本題（壊れた原稿が一覧に紛れ込む）がぼやけるので外した。ただし、TDD を外すのは 1-1 に続いて2回目になる。しかも手順 4 で落ちる並べ替えは、テストがあれば先に見つけられた種類の不具合にあたる。`createPostReader` は原稿の置き場所を引数で受け取る形なので、テスト用のフォルダを渡してテストしやすい。1-3 に進む前に、Vitest を入れて `createPostReader` のテストを書く回を挟むことを勧める

## ハンズオン

### 準備：この回で何をするのか

`/posts` を開くと、記事のタイトルと日付が新しい順に並ぶページを作る。途中で、一覧に「タイトルも日付もない行」が1つ出てくる。その正体を突き止めて直すのが、この回のいちばん大事なところになる。

#### 一覧と記事ページの違い

記事ページは開かれた1本の原稿だけを読む。一覧は `content/` にある原稿を全部読む。図書館でたとえると、記事ページは本を1冊借りて読むこと、一覧は全部の本の背表紙を見て回ることにあたる。背表紙を見るのに本文まで読む必要はないので、一覧では frontmatter（原稿の奥付）だけを読む。

#### 用意するもの

- 1-1 を終えた状態のリポジトリ
- ターミナルを1つ

---

### 手順 1：作業用のブランチを切る

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
git switch feat/1-1-show-first-post
git switch -c feat/1-2-list-posts
```

**なぜ** — 1-1 の作業はまだ `main` に入っていない。1-1 のブランチから切れば、`lib/createPostReader.ts` を引き継いだまま始められる（確認事項の6つ目）。

---

### 手順 2：一覧ページを3段階で組み上げる

各段階で `bun run build` を実行し、作られた HTML を覗いて変化を確かめる。HTML は1行に詰まっているので、`grep` で `<main>` から `</main>` までを抜き出す。

#### 2-a：slug を並べるだけのページを作る

`app/posts/page.tsx` を作る。

```tsx
import path from "node:path";
import Link from "next/link";
import { createPostReader } from "../../lib/createPostReader";

const { getAllSlugs } = createPostReader(path.join(process.cwd(), "content"));

export default async function Page() {
  "use cache";

  const slugs = await getAllSlugs();

  return (
    <main>
      <h1>記事一覧</h1>
      <ul>
        {slugs.map((slug) => (
          <li key={slug}>
            <Link href={`/posts/${slug}`}>{slug}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

ビルドして、結果を見る。

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
bun run build
grep -o '<main>.*</main>' .next/server/app/posts.html
```

ビルドの表に `○ /posts` の行が増える。

```
Route (app)               Revalidate  Expire
┌ ○ /                            15m      1y
├ ○ /_not-found
├ ○ /posts                       15m      1y
└   /posts/[slug]
  ├ ◐ /posts/[slug]
  ├ ○ /posts/hello               15m      1y
  └ ○ /posts/lib-or-util         15m      1y
```

`grep` の結果:

```
<main><h1>記事一覧</h1><ul><li><a href="/posts/hello">hello</a></li><li><a href="/posts/lib-or-util">lib-or-util</a></li></ul></main>
```

**なぜここから始めるのか** — トップページ `app/page.tsx` とほぼ同じ形で、1-1 で作った `getAllSlugs` だけで動く。まず `app/posts/page.tsx` というファイルを置くだけで `/posts` が増えることを確かめる。`[slug]` フォルダの隣に `page.tsx` を置いても、2つのページは喧嘩しない。

**`<Link>` は `<a>` になる** — HTML を見ると、`<Link>` は普通の `<a href>` として出ている。ブラウザで動くときには、クリックで画面全体を読み直さずにページを切り替える働きが足される。

#### 2-b：frontmatter だけを読む `getAllPosts` を足す

`lib/createPostReader.ts` を次の全文に置き換える。

```ts
import { evaluate } from "@mdx-js/mdx";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import * as runtime from "react/jsx-runtime";
import { VFile } from "vfile";
import { matter } from "vfile-matter";

const SLUG_PATTERN = /^[a-z0-9-]+$/;

type MyFrontmatter = {
  title: string;
  date: string;
};

export function createPostReader(contentDir: string) {
  async function readPostFile(slug: string) {
    const filePath = path.join(contentDir, `${slug}.mdx`);
    const file = new VFile({
      path: filePath,
      value: await readFile(filePath, "utf8"),
    });
    matter(file, { strip: true });
    const frontmatter = file.data.matter as MyFrontmatter;
    return { file, frontmatter };
  }

  async function getPost(slug: string) {
    if (!SLUG_PATTERN.test(slug)) return null;
    try {
      const { file, frontmatter } = await readPostFile(slug);
      const { default: Content } = await evaluate(file, runtime);
      return { frontmatter, Content };
    } catch {
      return null;
    }
  }

  async function getAllSlugs(): Promise<string[]> {
    const files = await readdir(contentDir);
    return files.filter((file) => file.endsWith(".mdx")).map((file) => file.replace(/\.mdx$/, ""));
  }

  async function getAllPosts() {
    const slugs = await getAllSlugs();
    return Promise.all(
      slugs.map(async (slug) => {
        const { frontmatter } = await readPostFile(slug);
        return { slug, frontmatter };
      }),
    );
  }

  return { getPost, getAllSlugs, getAllPosts };
}
```

`app/posts/page.tsx` も置き換える。

```tsx
import path from "node:path";
import Link from "next/link";
import { createPostReader } from "../../lib/createPostReader";

const { getAllPosts } = createPostReader(path.join(process.cwd(), "content"));

export default async function Page() {
  "use cache";

  const posts = await getAllPosts();

  return (
    <main>
      <h1>記事一覧</h1>
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

ビルドして、結果を見る。

```bash
bun run build
grep -o '<main>.*</main>' .next/server/app/posts.html
```

```
<main><h1>記事一覧</h1><ul><li><time dateTime="2026-09-25">2026-09-25</time><a href="/posts/hello">はじめての記事</a></li><li><time></time><a href="/posts/lib-or-util"></a></li></ul></main>
```

`hello` の行にはタイトルと日付が入った。一方、`lib-or-util` の行は `<time></time>` も `<a ...></a>` も中身が空になっている。**ビルドはエラーなく通っている**ことに注意する。この空の行は手順 3 で調べるので、いまはそのままにしておく。

ビルドの表に `○ /posts/hello` が今までどおり出ていることも確かめる。`getPost` を書き換えたので、記事ページが壊れていないかの確認になる。

**`readPostFile` に切り出した理由** — 「原稿ファイルを開いて、frontmatter を読む」という作業は、記事ページにも一覧にも要る。違いはその先で、記事ページは `evaluate` で本文を実行し、一覧はそこで止める。共通の部分を1つの関数に寄せておけば、原稿の読み方を変えるときに直す場所が1か所で済む。

**`Promise.all` とは** — `slugs.map(async ...)` は記事の本数ぶんの「あとで結果が届く引換券」（Promise）を作る。`Promise.all` は引換券を全部まとめて待ち、届いた結果を同じ順番の配列にして返す。1本ずつ順番に待つより早く終わる。

**`<time dateTime>`** — `<time>` は「これは日時です」と機械に伝える HTML の要素。`dateTime` に決まった形の日付を入れておくと、検索エンジンなどが日付として読み取れる。

#### 2-c：新しい順に並べる

`lib/createPostReader.ts` の `getAllPosts` だけを、次のように書き換える。

```ts
async function getAllPosts() {
  const slugs = await getAllSlugs();
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const { frontmatter } = await readPostFile(slug);
      return { slug, frontmatter };
    }),
  );
  return posts.sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));
}
```

ビルドして、結果を見る。

```bash
bun run build
grep -o '<main>.*</main>' .next/server/app/posts.html
```

```
<main><h1>記事一覧</h1><ul><li><time></time><a href="/posts/lib-or-util"></a></li><li><time dateTime="2026-09-25">2026-09-25</time><a href="/posts/hello">はじめての記事</a></li></ul></main>
```

空の行が一覧の**先頭**に移った。日付のない記事が「いちばん新しい記事」として扱われている。

**`sort` と比べる関数** — `sort` には「2つの記事を渡すから、どちらを前にするか答えて」という関数を渡す。答えが負の数なら `a` が前、正の数なら `b` が前になる。`b` と `a` を逆に並べて比べているので、新しい日付が前に来る。

**文字列のまま比べてよい理由** — `localeCompare` は文字列を辞書の順番で比べる。`2026-09-25` と `2026-11-02` は、左から1文字ずつ比べていくと6文字目の `0` と `1` で差がつき、日付の順番と同じ結果になる。年・月・日を固定の桁数で書いている限り、文字列の順番がそのまま日付の順番になる（確認事項の3つ目）。

**空の行が先頭に来る理由** — `lib-or-util` には日付がないので、比べるときに `"2026-09-25".localeCompare(undefined)` が実行される。JavaScript は `undefined` を文字列の `"undefined"` に変えて比べる。`"2` より `"u` のほうが辞書で後ろなので、「日付がない記事」がいちばん新しいと判定される。エラーにならないぶん、気づきにくい。

#### 完成形

`lib/createPostReader.ts`:

```ts
import { evaluate } from "@mdx-js/mdx";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import * as runtime from "react/jsx-runtime";
import { VFile } from "vfile";
import { matter } from "vfile-matter";

const SLUG_PATTERN = /^[a-z0-9-]+$/;

type MyFrontmatter = {
  title: string;
  date: string;
};

export function createPostReader(contentDir: string) {
  async function readPostFile(slug: string) {
    const filePath = path.join(contentDir, `${slug}.mdx`);
    const file = new VFile({
      path: filePath,
      value: await readFile(filePath, "utf8"),
    });
    matter(file, { strip: true });
    const frontmatter = file.data.matter as MyFrontmatter;
    return { file, frontmatter };
  }

  async function getPost(slug: string) {
    if (!SLUG_PATTERN.test(slug)) return null;
    try {
      const { file, frontmatter } = await readPostFile(slug);
      const { default: Content } = await evaluate(file, runtime);
      return { frontmatter, Content };
    } catch {
      return null;
    }
  }

  async function getAllSlugs(): Promise<string[]> {
    const files = await readdir(contentDir);
    return files.filter((file) => file.endsWith(".mdx")).map((file) => file.replace(/\.mdx$/, ""));
  }

  async function getAllPosts() {
    const slugs = await getAllSlugs();
    const posts = await Promise.all(
      slugs.map(async (slug) => {
        const { frontmatter } = await readPostFile(slug);
        return { slug, frontmatter };
      }),
    );
    return posts.sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));
  }

  return { getPost, getAllSlugs, getAllPosts };
}
```

`app/posts/page.tsx` は 2-b のものから変わらない。

---

### 手順 3：一覧に出た空の行の正体を突き止め、原稿を直す（この回の本題）

2-b から出ている空の行を調べる。原因はコードではなく原稿の側にある。

#### 3-a：原稿の先頭を見る

```bash
head -6 content/lib-or-util.mdx
```

````
```markdown
---
title: libとutilの使い分けルール

date: 2026-11-02
---
````

1行目に ` ```markdown ` がある。frontmatter が Markdown のコードブロックの中に入ってしまっている。

#### 3-b：`vfile-matter` から何が見えていたかを考える

`vfile-matter` は、ファイルの**1行目**が `---` のときだけ、そこから次の `---` までを frontmatter として読む。いまの1行目は ` ```markdown ` なので、frontmatter はないものとみなされる。そのとき `file.data.matter` に入るのは `{}`、つまり空のオブジェクトになる（実測済み）。

ここで `readPostFile` の次の行を見直す。

```ts
const frontmatter = file.data.matter as MyFrontmatter;
```

`as MyFrontmatter` は「この箱には `title` と `date` が入っている」と人間が約束する書き方だった（1-1 の手順 4-b）。TypeScript はこの約束を信じるだけで、中身は確かめない。空の箱 `{}` にも「`title` と `date` が入っている」という札が貼られ、一覧ページまで届く。`frontmatter.title` を取り出すと `undefined` になり、React は `undefined` を何も描かない。こうして空の行ができた。

途中のどこでもエラーは出ていない。原稿の書き間違いが、型チェックもビルドもすり抜けて画面まで届いた。

**この発見がどこに効くか** — 1-4 で Valibot を入れる理由がここで具体的になる。Valibot は「箱を開けて、本当に `title` と `date` が入っているかを確かめる」道具で、`as` が素通りさせた空の箱をビルドの時点で止められる。記事ページの側でも、いまの `/posts/lib-or-util` は見出しが空で、frontmatter の行がコードブロックとして本文に出ている（ビルドの HTML で確認済み）。同じ原因がページごとに違う症状で出ている。

#### 3-c：原稿を直す

`content/lib-or-util.mdx` を開き、次の2行を消す。

- 1行目の ` ```markdown `
- frontmatter の終わりの `---` の次の行にある ` ``` `

直したあとの先頭は次の形になる。

```mdx
---
title: libとutilの使い分けルール
date: 2026-11-02
---

このブログはNext.jsで作っています。このプロジェクトのlibとutilの使い分けルールを紹介します。
```

`title` と `date` の間の空行はそのままでも YAML として正しく読める。

#### 3-d：直ったことを確かめる

```bash
bun run build
grep -o '<main>.*</main>' .next/server/app/posts.html
```

```
<main><h1>記事一覧</h1><ul><li><time dateTime="2026-11-02">2026-11-02</time><a href="/posts/lib-or-util">libとutilの使い分けルール</a></li><li><time dateTime="2026-09-25">2026-09-25</time><a href="/posts/hello">はじめての記事</a></li></ul></main>
```

空の行が消え、11月2日の記事が9月25日の記事より上に並んだ。

---

### 手順 4：frontmatter のない原稿を足して、わざとビルドを落とす

手順 2-c では、日付のない記事が先頭に来るだけでエラーにはならなかった。同じ原因でも、ファイル名しだいでビルドが落ちることを確かめる。

frontmatter を書かない原稿を1本足す。

```bash
printf 'まだ書きかけ\n' > content/a-draft.mdx
bun run build
```

次のエラーでビルドが止まる。

```
⨯ TypeError: Cannot read properties of undefined (reading 'localeCompare')
    at <unknown> (lib/createPostReader.ts:53:52)
    at Array.sort (<anonymous>)
    at d (lib/createPostReader.ts:53:18)
    at async i (app/posts/page.tsx:10:17)
  51 |       }),
  52 |     );
> 53 |     return posts.sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));
     |                                                    ^
  54 |   }
  55 |
  56 |   return { getPost, getAllSlugs, getAllPosts }; {
  digest: '3781933963'
}
```

行番号は手で改行を変えていればずれる。

**手順 2-c では落ちなかったのに、なぜ今回は落ちたのか** — 比べる関数の中で `.localeCompare` を呼んでいるのは `b` の日付だけになっている。`b` の日付が `undefined` だと、`undefined` には `.localeCompare` がないのでエラーになる。`a` の日付が `undefined` のときは、手順 2-c で見たとおり `"undefined"` として比べられるだけで済む。どちらが `b` になるかは `sort` の中の都合で決まり、`readdir` が返すファイル名の順番にも左右される。`a-draft` は名前の順で先頭に来るので、今回は `b` の側に回った。

つまり、同じ書き間違いでも「黙って一覧の先頭に出る」か「ビルドが落ちる」かは、ファイル名という関係のない事情で決まる。原稿の中身を入口で確かめる仕組み（1-4）があれば、どちらの場合も同じ分かりやすいエラーで止められる。

確かめたら、足した原稿を消してビルドが通ることを確認する。

```bash
TRASH=~/.claude/delete/$(date +%Y%m%d-%H%M)
mkdir -p "$TRASH"
mv content/a-draft.mdx "$TRASH"/
bun run build
```

---

### 手順 5：コミットする

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
git status
git add app/posts/page.tsx lib/createPostReader.ts content/lib-or-util.mdx
git commit -m "feat: /posts に記事の一覧を新しい順に出す

読者が記事を選ぶ入口がなかったため。一覧では本文を実行しないよう、
frontmatter だけを読む getAllPosts を足し、原稿を開く処理は getPost と共通にした。
lib-or-util.mdx は frontmatter がコードブロックに入っていて読めていなかったので直した。"
```

`git status` に `content/a-draft.mdx` が出ていないことを確かめてから `git add` する。

---

### うまくいかないとき

上の2行は実際に出たエラー。下の2行は起きると予想されるもので、文面は確かめていない。

| 症状                                                                       | 原因と対処                                                                                                 |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `TypeError: Cannot read properties of undefined (reading 'localeCompare')` | `content/` に frontmatter の `date` がない原稿がある。手順 4 の `a-draft.mdx` を消し忘れていないか確かめる |
| 一覧に `<time></time>` と中身のない `<a>` の行がある                       | その原稿の frontmatter が読めていない。1行目が `---` になっているかを見る（手順 3）                        |
| `grep` が何も出さない（未確認）                                            | ビルドが失敗していて `posts.html` が作られていない。`bun run build` の出力を先に見る                       |
| `Cannot find module '../../lib/createPostReader'`（未確認）                | `app/posts/page.tsx` の置き場所が違う。`app/posts/[slug]/` の中ではなく、`app/posts/` の直下に置く         |

ここに載っていないエラーが出たら、そのまま貼って聞いてほしい。

---

## 受け入れ条件

- [ ] `bun run build` が通り、表に `○ /posts` と `○ /posts/hello`、`○ /posts/lib-or-util` が出る
- [ ] `grep -o '<main>.*</main>' .next/server/app/posts.html` の結果で、`libとutilの使い分けルール` が `はじめての記事` より前に出る
- [ ] 同じ結果に、中身の空の `<time></time>` がない
- [ ] `lib/createPostReader.ts` に `next` から import している行がない
- [ ] `getAllPosts` の中で `evaluate` を呼んでいない
- [ ] `content/a-draft.mdx` を足すとビルドが `TypeError` で落ち、消すと通ることを自分で確かめた
- [ ] `bunx tsc --noEmit` がエラーなしで終わる

## この回で理解したこと

着手後に埋める。動いたか（受け入れ条件）とは別に、何が分かったかを残す。

- [ ] 一覧で `getPost` を使わず、frontmatter だけを読む理由を説明できる
- [ ] `lib-or-util.mdx` の書き間違いが、型チェックもビルドもすり抜けて画面まで届いた道筋を、`as` の役割と結びつけて説明できる
- [ ] 同じ書き間違いが「黙って先頭に出る」場合と「ビルドが落ちる」場合に分かれた理由を言える
- [ ] 年・月・日を固定の桁数で書いていれば、文字列の比較で日付順に並べられる理由を言える

## 参考

- Next.js 同梱ドキュメント: `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`（「Creating a nested route」「Linking between pages」）
- `<Link>`: `node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md`
- vfile-matter: https://github.com/vfile/vfile-matter
- `Array.prototype.sort`: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
- `String.prototype.localeCompare`: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare
