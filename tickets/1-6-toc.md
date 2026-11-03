# 1-6: 記事の見出しから目次を作り、押すとその見出しへ飛べるようにする

- 起票日: 2026-11-03
- 学習計画: まだない（設計の全体像は `docs/design/20260925-blog-design-proposal.md`）
- ステータス: 完了

## 全体のどこか

「記事を表示する」段の6段目にあたる。1-3 で Shiki を rehype のプラグインとして差し込んだ。今回はそのプラグインを自分で書く。

| Step | 内容                                                   | 進捗     |
| ---- | ------------------------------------------------------ | -------- |
| 1-1  | 記事1本を `/posts/[slug]` に表示する                   | ■■■ 完了 |
| 1-2  | `/posts` に記事の一覧を出す                            | ■■■ 完了 |
| 1-3  | Shiki でコードブロックに色を付ける                     | ■■■ 完了 |
| 1-4  | Valibot で frontmatter の中身を検査し、`as` を取り除く | ■■■ 完了 |
| 1-5  | タグを付け、`/tags` と `/tags/[tag]` を作る            | ■■■ 完了 |
| 1-6  | 見出しから目次を作る                                   | ■■■ 完了 |

このチケットは 1-5 を完了してコミットしたあとの状態から始める。

設計書の「記事詳細」には、目次と OGP 画像の2つが残っている。RSS・sitemap・404 ページは「裏方」の残りで、この回では扱わない。

## 作るもの

| パス（リポジトリ直下から）     | 中身                                                              |
| ------------------------------ | ----------------------------------------------------------------- |
| `package.json`                 | `rehype-slug`・`hast-util-to-string`・`@types/hast` を足す        |
| `lib/rehypeCollectHeadings.ts` | 見出しを集める rehype のプラグイン（新規）                        |
| `lib/createPostReader.ts`      | プラグインを2つ差し込み、`getPost` が見出しの一覧も返すようにする |
| `app/posts/[slug]/page.tsx`    | タグの下に目次を出す                                              |

今回は扱わないもの: 見た目（CSS）、`h3` 以下の見出し、読んでいる見出しを目次で光らせる動き、目次を画面の横に固定する配置。

## なぜこれをやるか

記事が長くなると、読者は自分の読みたい節まで画面を送り続けることになる。目次があれば、記事の全体を先に見渡せて、読みたい節へ1回で飛べる。

もう1つの狙いは原稿の読み込み処理の中身を知ることにある。1-3 では Shiki を `rehypePlugins` に1行足しただけで、中で何が起きているかは見ていなかった。今回はプラグインを自分で書き、原稿が「木」の形で流れていく様子を目で見る。ここが分かると、この先の数式・注釈・画像の最適化も、同じ場所に部品を足す作業として考えられる。

## 周辺知識

### 足すパッケージ（2026-11-03 に `npm view` で確認）

| パッケージ            | 版    | 公開日     | 役割                                    |
| --------------------- | ----- | ---------- | --------------------------------------- |
| `rehype-slug`         | 6.0.0 | 2023-08-31 | 見出しに `id` を付ける                  |
| `hast-util-to-string` | 3.0.1 | 2024-09-27 | 木の1つの節から、中の文字だけを取り出す |
| `@types/hast`         | 3.0.5 | 2026-07-09 | hast（HTML の木）の型。開発時だけ使う   |

- どれも公開から3日以上たっているので、`bunfig.toml` の `minimumReleaseAge` に止められない
- 3つとも unified の公式の部品で、Next.js に依存しない
- `@types/hast` は、いまも `node_modules/@types/hast` に入っている。ただし、ほかのパッケージが連れてきたものなので、そのパッケージが変わると消えることがある。自分で `import` するので、`package.json` に書いておく

### `rehype-slug` の id の付け方（出典: rehype-slug の README と、実測）

- 見出しの文字から、GitHub と同じ規則で `id` を作る（中で `github-slugger` を使う）
- 日本語はそのまま残る。`## こんにちは` は `id="こんにちは"` になる
- 英字は小文字になり、空白は `-` になる
- 同じ文字の見出しが2つあると、2つ目は末尾に `-1` が付く

### 実測したこと

2026-11-03、macOS / Node v26.13.0 / bun 1.4.4 / Next.js 16.4.1 で、1-5 のコミット（`5bcebe0`）を一時ディレクトリに複製して確かめた。

- ハンズオンの各段階で `bun run build` と `bun run typecheck` が通る（手順 7 と手順 8 の、わざと壊す場面を除く）
- 手順 4 の木の中身、手順 7 と手順 8 の結果、HTML の抜き出しは、実際に出たものを写した
- `evaluate` に渡した `file` に、プラグインが書き込んだ値がそのまま残っている
- 書き換えた `app/posts/[slug]/page.tsx` は `bun run lint` の oxlint と markuplint を通る

**未確認**: ブラウザで目次のリンクを押したときに、その見出しまで画面が動くか。手順 6 の最後に、自分の画面で確かめる。

## 作業手順（全体の地図）

1. 作業用のブランチを切る
2. パッケージを入れる
3. `rehype-slug` を差し込み、見出しに `id` が付くのを見る
4. 自作のプラグインを差し込み、原稿の木を覗く
5. 見出しを集めて、ページへ渡す（**この回の本題**）
6. 記事ページに目次を出す
7. プラグインの順番を入れ替えて、目次が消えるのを見る
8. 型の貼り紙を外して、型検査が止まるのを見る
9. コミットする

## 確認事項

- [x] **目次の作り方。** 推奨案「`rehype-slug` で id を付け、見出しを集める部分は自分でプラグインを書く」で作成。理由はプラグインを自分で書くと、原稿がどんな木で流れているかを目で見られるから。集める部分は20行ほどで済む。ただし、自分で書いた分は自分で直すことになる。既製品の `remark-toc` は原稿に `## 目次` と書いた場所へ目次を差し込む方式で、こちらは原稿に目次の見出しが残る。Zenn・Qiita へ配るときにも、その見出しがついていってしまう
- [x] **目次に載せる見出しの深さ。** 推奨案「`h2` だけ」で作成。理由は、いまの原稿に `h3` がなく、平らな一覧で済むから。ただし、`###` を使った記事を書くと、その見出しは目次に出ない。`h3` を載せたくなったら、`h2` の下に入れ子の一覧を作る処理を足す
- [x] **見出しを探す範囲。** 推奨案「木のいちばん上の段（`tree.children`）だけを見る」で作成。理由は、Markdown の `##` は必ずいちばん上の段に来るので、全部の枝をたどる部品（`unist-util-visit`）を足さずに済むから。ただし、MDX の中で `<Callout>` のような自作のコンポーネントで囲んだ見出しは、1段下に入るので拾えない。そういう書き方をするようになったら、`unist-util-visit` に置き換える
- [x] **目次を置く場所。** 推奨案「タグの一覧の下、本文の前」で作成。理由は、記事を開いた人が最初に全体を見渡せるから。ただし、本文を読み進めると目次は画面の外へ消える。画面の横に固定する配置は、Panda CSS で見た目を作る回に回す
- [x] **目次のリンクに使うもの。** 推奨案「`next/link` の `Link` ではなく、ふつうの `<a>`」で作成。理由は行き先が同じページの中の見出しで、ページを読み込み直さないから。`Link` の役割である「別のページを先読みして速く移る」が働く場面がない。ただし、タグのリンクと書き方がそろわない
- [x] **見出しが1つもない記事。** 推奨案「目次ごと出さない」で作成。理由は、中身のない目次の枠だけが出ると、壊れて見えるから。ただし、いまの原稿はどちらも見出しを持つので、この分岐は動かして確かめていない
- [x] **【標準ルールからの逸脱】TDD を適用しない。** 本人の判断（2026-11-03）による。見出しを集める関数は入力と出力がはっきりしているので、テストの題材には向いている。Vitest を入れる回の練習台に回せる

## ハンズオン

ここに出てくるコマンドの出力とエラー文は、実際に動かして写したもの（2026-11-03、bun 1.4.4 / Next.js 16.4.1 / rehype-slug 6.0.0 / hast-util-to-string 3.0.1）。

---

### 準備：この回で何をするのか

記事の `##` の見出しを集めて、タグの下に目次として並べる。目次の項目を押すと、その見出しまで画面が飛ぶ。そのために、見出しに `id`（ページの中の住所）を付ける部品と、見出しを集める部品の2つを、原稿の読み込み処理に差し込む。2つ目は自分で書く。

#### 原稿はベルトコンベアの上を「木」の形で流れる

1-1 から使っている `evaluate` は原稿の文字を一度に HTML へ変えているのではない。工場のベルトコンベアのように、いくつかの持ち場を順に通している。

```
MDX の文字
  ↓ 読み取る
mdast（Markdown の木）   ← remarkPlugins の持ち場
  ↓ 変換する
hast（HTML の木）        ← rehypePlugins の持ち場。Shiki はここにいる
  ↓ 変換する
JavaScript（React のコンポーネント）
```

「木」は家系図のような形のデータを指す。`<article>` の下に `<h2>` と `<p>` がぶら下がり、`<p>` の下に文字がぶら下がる。HTML の入れ子を、そのまま枝分かれで表したものになる。

rehype のプラグインは hast の持ち場に立つ作業員にあたる。流れてきた木を受け取り、手を加えて次へ流す。1-3 の Shiki は `<pre>` の枝を見つけて色付きの枝に付け替える作業員だった。今回は `<h2>` の枝に `id` を書き込む作業員と、`<h2>` の枝を数えてメモに取る作業員を、Shiki の前に並べる。

#### 用意するもの

- 1-5 を完了してコミットした状態のリポジトリ
- ターミナルを1つ
- ブラウザ（手順 6 の最後で使う）

---

### 手順 1：作業用のブランチを切る

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
git switch feat/1-5-tags
git status
git switch -c feat/1-6-toc
```

`git status` で `nothing to commit, working tree clean` と出ることを確かめてから、最後の行を実行する。

**なぜ** — 1-5 のタグの作業もまだ `main` に入っていない。1-5 のブランチから切ると、タグを表示している記事ページを引き継げる。

---

### 手順 2：パッケージを入れる

```bash
bun add rehype-slug@6.0.0 hast-util-to-string@3.0.1
bun add -d @types/hast@3.0.5
```

`package.json` の `dependencies` に2行、`devDependencies` に1行が増える。どれも `^` が付かずに版が固定されていることを確かめる。

```json
    "hast-util-to-string": "3.0.1",
    "rehype-slug": "6.0.0",
```

```json
    "@types/hast": "3.0.5",
```

**なぜ版を書いて入れるのか** — `bunfig.toml` の `exact = true` で `^` は付かないが、版を書かずに入れると、その日の最新版が入る。チケットと同じ版を入れておけば、この先の出力がチケットと食い違わない。

**なぜ `@types/hast` だけ `-d` なのか** — 型は型検査のときにしか使わない。ビルドしたサイトには入らないので、開発用の `devDependencies` に置く。

---

### 手順 3：`rehype-slug` を差し込み、見出しに `id` が付くのを見る

`lib/createPostReader.ts` を2か所書き換える。

1つ目。`import` に1行足す。

```ts
import { evaluate } from "@mdx-js/mdx";
import rehypeShiki from "@shikijs/rehype";
import rehypeSlug from "rehype-slug";
```

2つ目。`rehypePlugins` の先頭に `rehypeSlug` を足す。

```ts
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeShiki,
            {
              themes: { light: "github-light", dark: "github-dark" },
              defaultColor: "light-dark()",
            },
          ],
        ],
```

ビルドして、見出しの HTML を抜き出す。

```bash
bun run build
grep -o '<h2[^>]*>[^<]*' .next/server/app/posts/hello.html
```

```
<h2 id="こんにちは">こんにちは
<h2 id="コードの例">コードの例
```

**`id` は何のためにあるのか** — `id` はページの中の住所にあたる。URL の終わりに `#こんにちは` を付けて開くと、ブラウザは `id="こんにちは"` の場所まで画面を送る。目次のリンクはこの住所を指すことになる。住所のない見出しへは飛べないので、先に住所を付けた。

**`rehypePlugins` の書き方が2通りある理由** — `rehypeSlug` は名前だけを書き、Shiki は `[部品, 設定]` の組で書いた。設定を渡す必要がない部品は名前だけでよい。

---

### 手順 4：自作のプラグインを差し込み、原稿の木を覗く

`lib/rehypeCollectHeadings.ts` を新しく作り、次の全文を書く。まだ見出しは集めず、流れてきた木のいちばん上の段を表示するだけにする。

```ts
import type { Root } from "hast";

export function rehypeCollectHeadings() {
  return (tree: Root) => {
    console.log(tree.children.map((node) => (node.type === "element" ? node.tagName : node.type)));
  };
}
```

`lib/createPostReader.ts` に `import` を1行足し、`rehypePlugins` の `rehypeSlug` の次に `rehypeCollectHeadings` を足す。

```ts
import rehypeSlug from "rehype-slug";
import { rehypeCollectHeadings } from "./rehypeCollectHeadings";
```

```ts
        rehypePlugins: [
          rehypeSlug,
          rehypeCollectHeadings,
          [
            rehypeShiki,
```

ビルドすると、`Generating static pages` の行のあいだに、記事1本につき1つずつ配列が出る。

```bash
bun run build
```

```
[
  'h2',       'text',
  'p',        'text',
  'mdxjsEsm', 'text',
  'p',        'text',
  'h2',       'text',
  'pre'
]
[
  'p',  'text',
  'h2', 'text',
  'p',  'text',
  'h2', 'text',
  'p'
]
```

1つ目が `hello.mdx`、2つ目が `lib-or-util.mdx` にあたる。出る順番はビルドの進み方で入れ替わることがある。

**プラグインの形** — プラグインは「作業員を返す関数」になっている。外側の `rehypeCollectHeadings` はベルトコンベアに作業員を配置するときに1回だけ呼ばれる。内側の `(tree) => { ... }` が作業員の本体で、原稿が1本流れてくるたびに呼ばれる。Shiki に設定を渡せたのは、外側の関数が設定を受け取れる形だからである。

**木を読む** — `hello.mdx` と見比べる。

| 木の上の段 | 原稿のどこか                                     |
| ---------- | ------------------------------------------------ |
| `h2`       | `## こんにちは`                                  |
| `p`        | `これは **MDX** で書いた最初の記事です。`        |
| `mdxjsEsm` | `export const year = 2026;`（MDX の JavaScript） |
| `p`        | `今年は {year} 年です。`                         |
| `h2`       | `## コードの例`                                  |
| `pre`      | コードブロック。このあと Shiki が色を付ける      |
| `text`     | 段落と段落のあいだの改行                         |

`##` の見出しはどれも木のいちばん上の段に並んでいる。だから、上の段を端から見ていけば、見出しを全部拾える。次の手順ではこの性質を使う。

**`lib-or-util.mdx` の表が `p` になっている** — 本文の `| TH | TH |` は表のつもりで書かれているが、木では段落（`p`）になっている。表は Markdown の拡張（GFM）の書き方で、それを読む `remark-gfm` を入れていないためである。この回では直さない。

---

### 手順 5：見出しを集めて、ページへ渡す（この回の本題）

`lib/rehypeCollectHeadings.ts` を、次の全文に書き換える。

```ts
import type { Root } from "hast";
import { toString } from "hast-util-to-string";
import type { VFile } from "vfile";

export type Heading = {
  id: string;
  text: string;
};

declare module "vfile" {
  interface DataMap {
    headings: Heading[];
  }
}

export function rehypeCollectHeadings() {
  return (tree: Root, file: VFile) => {
    const headings: Heading[] = [];

    for (const node of tree.children) {
      if (node.type !== "element" || node.tagName !== "h2") continue;

      const id = node.properties.id;
      if (typeof id !== "string") continue;

      headings.push({ id, text: toString(node) });
    }

    file.data.headings = headings;
  };
}
```

`lib/createPostReader.ts` の `getPost` で、`return` の行を書き換える。

```ts
return { frontmatter, Content, headings: file.data.headings ?? [] };
```

型検査をする。

```bash
bun run typecheck
```

```
Generating route types...
✓ Types generated successfully
```

**作業員は、メモをどこに残すのか** — 作業員の本体は、2つ目の引数に `file` を受け取る。これは 1-1 で `new VFile(...)` として作り、`evaluate` に渡したあの `file` と同じものになる。ベルトコンベアの上を原稿と一緒に流れていく「伝票」のようなもので、`file.data` はその伝票の備考欄にあたる。作業員は見出しの一覧を備考欄に書いて次へ流す。`evaluate` が終わったあと、`getPost` は同じ伝票の備考欄を読む。

じつは、この備考欄は 1-1 から使っていた。`matter(file, { strip: true })` は frontmatter を読んで、`file.data.matter` に書き込んでいた。今回は、自分の作業員が同じ欄に書き込む側に回った。

```
getPost
  ├ new VFile(...)         伝票を作る
  ├ matter(file)           備考欄に matter を書く   ← 1-1 から
  ├ evaluate(file, ...)    ベルトコンベアに流す
  │    ├ rehypeSlug              h2 に id を書く
  │    ├ rehypeCollectHeadings   備考欄に headings を書く  ← 今回
  │    └ rehypeShiki             pre に色を付ける
  └ file.data.headings     備考欄を読む
```

**ループの中の2つの `continue`** — 1つ目は「`h2` でなければ飛ばす」、2つ目は「`id` が文字でなければ飛ばす」。`node.properties.id` は、型の上では文字列のほかに数や配列のこともありうる。`typeof` で確かめると、その下の行で `id` が `string` として扱えるようになる。

**`toString(node)` を使う理由** — 見出しの中身は、文字だけとは限らない。`## **MDX** の書き方` なら、`h2` の下に `strong` の枝があり、その下に `MDX` の文字がある。`toString` は枝を全部たどって、`MDX の書き方` のように文字だけをつなげて返す。

**`declare module "vfile"` は何をしているのか** — 備考欄（`file.data`）は何でも書ける欄として作られている。そのままだと、TypeScript は `file.data.headings` に何が入っているかを知らない。`declare module` は、vfile の型に「備考欄には `headings` という欄もあり、中身は `Heading[]` だ」という貼り紙を足す書き方になる。vfile-matter も同じ書き方で `matter` の欄を足している。貼り紙を外すとどうなるかは、手順 8 で見る。

**`?? []` を付ける理由** — 貼り紙は「この欄があるかもしれない」という意味で、必ずあるとは言っていない。プラグインを外し忘れたときなどに `undefined` が返らないよう、空の配列で受けておく。

---

### 手順 6：記事ページに目次を出す

`app/posts/[slug]/page.tsx` を2か所書き換える。

1つ目。`post` から取り出す名前に `headings` を足す。

```tsx
const { frontmatter, Content, headings } = post;
```

2つ目。タグの `</ul>` と `<hr />` のあいだに、目次を足す。

```tsx
      </ul>
      {headings.length > 0 && (
        <nav aria-label="目次">
          <ol>
            {headings.map(({ id, text }) => (
              <li key={id}>
                <a href={`#${id}`}>{text}</a>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <hr />
```

ビルドして、目次の HTML を抜き出す。

```bash
bun run build
grep -o '<nav.*</nav>' .next/server/app/posts/hello.html
grep -o '<nav.*</nav>' .next/server/app/posts/lib-or-util.html
```

```
<nav aria-label="目次"><ol><li><a href="#こんにちは">こんにちは</a></li><li><a href="#コードの例">コードの例</a></li></ol></nav>
<nav aria-label="目次"><ol><li><a href="#注意点">注意点</a></li><li><a href="#libとutilの違い">libとutilの違い</a></li></ol></nav>
```

**タグの選び方** — `<nav>` は「このページの中の道案内」を表すタグで、`aria-label="目次"` を付けると、画面読み上げソフトが「目次、ナビゲーション」と読み上げる。項目には順番に意味があるので、`<ul>`（順番のない一覧）ではなく `<ol>`（順番のある一覧）を使った。

**画面で確かめる（未確認）** — 次のコマンドで開発サーバーを動かし、ブラウザで `http://localhost:3000/posts/hello` を開く。目次の「コードの例」を押して、その見出しまで画面が動き、URL の終わりが `#コードの例` になることを確かめる。記事が短く画面に収まってしまうときは、ウィンドウの高さを縮めると動きが見える。止めるときは `Ctrl+C` を押す。

```bash
bun dev
```

---

### 手順 7：プラグインの順番を入れ替えて、目次が消えるのを見る

`lib/createPostReader.ts` の `rehypePlugins` で、`rehypeSlug` と `rehypeCollectHeadings` の行を入れ替える。

```ts
        rehypePlugins: [
          rehypeCollectHeadings,
          rehypeSlug,
```

```bash
bun run build
grep -o '<nav.*</nav>' .next/server/app/posts/hello.html
grep -o '<h2[^>]*>[^<]*' .next/server/app/posts/hello.html
```

1つ目の `grep` は何も出さない。2つ目は手順 3 と同じ結果を出す。

```
<h2 id="こんにちは">こんにちは
<h2 id="コードの例">コードの例
```

見出しの `id` は付いているのに、目次だけが消えた。エラーは出ない。

**何が起きたのか** — ベルトコンベアの作業員は、並んだ順に仕事をする。集める係が先に立つと、流れてきた `h2` にはまだ住所が書かれていない。手順 5 の2つ目の `continue` で全部飛ばされ、備考欄には空の一覧が残る。そのあとで住所の係が `id` を書くので、HTML だけを見ると正しく見える。

`rehypePlugins` が配列（順番のある入れ物）なのはこのためで、順番そのものが設定の一部になっている。Shiki をいちばん後ろに置いているのも、色付けの前に見出しの仕事を済ませておくためである。

確かめたら、`rehypeSlug` が先になるように戻し、ビルドで目次が出ることを確かめる。

```bash
bun run build
grep -o '<nav.*</nav>' .next/server/app/posts/hello.html
```

---

### 手順 8：型の貼り紙を外して、型検査が止まるのを見る

`lib/rehypeCollectHeadings.ts` から、`declare module "vfile" { ... }` の5行を消す。

```bash
bun run typecheck
```

```
app/posts/[slug]/page.tsx(35,17): error TS2339: Property 'length' does not exist on type '{}'.
app/posts/[slug]/page.tsx(38,23): error TS2339: Property 'map' does not exist on type '{}'.
app/posts/[slug]/page.tsx(38,30): error TS7031: Binding element 'id' implicitly has an 'any' type.
app/posts/[slug]/page.tsx(38,34): error TS7031: Binding element 'text' implicitly has an 'any' type.
```

**エラーが書いた側ではなく、使う側に出た** — 貼り紙がないと、`file.data.headings` は「何が入っているか分からないもの」（`unknown`）になる。それに `?? []` を付けると、型は `{}`（何でもありうるもの）になり、`length` も `map` も持っていない扱いになる。プラグインのファイルにも `getPost` にもエラーは出ず、`headings` を使うページで初めて止まった。

貼り紙を書く場所と、困る場所は離れている。プラグインを別の場所へ持っていくときは、貼り紙も一緒に運ぶ必要がある。だから貼り紙は書き込む側のプラグインのファイルに置いた。

確かめたら5行を戻し、型検査が通ることを確かめる。

```bash
bun run typecheck
```

---

### 手順 9：コミットする

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
git status
git add package.json bun.lock lib/rehypeCollectHeadings.ts lib/createPostReader.ts "app/posts/[slug]/page.tsx"
git commit -m "feat: 記事の見出しから目次を作り、見出しへ飛べるようにする

長い記事でも、読みたい節へ1回で飛べるようにするため。見出しを集める
処理は rehype のプラグインとして自分で書き、Next.js に依存させない。
既製の remark-toc は原稿に目次の見出しを書く方式で、Zenn・Qiita へ
配る原稿にもその見出しが残るので採らない。"
```

---

### うまくいかないとき

上の4行は実際に出たもの。下の2行は起きると予想されるもので、文面は確かめていない。

| 症状                                                               | 原因と対処                                                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| ビルドは通るのに、`<nav>` が HTML にない                           | `rehypeCollectHeadings` が `rehypeSlug` より前にある。手順 7 のとおり順番を戻す       |
| `Property 'length' does not exist on type '{}'.`                   | `declare module "vfile"` の5行がない。手順 5 の全文と見比べる                         |
| ビルドの出力に `[ 'h2', 'text', ... ]` の配列が出続ける            | 手順 4 の `console.log` が残っている。手順 5 の全文に書き換える                       |
| 同じ文字の見出しが2つあると、2つ目の `id` が `コードの例-1` になる | `rehype-slug` の決まりで、正常な動き。住所が重ならないように番号を足している          |
| `Cannot find module 'hast-util-to-string'`（未確認）               | 手順 2 のインストールが終わっていない。`bun add hast-util-to-string@3.0.1` をやり直す |
| `bun add` が版を見つけられずに止まる（未確認）                     | 公開から3日たっていない版を指定している。チケットに書いた版をそのまま使う             |

ここに載っていないエラーが出たら、そのまま貼って聞いてほしい。

---

## 受け入れ条件

- [x] `package.json` に `rehype-slug` 6.0.0 と `hast-util-to-string` 3.0.1 が `dependencies`、`@types/hast` 3.0.5 が `devDependencies` に、`^` なしで入っている
- [x] `lib/rehypeCollectHeadings.ts` があり、`console.log` が残っていない
- [x] `bun run build` が通り、`.next/server/app/posts/hello.html` の `h2` に `id="こんにちは"` と `id="コードの例"` が付いている
- [x] `.next/server/app/posts/hello.html` に `<nav aria-label="目次">` があり、`#こんにちは` と `#コードの例` へのリンクがこの順で並んでいる
- [x] プラグインの順番を入れ替えると、エラーなしで目次だけが消えることを自分で確かめた
- [x] ブラウザで目次の項目を押すと、その見出しまで画面が動くことを自分で確かめた
- [x] `bun run typecheck` と `bun run lint` がエラーなしで終わる

## この回で理解したこと

着手後に埋める。動いたか（受け入れ条件）とは別に、何が分かったかを残す。

- [x] MDX の原稿が、どの順で、どんな形に変わりながら HTML になるかを説明できる
- [x] rehype のプラグインが「作業員を返す関数」になっている理由を、Shiki の設定と結びつけて説明できる
- [x] プラグインの順番を入れ替えると、なぜエラーなしで目次だけが消えるのかを説明できる
- [x] プラグインが集めた見出しが、`file.data` を通ってページまで届く流れを説明できる
- [x] `declare module "vfile"` を外したとき、なぜ使う側のページでエラーが出たのかを説明できる

## 参考

- rehype-slug: https://github.com/rehypejs/rehype-slug
- hast-util-to-string: https://github.com/rehypejs/rehype-minify/tree/main/packages/hast-util-to-string
- hast の仕様（木の形）: https://github.com/syntax-tree/hast
- unified のプラグインの書き方: https://unifiedjs.com/learn/guide/create-a-rehype-plugin/
- vfile の `DataMap` の拡張: https://github.com/vfile/vfile#datamap
- MDX の `evaluate`: https://mdxjs.com/packages/mdx/#evaluatefile-options
- 前の回: `tickets/1-5-tags.md`
