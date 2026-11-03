# 1-3: 記事のコードブロックにビルド時に Shiki で色を付け、ブラウザに JavaScript を送らずに済むことを確かめる

- 起票日: 2026-11-03
- 学習計画: まだない（設計の全体像は `docs/design/20260925-blog-design-proposal.md`）
- ステータス: 完了

## 全体のどこか

「記事を表示する」までの段のうち、3段目にあたる。

| Step | 内容                                                   | 進捗           |
| ---- | ------------------------------------------------------ | -------------- |
| 1-1  | 記事1本を `/posts/[slug]` に表示する                   | ■■■ 完了       |
| 1-2  | `/posts` に記事の一覧を出す                            | ■■□ 実装中     |
| 1-3  | Shiki でコードブロックに色を付ける                     | ■□□ ← いまここ |
| 1-4  | Valibot で frontmatter の中身を検査し、`as` を取り除く | □□□            |

このチケットは 1-2 を完了してコミットしたあとの状態から始める。

## 作るもの

| パス（リポジトリ直下から） | 中身                                             |
| -------------------------- | ------------------------------------------------ |
| `lib/createPostReader.ts`  | `getPost` の `evaluate` に Shiki を差し込む      |
| `app/globals.css`          | `:root` に `color-scheme: light dark;` を1行足す |
| `content/hello.mdx`        | 色付けを確かめるためのコードブロックを足す       |

依存パッケージを1つ足す（`@shikijs/rehype`）。`shiki` 本体はその依存として自動で入る。

今回は扱わないもの: 行番号、特定の行の強調、ファイル名の表示、コピーボタン、コードブロックの余白や角丸などの見た目、存在しない言語名の検出。

## なぜこれをやるか

技術ブログの記事はコードを多く載せる。色がないと、どこがキーワードでどこが文字列かを読み手が自分で見分けることになる。

色付けの方法は ADR `20260925-1923-syntax-highlighter-shiki.md` で決めてある。ビルドの時点で Shiki が色を付けた HTML を作り、ブラウザには色付けのための JavaScript を送らない。この回ではその決定どおりに動いていることを、作られたファイルを見て確かめる。

1-1 で作った「原稿 → frontmatter と本文 → React コンポーネント」の流れのうち、本文を変換する途中に部品を1つ差し込む回でもある。ADR `20260925-1914-unified-content-pipeline.md` で unified を選んだ理由の一つが、こうした差し込みのしやすさだった。

## 周辺知識

### 現時点のバージョン（2026-11-03 確認）

| パッケージ        | バージョン | 役割                                                             |
| ----------------- | ---------- | ---------------------------------------------------------------- |
| `@shikijs/rehype` | 4.6.0      | Shiki を unified の変換の途中に差し込むための部品                |
| `shiki`           | 4.6.0      | 色付けの本体。`@shikijs/rehype` の依存として入る                 |
| `@mdx-js/mdx`     | 3.1.1      | 1-1 で入れたもの。`evaluate` の `rehypePlugins` で部品を受け取る |

Shiki はメジャーバージョンが 4 になっている。古い記事にある `getHighlighter` などの書き方はそのまま使えるとは限らない。

### Shiki の2テーマ指定（出典: Shiki 公式ドキュメント「Dual Themes」）

- `themes: { light: ..., dark: ... }` で、明るい画面用と暗い画面用の色を同時に埋め込める
- `defaultColor: "light-dark()"` にすると、色を CSS の `light-dark()` 関数で書き出す。切り替え用の CSS を自分で書かずに済む
- `light-dark()` は比較的新しい CSS の機能で、古いブラウザでは使えない

### `light-dark()` と `color-scheme`（実測済み）

- `light-dark(明るいとき, 暗いとき)` は、その要素の `color-scheme` が暗い側のときだけ2つ目の値を使う
- `color-scheme` を何も指定しないと、OS が暗い設定でも1つ目（明るい側）の色になる

2026-11-03、Playwright の Chromium で、OS の設定を暗い側にして確かめた。Shiki が出力する形と同じ `style` を持つ `<pre>` を置いて、計算後の色を見た。

| `:root` の `color-scheme` | 背景色                           | 文字色               |
| ------------------------- | -------------------------------- | -------------------- |
| 指定なし                  | `rgb(255, 255, 255)`（明るい側） | `rgb(36, 41, 46)`    |
| `light dark`              | `rgb(36, 41, 46)`（暗い側）      | `rgb(225, 228, 232)` |

### 実測したこと

2026-11-03、macOS / Node v26.13.0 / bun 1.4.4 / Next.js 16.4.1 で、1-2 の完成形を一時ディレクトリに複製して確かめた。

- ハンズオンの各段階で `bun run build` と `bunx tsc --noEmit` が通る
- 各段階の「出てくる HTML」はビルドで作られた `.next/server/app/posts/hello.html` から実際に抜き出したもの
- ビルド後の `.next/static`（ブラウザに送るファイル置き場）に、`shiki` や `github-dark` という文字列は1つもない
- コードブロックの言語名を `tsx2` のような存在しない名前にすると、エラーにならず、色の付かない `<pre><code class="language-tsx2">` のまま出る

**未確認**: `bun dev` で実際の記事ページを開いたときの見え方。上の `color-scheme` の確認は記事ページそのものではなく、同じ形の `<pre>` だけを置いたページで行った。

## 作業手順（全体の地図）

1. 作業用のブランチを切る
2. `@shikijs/rehype` を入れる
3. 記事にコードブロックを足し、色のない状態を見ておく
4. `evaluate` に Shiki を差し込み、2段階で色を付ける（**この回の本題**）
5. ブラウザに Shiki が送られていないことを確かめる
6. 言語名を書き間違えて、黙って色が消えるのを見る
7. コミットする

## 確認事項

- [ ] **どの部品で Shiki を差し込むか。** 推奨案「Shiki 公式の `@shikijs/rehype`」で作成。理由は、Shiki と同じリポジトリで作られていて版がそろい、設定が少なくて済むから。ただし、行の強調やファイル名の表示が欲しくなったら、`@shikijs/transformers` などを自分で組み合わせることになる。それらが最初からそろった `rehype-pretty-code`（0.14.5）という案もあるが、Shiki の上にもう1枚かぶさるので、何が Shiki の機能かが見えにくくなる
- [ ] **Shiki の設定をどこに書くか。** 推奨案「`lib/createPostReader.ts` の `getPost` に直接書く」で作成。理由は、Shiki は Next.js に依存しないので、Next.js 固有の書き方を `page.tsx` に寄せる 1-1 の方針を崩さないから。ただし、テーマの名前のような見た目の決めごとが、原稿を読む処理の中に入る。デザインシステムを作るときに、`createPostReader` の引数で渡す形へ直すことになるかもしれない
- [ ] **テーマと、暗い画面への対応。** 推奨案「`github-light` と `github-dark` を `light-dark()` で切り替える」で作成。理由は、今の `app/globals.css` が OS の明暗設定（`prefers-color-scheme`）に合わせて背景色を変えていて、コードブロックもそれに合わせられるから。CSS は `color-scheme` の1行で済む。ただし、`light-dark()` に対応していないブラウザではコードブロックに色が付かない。また、将来ボタンなどで明暗を切り替える仕組みを作るなら、Shiki が出力する CSS 変数（`--shiki-dark` など）を使う書き方へ直す必要がある
- [ ] **`app/globals.css` に `color-scheme: light dark;` を足してよいか。** 推奨案「足す」で作成。理由は、これがないと暗い画面でもコードブロックが明るい色のままになるから（周辺知識で実測）。ただし、この1行はコードブロック以外にも効く。暗い画面では、ブラウザ標準のスクロールバーや入力欄も暗い色になる。Panda CSS でデザインシステムを組むときに、置き場所を見直すことになる
- [ ] **色付けを確かめるコードブロックをどこに書くか。** 推奨案「`content/hello.mdx` の末尾に足す」で作成。理由は、記事を新しく作るより手数が少なく、1-1 から見てきた記事で変化を比べられるから。ただし `hello.mdx` は公開される記事なので、試しに書いたコードがそのまま読者に見える。気になるなら、あとで消すか書き直す
- [ ] **存在しない言語名を検出するか。** 推奨案「今回は検出しない」で作成。理由は、手順 6 で「黙って色が消える」ことを確かめるのが今回の範囲で、検出の仕組みまで入れると本題から外れるから。ただし、言語名を書き間違えても、ビルドは通り、画面を見るまで気づけない
- [ ] **【標準ルールからの逸脱】このチケットでも TDD を適用しない。** 共通ルールは「実装は基本的に TDD」だが、テストランナーがまだ入っていない。今回は色付けの結果を目で確かめることが中心で、テストの導入まで入れると本題がぼやけるので外した。ただし、TDD を外すのは 1-1・1-2 に続いて3回目になる。1-2 の確認事項で勧めたテストの回は、まだ挟んでいない。テストを書かないまま部品を足すほど、あとでテストを書くときに確かめる範囲が広がる

## ハンズオン

### 準備：この回で何をするのか

`content/hello.mdx` にコードブロックを足し、`/posts/hello` でそのコードに色が付くようにする。色を付けるのはビルドのときで、ブラウザは色の付いた HTML を受け取るだけになる。明るい画面と暗い画面の両方に合わせた色も、このとき一緒に埋め込む。

#### rehype の部品とは

1-1 で使った `evaluate` は原稿を次の順に変換している。

```
原稿の文字列 → Markdown の木（mdast）→ HTML の木（hast）→ JavaScript のコード → React コンポーネント
```

「木」は見出しや段落、コードブロックといった部品を、親子の関係で整理した入れ物のこと。家系図のように、記事全体の下に見出しや段落がぶら下がっている形を想像すればよい。

**rehype の部品**（rehype プラグイン）は、このうち「HTML の木」の段階で木を書き換える道具になる。工場のベルトコンベアの途中に、新しい作業員を1人立たせるイメージに近い。`@shikijs/rehype` という作業員は流れてくる木から `<pre><code>` を見つけ、中のコードを色付きの `<span>` に分け直す。前後の工程はそのまま動く。

#### 用意するもの

- 1-2 を完了してコミットした状態のリポジトリ
- ターミナルを1つ
- ブラウザ（手順 4 の最後に、明暗の切り替えを目で見るときだけ使う）

---

### 手順 1：作業用のブランチを切る

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
git switch feat/1-2-list-posts
git status
git switch -c feat/1-3-shiki-highlight
```

`git status` で `nothing to commit, working tree clean` と出ることを確かめてから、最後の行を実行する。

**なぜ** — 1-2 の作業はまだ `main` に入っていない。1-2 のブランチから切れば、`readPostFile` に切り出したあとの `createPostReader` を引き継いで始められる。`git status` を挟むのは、1-2 のコミットし忘れを持ち込まないため。

---

### 手順 2：`@shikijs/rehype` を入れる

```bash
bun add @shikijs/rehype
```

出力の中に次の行がある。

```
installed @shikijs/rehype@4.6.0
```

**なぜ `shiki` を直接入れないのか** — 今回は Shiki を直接呼ばず、`@shikijs/rehype` 経由で使う。`shiki` は `@shikijs/rehype` が自分の依存として連れてくるので、`package.json` に書くのは1つで済む。

---

### 手順 3：記事にコードブロックを足し、色のない状態を見ておく

`content/hello.mdx` の末尾に、次の内容を足す。

````mdx
## コードの例

```ts
const greeting: string = "こんにちは";
console.log(greeting);
```
````

コードブロックの1行目にある `ts` が言語名で、「これは TypeScript のコード」と伝える印になる。

ビルドして、コードブロックの部分を抜き出す。

```bash
bun run build
bun -e 'const s = await Bun.file(".next/server/app/posts/hello.html").text(); console.log(s.match(/<pre[\s\S]*?<\/pre>/)[0])'
```

```
<pre><code class="language-ts">const greeting: string = &quot;こんにちは&quot;;
console.log(greeting);
</code></pre>
```

**なぜ先に見ておくのか** — 色を付ける前と後を比べるため。いまの HTML には `class="language-ts"` という言語名の印しかない。色の情報はどこにもない。

**`bun -e` の1行** — コードブロックの中には改行があるので、1行ずつ探す `grep` では途中で切れてしまう。そこで、bun で HTML を丸ごと読み込み、`<pre` から `</pre>` までを取り出している。

---

### 手順 4：`evaluate` に Shiki を差し込み、2段階で色を付ける（この回の本題）

#### 4-a：1つのテーマで色を付ける

`lib/createPostReader.ts` を次の全文に置き換える。1-2 の完成形から変わるのは、2行目の `import` と、`getPost` の中の `evaluate` の呼び方だけになる。

```ts
import { evaluate } from "@mdx-js/mdx";
import rehypeShiki from "@shikijs/rehype";
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
      const { default: Content } = await evaluate(file, {
        ...runtime,
        rehypePlugins: [[rehypeShiki, { theme: "github-light" }]],
      });
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

ビルドして、同じ場所を抜き出す。

```bash
bun run build
bun -e 'const s = await Bun.file(".next/server/app/posts/hello.html").text(); console.log(s.match(/<pre[\s\S]*?<\/pre>/)[0])'
```

```
<pre class="shiki github-light" style="background-color:#fff;color:#24292e" tabindex="0"><code><span class="line"><span style="color:#D73A49">const</span><span style="color:#005CC5"> greeting</span><span style="color:#D73A49">:</span><span style="color:#005CC5"> string</span><span style="color:#D73A49"> =</span><span style="color:#032F62"> &quot;こんにちは&quot;</span><span style="color:#24292E">;</span></span>
<span class="line"><span style="color:#24292E">console.</span><span style="color:#6F42C1">log</span><span style="color:#24292E">(greeting);</span></span></code></pre>
```

手順 3 と比べると、コードが単語ごとの `<span>` に分かれ、それぞれに `style="color:..."` で色が直接書き込まれている。`const` は赤系（`#D73A49`）、文字列は紺（`#032F62`）になっている。

**`...runtime` と `rehypePlugins` を同じ `{}` に入れる理由** — 1-1 では `evaluate(file, runtime)` と、`runtime` をそのまま2つ目の引数に渡していた。2つ目の引数は「設定の入った箱」で、`runtime` はその箱に `jsx` などの道具を詰めたものだった。今回はその箱に `rehypePlugins` も足したいので、`...runtime` で中身を新しい箱に移し、隣に `rehypePlugins` を並べている。`...` は「箱の中身を全部ここに広げる」書き方。

**`[[rehypeShiki, { theme: "github-light" }]]` の角かっこが二重の理由** — 外側の `[]` は「部品の一覧」。内側の `[部品, 設定]` は「この部品を、この設定で使う」という1組を表す。部品をもう1つ足すなら、外側の `[]` の中に組を増やす。

**色が文字として HTML に入っている** — この時点で、色の計算はすべて終わっている。ブラウザは HTML を受け取って表示するだけで、どの単語が何色かを自分で判断する必要がない。これが ADR の「ビルド時に色を付ける」の意味になる。

#### 4-b：明るい画面と暗い画面の両方に色を用意する

`lib/createPostReader.ts` の `getPost` の中、`evaluate` の呼び方だけを次のように書き換える。

```ts
const { default: Content } = await evaluate(file, {
  ...runtime,
  rehypePlugins: [
    [
      rehypeShiki,
      {
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: "light-dark()",
      },
    ],
  ],
});
```

`app/globals.css` の最初の `:root` に、`color-scheme: light dark;` の1行を足す。足したあとの `:root` は次の形になる。

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
  color-scheme: light dark;
}
```

ビルドして、同じ場所を抜き出す。

```bash
bun run build
bun -e 'const s = await Bun.file(".next/server/app/posts/hello.html").text(); console.log(s.match(/<pre[\s\S]*?<\/pre>/)[0])'
```

```
<pre class="shiki shiki-themes github-light github-dark" style="background-color:light-dark(#fff, #24292e);--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;color:light-dark(#24292e, #e1e4e8);--shiki-light:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:light-dark(#D73A49, #F97583);--shiki-light:#D73A49;--shiki-dark:#F97583">const</span><span style="color:light-dark(#005CC5, #79B8FF);--shiki-light:#005CC5;--shiki-dark:#79B8FF"> greeting</span><span style="color:light-dark(#D73A49, #F97583);--shiki-light:#D73A49;--shiki-dark:#F97583">:</span><span style="color:light-dark(#005CC5, #79B8FF);--shiki-light:#005CC5;--shiki-dark:#79B8FF"> string</span><span style="color:light-dark(#D73A49, #F97583);--shiki-light:#D73A49;--shiki-dark:#F97583"> =</span><span style="color:light-dark(#032F62, #9ECBFF);--shiki-light:#032F62;--shiki-dark:#9ECBFF"> &quot;こんにちは&quot;</span><span style="color:light-dark(#24292E, #E1E4E8);--shiki-light:#24292E;--shiki-dark:#E1E4E8">;</span></span>
<span class="line"><span style="color:light-dark(#24292E, #E1E4E8);--shiki-light:#24292E;--shiki-dark:#E1E4E8">console.</span><span style="color:light-dark(#6F42C1, #B392F0);--shiki-light:#6F42C1;--shiki-dark:#B392F0">log</span><span style="color:light-dark(#24292E, #E1E4E8);--shiki-light:#24292E;--shiki-dark:#E1E4E8">(greeting);</span></span></code></pre>
```

`const` の色が `color:light-dark(#D73A49, #F97583)` になった。「明るい画面なら `#D73A49`、暗い画面なら `#F97583`」という意味で、どちらの色も HTML に入っている。

**なぜ `color-scheme` が要るのか** — `light-dark()` は、OS の設定を直接見ているわけではない。その要素の `color-scheme`（「このページは明るい表示と暗い表示のどちらに対応しているか」の申告）を見て、どちらの色を使うかを決める。申告がないページは「明るい表示だけに対応」とみなされ、OS が暗い設定でも1つ目の色になる（周辺知識の表）。`:root` に `light dark` と書くと、「両方に対応しているので、OS の設定に合わせてよい」という申告になる。

**ブラウザで明暗を切り替えて見る（任意）** — `bun dev` で `http://localhost:3000/posts/hello` を開き、OS の外観設定を「ダーク」と「ライト」で切り替える。コードブロックの背景と文字の色が変わるはず（記事ページそのものでは未確認）。Chrome なら、開発者ツールの「Rendering」タブにある「Emulate CSS media feature prefers-color-scheme」でも切り替えられる。

#### 完成形

`lib/createPostReader.ts`:

```ts
import { evaluate } from "@mdx-js/mdx";
import rehypeShiki from "@shikijs/rehype";
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
      const { default: Content } = await evaluate(file, {
        ...runtime,
        rehypePlugins: [
          [
            rehypeShiki,
            {
              themes: { light: "github-light", dark: "github-dark" },
              defaultColor: "light-dark()",
            },
          ],
        ],
      });
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

`app/globals.css` は、4-b で `:root` に1行足した形のまま。

---

### 手順 5：ブラウザに Shiki が送られていないことを確かめる

```bash
grep -rl "shiki" .next/static
echo "終了コード: $?"
```

何も表示されず、終了コードは `1` になる。`grep` は、見つからなかったときに終了コード（コマンドが成功したかどうかを表す番号。`0` が「見つかった」）を `1` にして終わる。

**`.next/static` とは** — ビルドで作られるファイルのうち、ブラウザに送られる JavaScript や CSS の置き場所。ここに `shiki` の文字がないということは、色付けの仕組みは読者のブラウザまで届いていない。

**なぜこれが大事なのか** — Shiki は、たくさんの言語の文法とテーマの色を持っている大きな道具になる。もしブラウザで色を付ける作りだったら、記事を開くたびにこの道具を丸ごと読者の端末へ送り、読者の端末で色を計算させることになる。ビルドで色を付けておけば、読者が受け取るのは「すでに色の付いた HTML」だけで済む。ADR で gpu-lexer を採らなかった理由（ブラウザの対応状況に左右される）も、同じ見方の延長にある。

この見方はこの先も使える。新しいライブラリを入れたら、`.next/static` を探して「これは読者に送られているか」を確かめればよい。

---

### 手順 6：言語名を書き間違えて、黙って色が消えるのを見る

`content/hello.mdx` のコードブロックの1行目を、` ```ts ` から ` ```tsx2 ` に書き換える。`tsx2` という言語は存在しない。

ビルドして、同じ場所を抜き出す。

```bash
bun run build
bun -e 'const s = await Bun.file(".next/server/app/posts/hello.html").text(); console.log(s.match(/<pre[\s\S]*?<\/pre>/)[0])'
```

```
<pre><code class="language-tsx2">const greeting: string = &quot;こんにちは&quot;;
console.log(greeting);
</code></pre>
```

ビルドはエラーなく通り、コードブロックは手順 3 と同じ色のない形に戻った。

**なぜエラーにならないのか** — Shiki は、自分が知っている言語名のコードブロックだけに色を付け、知らない名前のものはそのまま次の工程へ流す。原稿の書き間違いでビルドを止めないための作りだが、そのぶん書き間違いに気づくのは画面を見たときになる。

1-2 で見た「frontmatter が読めないまま一覧に空の行が出る」のと同じ形の失敗になる。原稿の書き間違いがエラーにならず、見た目が少し変わるだけで通り抜けていく。原稿を入口で確かめる仕組みの必要性が、ここでも出てくる（確認事項の6つ目）。

確かめたら、` ```tsx2 ` を ` ```ts ` に戻し、ビルドして色が戻ることを確かめる。

```bash
bun run build
bun -e 'const s = await Bun.file(".next/server/app/posts/hello.html").text(); console.log(s.match(/<pre[\s\S]*?<\/pre>/)[0])'
```

出力が 4-b と同じ `<pre class="shiki shiki-themes github-light github-dark" ...` で始まれば戻っている。

---

### 手順 7：コミットする

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
git status
git add lib/createPostReader.ts app/globals.css content/hello.mdx package.json bun.lock
git commit -m "feat: 記事のコードブロックにビルド時に Shiki で色を付ける

コードの読みやすさのため。ADR のとおりビルド時に色を付け、ブラウザに色付けの
JavaScript を送らない。明暗は light-dark() で切り替えるので、globals.css に
color-scheme を足した。"
```

`git status` に `next-env.d.ts` が出ても、このチケットとは関係がないので `git add` に含めない。

---

### うまくいかないとき

上の3行は実際に起きたこと。下の2行は起きると予想されるもので、文面は確かめていない。

| 症状                                                                  | 原因と対処                                                                                                                                                                                              |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| コードブロックに色が付かず、`<pre><code class="language-...">` のまま | 言語名が Shiki の知らない名前になっている（手順 6）。` ``` ` の直後の言語名を見直す                                                                                                                     |
| 暗い画面にしても、コードブロックが明るい色のまま                      | `app/globals.css` の `:root` に `color-scheme: light dark;` がない（手順 4-b）                                                                                                                          |
| `grep -rl "shiki" .next/static` が何も出さない                        | 正常。手順 5 のとおり、見つからないのが期待どおりの結果                                                                                                                                                 |
| `Cannot find module '@shikijs/rehype'`（未確認）                      | 手順 2 の `bun add` がリポジトリ直下で実行されていない。`package.json` のある場所で入れ直す                                                                                                             |
| 記事ページが 404 になる（未確認）                                     | `getPost` の `try` の中でエラーが起きている。`catch` が黙って `null` を返すので、エラー文が出ない。一時的に `catch (error) { console.error(error); return null; }` にして、`bun run build` の出力を見る |

ここに載っていないエラーが出たら、そのまま貼って聞いてほしい。

---

## 受け入れ条件

- [x] `bun run build` が通り、表に `○ /posts/hello` が出る
- [x] `.next/server/app/posts/hello.html` のコードブロックが `<pre class="shiki shiki-themes github-light github-dark"` で始まる
- [x] 同じコードブロックの `const` に `color:light-dark(#D73A49, #F97583)` が付いている
- [x] `app/globals.css` の `:root` に `color-scheme: light dark;` がある
- [x] `grep -rl "shiki" .next/static` が何も出さない
- [x] `lib/createPostReader.ts` に `next` から import している行がない
- [x] 言語名を `tsx2` にするとビルドが通ったまま色が消え、`ts` に戻すと色が戻ることを自分で確かめた
- [x] `bunx tsc --noEmit` がエラーなしで終わる

## この回で理解したこと

着手後に埋める。動いたか（受け入れ条件）とは別に、何が分かったかを残す。

- [x] rehype の部品が原稿の変換のどの段階で、何を書き換えているかを説明できる
- [x] 「ビルド時に色を付ける」と「ブラウザで色を付ける」で、読者に届くものがどう違うかを説明できる
- [x] `light-dark()` が `color-scheme` なしでは暗い色にならない理由を言える
- [x] 言語名の書き間違いと 1-2 の frontmatter の書き間違いが、同じ形の失敗だと言える理由を説明できる

## 参考

- Shiki rehype 統合: https://shiki.style/packages/rehype
- Shiki の2テーマ指定: https://shiki.style/guide/dual-themes
- `light-dark()`: https://developer.mozilla.org/ja/docs/Web/CSS/color_value/light-dark
- `color-scheme`: https://developer.mozilla.org/ja/docs/Web/CSS/color-scheme
- MDX の `evaluate` の設定: https://mdxjs.com/packages/mdx/#evaluateoptions
- ADR: `docs/adr/20260925-1923-syntax-highlighter-shiki.md`、`docs/adr/20260925-1914-unified-content-pipeline.md`
