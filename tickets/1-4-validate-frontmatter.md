# 1-4: 原稿の frontmatter を Valibot で検査し、書き間違いをファイル名つきのエラーでビルド時に止める

- 起票日: 2026-11-03
- 学習計画: まだない（設計の全体像は `docs/design/20260925-blog-design-proposal.md`）
- ステータス: 完了

## 全体のどこか

「記事を表示する」までの段のうち、4段目にあたる。いま決まっている段はここまで。

| Step | 内容                                                   | 進捗           |
| ---- | ------------------------------------------------------ | -------------- |
| 1-1  | 記事1本を `/posts/[slug]` に表示する                   | ■■■ 完了       |
| 1-2  | `/posts` に記事の一覧を出す                            | ■■■ 完了       |
| 1-3  | Shiki でコードブロックに色を付ける                     | ■■■ 完了       |
| 1-4  | Valibot で frontmatter の中身を検査し、`as` を取り除く | ■□□ ← いまここ |

このチケットは 1-3 を完了してコミットしたあとの状態から始める。

## 作るもの

| パス（リポジトリ直下から） | 中身                                                                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/createPostReader.ts`  | `MyFrontmatter` 型と `as` を消し、Valibot の schema で frontmatter を検査する。`getPost` の `catch` を「ファイルがないとき」だけに絞る |

依存パッケージを1つ足す（`valibot`）。

検査を確かめるために、壊れた原稿（`content/a-draft.mdx`、`content/bad-date.mdx`）を一時的に作る。どちらも確かめたら消すので、コミットには入らない。

今回は扱わないもの: `tags` や `description` など新しい項目の追加、日付を `Date` に変換すること、Zenn・Qiita 向けの項目、エラー文の日本語化。

## なぜこれをやるか

1-2 で、原稿の書き間違いが画面まで素通りするのを2回見た。

- frontmatter がコードブロックに入った `lib-or-util.mdx` は、一覧に空の行として出た
- frontmatter のない `a-draft.mdx` は `TypeError: Cannot read properties of undefined (reading 'localeCompare')` でビルドを落とした。ただし落ちるかどうかはファイル名の順番しだいだった

どちらも原因は `file.data.matter as MyFrontmatter` の1行にある。`as` は「中身はこの形のはず」という人間の約束で、TypeScript は中身を確かめない。この回では、約束を「実際に開けて確かめる」処理に置き換える。

ADR `20260925-1914-unified-content-pipeline.md` は、Zod 込みの Velite を「仕組みを自分で理解したい」という理由で見送り、「frontmatter の型検査が欲しくなったら再検討する」と書いていた。今がその時点にあたる。検査だけを Valibot で自前の流れに足す。

これから原稿の本数が増え、Zenn・Qiita への変換も frontmatter を読むようになる。入口で一度確かめておけば、その先の処理は「`title` と `date` は必ずある」と信じて書ける。

## 周辺知識

### 現時点のバージョン（2026-11-03 確認）

| パッケージ | バージョン | 役割                                                       |
| ---------- | ---------- | ---------------------------------------------------------- |
| `valibot`  | 1.5.0      | 値が決めた形どおりかを確かめ、合っていればその型で返す道具 |

1.5.0 の公開は 2026-09-09 で、`bunfig.toml` の `minimumReleaseAge`（公開から3日）に引っかからない。

### この回で使う Valibot の関数（1.5.0 の型定義で確認）

| 書き方                    | 意味                                                             |
| ------------------------- | ---------------------------------------------------------------- |
| `v.object({ ... })`       | 決まったキーを持つオブジェクト                                   |
| `v.string()`              | 文字列                                                           |
| `v.pipe(v.string(), ...)` | 文字列であることを確かめたあと、続けて条件を足す                 |
| `v.nonEmpty()`            | 空でない                                                         |
| `v.isoDate()`             | `yyyy-mm-dd` の形。`2026-02-31` のような存在しない日は見分けない |
| `v.parse(schema, 値)`     | 確かめて、だめなら `ValiError` を投げる                          |
| `v.safeParse(schema, 値)` | 確かめて、結果を `{ success, output, issues }` で返す。投げない  |
| `v.summarize(issues)`     | 問題の一覧を人が読める複数行の文字列にする                       |

### 実測したこと

2026-11-03、macOS / Node v26.13.0 / bun 1.4.4 / Next.js 16.4.1 / valibot 1.5.0 で、1-3 のコミット（`3af75ed`）を一時ディレクトリに複製して確かめた。

- ハンズオンの各段階で `bun run build` と `bunx tsc --noEmit` が通る（壊れた原稿を置いた段階は、ビルドが落ちるのが期待どおり）
- エラー文と `bun -e` の出力は実際に出たものを写した
- `date: 2026-09-25` は YAML として読んだあとも文字列の `"2026-09-25"` のまま。`Date` にはならない
- `v.object` は、schema にないキー（たとえば書き間違えた `titel`）をエラーにせず、結果から落とす
- 完成形を `bunx oxfmt` で整形した結果をそのまま載せた

**未確認**: `bun dev` で開いたときの表示。今回の確かめはすべて `bun run build` の出力と `bun -e` で行った。

## 作業手順（全体の地図）

1. 作業用のブランチを切る
2. `valibot` を入れる
3. `as` を `v.parse` に置き換える
4. frontmatter のない原稿で、ビルドが同じエラーで止まるのを見る（**この回の本題**）
5. 記事ページの `catch` がエラーを握りつぶしているのを見て、絞る
6. エラー文にファイル名を入れる
7. 中身の形まで検査する
8. コミットする

## 確認事項

- [ ] **検査の道具に何を使うか。** 推奨案「計画どおり Valibot」で作成。理由は関数を組み合わせて schema を書く作りで、今回使う部品が少なく、何をしているかが追いやすいから。ただし、日本語の解説記事は Zod のほうがずっと多い。困ったときに検索で見つかる情報は Zod より少ない
- [ ] **schema をどこに置くか。** 推奨案「`lib/createPostReader.ts` の中に置き、外に出さない」で作成。理由はfrontmatter を読むのは今このファイルだけだから。ただし、GitHub Actions で Zenn・Qiita 向けに変換するときも同じ形を確かめたくなる。そのときは schema を別のファイルに移して共有する
- [ ] **どこまで検査するか。** 推奨案「`title` は空でない文字列、`date` は `yyyy-mm-dd` の文字列」で作成。理由は1-2 で決めた「日付は固定の桁数で書き、文字列のまま並べる」を、人の注意ではなくコードで守れるから。ただし、`2026-02-31` のような存在しない日は通る。時刻つきの `2026-11-03T10:00` も弾かれるので、時刻を書きたくなったら schema を直す
- [ ] **schema にないキーを許すか。** 推奨案「許す（`v.object`）」で作成。理由はZenn・Qiita 向けの項目をあとで足すとき、原稿を先に書いても止まらないから。ただし、`titel` のような書き間違いもエラーにならずに無視される（実測済み）。`title` もなければ「`title` がない」で止まるが、両方あれば気づけない。厳しくしたいなら `v.strictObject` に変えると、`Invalid key: Expected never but received "titel"` で止まる
- [ ] **検査に失敗したとき、どう知らせるか。** 推奨案「`v.safeParse` で結果を受け取り、ファイル名と `v.summarize` の結果を入れた `Error` を投げる」で作成。理由は`v.parse` のままだとどの原稿が壊れているかがエラー文から分からないから（手順 4 で実測）。ただし、自分で書いた日本語の1行目と、Valibot の英語の説明が混ざる
- [ ] **エラー文に入れるのはファイル名だけか、フルパスか。** 推奨案「`a-draft.mdx` のようにファイル名だけ」で作成。理由はフルパスには `/Users/<名前>/...` が入り、ビルドのログやチケットに貼ったときに手元のユーザー名が残るから。ただし、原稿の置き場所を複数に分けたら、どこのファイルかが分からなくなる
- [ ] **`getPost` の `catch` を絞ってよいか。** 推奨案「ファイルがないとき（`ENOENT`）だけ `null` を返し、それ以外は投げ直す」で作成。理由は今の `catch` が検査の失敗まで飲み込み、壊れた原稿の記事ページが黙って 404 になるから（手順 5 で実測）。ただし、MDX の書き間違いのように、これまで 404 で済んでいた失敗もビルドを止めるようになる。見落としに気づける一方で、下書きを1本壊すとサイト全体がビルドできなくなる
- [ ] **【標準ルールからの逸脱】TDD を適用しない。** 本人の判断（2026-11-03）による

## ハンズオン

ここに出てくるコマンドの出力とエラー文は、実際に動かして写したもの（2026-11-03、bun 1.4.4 / Next.js 16.4.1 / valibot 1.5.0）。

---

### 準備：この回で何をするのか

`lib/createPostReader.ts` の `as MyFrontmatter` を消し、その代わりに Valibot で frontmatter の中身を確かめる。壊れた原稿を2本わざと作り、1-2 ではばらばらだった壊れ方が、どちらも「どのファイルの、どの項目が、どう違うか」を言うエラーでビルド時に止まるようにする。

#### `as` と検査の違い

荷物の受け取りにたとえる。`as` は、届いた段ボールに「中身: りんご」と自分で書いた札を貼るだけの作業にあたる。箱は開けない。空箱でも札は貼れるし、その先の工程は札を信じてりんごを取り出そうとする。1-2 で見た空の行と `TypeError` は空箱からりんごを取り出そうとした結果だった。

**検査**（バリデーション）は箱を開けて中身を確かめる作業になる。りんごが入っていれば「りんごの箱」として次に回し、入っていなければその場で止める。

#### schema とは

**schema**（スキーマ）は検査に使う「正しい中身の見本」のこと。「`title` は空でない文字列、`date` は `yyyy-mm-dd`」という見本を一度書くと、Valibot はそれを使って箱を開ける。TypeScript の型も同じ見本から作られるので、見本と型を別々に書いて食い違うことがなくなる。

#### 用意するもの

- 1-3 を完了してコミットした状態のリポジトリ
- ターミナルを1つ

---

### 手順 1：作業用のブランチを切る

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
git switch feat/1-3-shiki-highlight
git status
git switch -c feat/1-4-validate-frontmatter
```

`git status` で `nothing to commit, working tree clean` と出ることを確かめてから、最後の行を実行する。

**なぜ** — 1-1 から 1-3 の作業は、まだ `main` に入っていない。1-3 のブランチから切ると、Shiki を差し込んだあとの `createPostReader` を引き継げる。

---

### 手順 2：`valibot` を入れる

```bash
bun add valibot
```

出力の中に次の行がある。

```
installed valibot@1.5.0
```

`package.json` の `dependencies` に `"valibot": "1.5.0"` が `^` なしで入る（`bunfig.toml` の `exact = true` による）。

**なぜ `dependencies` なのか** — 検査はビルドの中だけでなく、`/posts/[slug]` に知らない slug でアクセスされたときにもサーバーで動く。実行時に要るものなので、開発用の `devDependencies` ではなく `dependencies` に入れる。

---

### 手順 3：`as` を `v.parse` に置き換える

`lib/createPostReader.ts` を3か所書き換える。

1つ目。`import` の並びに Valibot を足す。`vfile` の行の次に置く。

```ts
import { VFile } from "vfile";
import * as v from "valibot";
import { matter } from "vfile-matter";
```

2つ目。`type MyFrontmatter = { ... };` の4行を、次の schema に置き換える。

```ts
const FrontmatterSchema = v.object({
  title: v.string(),
  date: v.string(),
});
```

3つ目。`readPostFile` の中の `as` の行を置き換える。

```ts
// 前
const frontmatter = file.data.matter as MyFrontmatter;
// 後
const frontmatter = v.parse(FrontmatterSchema, file.data.matter);
```

型検査とビルドを通す。

```bash
bunx tsc --noEmit
bun run build
```

`tsc` は何も出さずに終わり、ビルドの表には今までどおり `○ /posts/hello` と `○ /posts/lib-or-util` が出る。

**`MyFrontmatter` を消しても型エラーにならない理由** — `v.parse` は、検査に通った値を「schema どおりの型」として返す。`FrontmatterSchema` から `{ title: string; date: string }` という型が自動で作られ、`frontmatter.title` は今までどおり `string` として扱える。型を手で書く場所が1つ減り、見本（schema）と型が食い違う心配もなくなった。

**`import * as v` と書く理由** — Valibot は `object`・`string`・`parse` のように短い名前の関数をたくさん持っている。`v.` を付けて呼ぶと、どれが Valibot の関数かがひと目で分かり、自分の変数名ともぶつからない。公式ドキュメントもこの書き方を使っている。

---

### 手順 4：frontmatter のない原稿で、ビルドが同じエラーで止まるのを見る（この回の本題）

1-2 の手順 4 と同じ、frontmatter のない原稿を足す。

```bash
printf 'まだ書きかけ\n' > content/a-draft.mdx
bun run build
```

ビルドが次のエラーで止まる（出力の一部）。

```
Error occurred prerendering page "/posts". Read more: https://nextjs.org/docs/messages/prerender-error
Error [ValiError]: Invalid key: Expected "title" but received undefined
    at b (lib/createPostReader.ts:25:25)
    ...
> 25 |     const frontmatter = v.parse(FrontmatterSchema, file.data.matter);
     |                         ^
```

その下に `issues: [ ... ]` が続き、`"title"` と `"date"` の2つが足りないと書かれている。行番号は改行の入れ方でずれる。

**1-2 と比べて何が変わったか**

|                    | 1-2（`as`）                                              | 1-4（`v.parse`）                          |
| ------------------ | -------------------------------------------------------- | ----------------------------------------- |
| 止まる場所         | 並べ替えの `localeCompare`                               | 原稿を読んだ直後の `v.parse`              |
| エラー文           | `Cannot read properties of undefined`                    | `Expected "title" but received undefined` |
| ファイル名との関係 | 名前の順番しだいで、落ちたりエラーなしで先頭に出たりする | 名前に関係なく、必ず止まる                |

1-2 のエラーは「壊れた値を使おうとした場所」で起きていた。読み手は `localeCompare` から原稿の書き間違いまで、自分で遡る必要があった。今回は「壊れた値が入ってきた場所」で止まり、エラー文がそのまま原因を言っている。

**この発見がどこに効くか** — 「外から入ってくる値は、入口で一度だけ確かめる」という考え方は、原稿に限らない。フォームの入力、API の返事、環境変数、URL の slug も、TypeScript の外からやってくる値で、型はただの約束にすぎない。入口で確かめておけば、その奥のコードは `undefined` を心配せずに書ける。`getPost` の先頭にある `SLUG_PATTERN.test(slug)` も、実は同じ考え方の小さな版だった。

**残っている問題** — エラー文に、どの原稿が壊れているかが書かれていない。`/posts` のページを作るときに落ちたことは分かるが、原稿が100本あったら探すのは大変になる。手順 6 で直す。`a-draft.mdx` は手順 6 まで置いたままにする。

---

### 手順 5：記事ページの `catch` がエラーを握りつぶしているのを見て、絞る

#### 5-a：`getPost` が何を返しているかを見る

ビルドは `/posts`（一覧）で止まった。では記事ページ `/posts/a-draft` のほうはどうなっているのか。`getPost` を直接呼んで確かめる。

```bash
bun -e 'import { createPostReader } from "./lib/createPostReader"; const { getPost } = createPostReader("content"); console.log(await getPost("a-draft")); console.log(await getPost("no-such-post"))'
```

```
null
null
```

壊れた原稿 `a-draft` も、存在しない記事 `no-such-post` も、同じ `null` が返ってきた。

**なぜ区別できないのか** — `getPost` は `try { ... } catch { return null; }` で囲まれている。この `catch` は中で起きたエラーを種類を問わず受け止め、`null` に変えてしまう。ページの側は `null` を受け取ると `notFound()` で 404 を出す。一覧ページがなければ、壊れた原稿は「なぜか 404 になる記事」としてエラーを出さずにビルドを通り抜けていた。せっかく手順 4 で入口に置いた検査が、記事ページでは働いていない。

#### 5-b：ファイルがないときだけ `null` にする

`getPost` の `catch` はもともと「存在しない slug でアクセスされたら 404 にする」ためにあった。そのときに起きるのは、ファイルが見つからないというエラーだけになる。そこで、そのエラーだけを `null` に変え、ほかは投げ直す。

`lib/createPostReader.ts` の `createPostReader` 関数の上（`FrontmatterSchema` の下）に、次の関数を足す。

```ts
function isFileNotFound(error: unknown) {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
```

`getPost` の `catch` を書き換える。

```ts
// 前
    } catch {
      return null;
    }
// 後
    } catch (error) {
      if (isFileNotFound(error)) return null;
      throw error;
    }
```

もう一度、`getPost` を直接呼ぶ。

```bash
bun -e 'import { createPostReader } from "./lib/createPostReader"; const { getPost } = createPostReader("content"); console.log(await getPost("no-such-post")); console.log(await getPost("a-draft"))'
```

```
null
...
ValiError: Invalid key: Expected "title" but received undefined
```

存在しない記事は今までどおり `null`、壊れた原稿はエラーになった（間にソースコードの抜粋が数行出る）。

**`ENOENT` とは** — Node.js がファイルを開こうとして見つからなかったときに、エラーに付ける記号。「Error NO ENTry（その名前の項目がない）」の略で、Unix の時代から使われている名前になる。エラーの文面は環境や言語で変わりうるが、この記号は変わらないので、判定にはこちらを使う。

**`"code" in error` を挟む理由** — `Error` 型そのものには `code` という項目がない。`"code" in error` で「`code` を持っている」と確かめてから読むと、TypeScript も `error.code` を読んでよいと判断する。`as` を使わずに型を絞る書き方で、この回の主題と同じ考え方になる。

---

### 手順 6：エラー文にファイル名を入れる

`readPostFile` の `v.parse` の行と、その次の `return` の行を、次の6行に置き換える。

```ts
const result = v.safeParse(FrontmatterSchema, file.data.matter);
if (!result.success) {
  throw new Error(`${slug}.mdx の frontmatter が正しくありません\n${v.summarize(result.issues)}`);
}
return { file, frontmatter: result.output };
```

ビルドする。`content/a-draft.mdx` は手順 4 から置いたまま。

```bash
bun run build
```

```
Error occurred prerendering page "/posts/a-draft". Read more: https://nextjs.org/docs/messages/prerender-error
Error: a-draft.mdx の frontmatter が正しくありません
× Invalid key: Expected "title" but received undefined
  → at title
× Invalid key: Expected "date" but received undefined
  → at date
```

どのファイルの、どの項目が、どう違うかが、エラー文だけで分かるようになった。止まったページが `/posts` から `/posts/a-draft` に変わったのは、手順 5 で記事ページも止まるようになったからで、どちらが先に報告されるかはビルドの並び順で決まる。

**`v.parse` と `v.safeParse` の違い** — `v.parse` は、だめなら自分で例外を投げる。手軽だが、投げる文面は Valibot が決める。`v.safeParse` は投げずに結果を返すので、失敗したときに何を言うかを自分で決められる。今回はファイル名を足したかったので、こちらに切り替えた。成功したときの値は `result.output` に入っていて、型は `v.parse` の戻り値と同じになる。

**`v.summarize` の役割** — `result.issues` は、問題1件ごとの細かい情報（`kind`・`expected`・`path` など）が並んだ配列になっている。そのまま出すと手順 4 のように長くなるので、`v.summarize` で「何がどこで違うか」だけの読みやすい形にまとめている。

確かめたら、足した原稿を片付けてビルドが通ることを確認する。

```bash
TRASH=~/.claude/delete/$(date +%Y%m%d-%H%M)
mkdir -p "$TRASH"
mv content/a-draft.mdx "$TRASH"/
bun run build
```

---

### 手順 7：中身の形まで検査する

#### 7-a：形の崩れた日付が素通りするのを見る

今の schema は「文字列であること」しか確かめていない。日付の書き方を崩した原稿を足す。

```bash
printf -- '---\ntitle: 日付の書き間違い\ndate: 2026/9/1\n---\n\n本文\n' > content/bad-date.mdx
bun run build
grep -o '<main>.*</main>' .next/server/app/posts.html
```

ビルドは通る。一覧の HTML は次のとおり。

```
<main><h1>記事一覧</h1><ul><li><time dateTime="2026/9/1">2026/9/1</time><a href="/posts/bad-date">日付の書き間違い</a></li><li><time dateTime="2026-11-02">2026-11-02</time><a href="/posts/lib-or-util">libとutilの使い分けルール</a></li><li><time dateTime="2026-09-25">2026-09-25</time><a href="/posts/hello">はじめての記事</a></li></ul></main>
```

9月1日の記事が11月2日の記事より上に来ている。

**なぜ一番上に来たのか** — 1-2 で決めたとおり、日付は文字列のまま比べている。文字列の比較は1文字ずつ前から行う。`2026` までは同じで、5文字目が `/` と `-` になる。文字の番号では `/` が `-` より大きいので、`2026/9/1` が「新しい日付」とみなされた。1-2 の確認事項で「桁を省いて書くと順番が崩れる」と書いた欠点が、実際に起きた形になる。

#### 7-b：`title` と `date` に条件を足す

`FrontmatterSchema` を次のように書き換える。

```ts
const FrontmatterSchema = v.object({
  title: v.pipe(v.string(), v.nonEmpty()),
  date: v.pipe(v.string(), v.isoDate()),
});
```

ビルドする。

```bash
bun run build
```

```
Error occurred prerendering page "/posts/bad-date". Read more: https://nextjs.org/docs/messages/prerender-error
Error: bad-date.mdx の frontmatter が正しくありません
× Invalid date: Received "2026/9/1"
  → at date
```

**`v.pipe` とは** — 工場の検品ラインのように、検査を左から順に通す書き方。`v.pipe(v.string(), v.isoDate())` は「まず文字列か確かめ、通ったら `yyyy-mm-dd` の形か確かめる」という意味になる。文字列でなければ、2つ目の検査には進まない。

**これで何が守られたか** — 「日付は固定の桁数で書く」は、1-2 では人が気をつけるだけの決まりだった。今はコードが守る決まりになった。決まりを破った原稿は一覧の並びを崩す前にビルドで止まる。

#### 7-c：タイトルを空にしてみる（任意）

`content/bad-date.mdx` を次の内容にして、ビルドする。

```bash
printf -- '---\ntitle: ""\ndate: 2026-09-01\n---\n\n本文\n' > content/bad-date.mdx
bun run build
```

```
Error: bad-date.mdx の frontmatter が正しくありません
× Invalid length: Expected !0 but received 0
  → at title
```

`Expected !0` は「長さが0でないこと」を求めている、という意味になる。`title:` の後ろに何も書かなかった場合は、YAML が空の値を `null` として読むので、`Invalid type: Expected string but received null` になる。

確かめたら、原稿を片付けてビルドが通ることを確認する。

```bash
TRASH=~/.claude/delete/$(date +%Y%m%d-%H%M)
mkdir -p "$TRASH"
mv content/bad-date.mdx "$TRASH"/
bun run build
bunx tsc --noEmit
```

ビルドの表に `○ /posts/hello` と `○ /posts/lib-or-util` が出て、`tsc` は何も出さずに終わる。

#### 完成形

`lib/createPostReader.ts`:

```ts
import { evaluate } from "@mdx-js/mdx";
import rehypeShiki from "@shikijs/rehype";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import * as runtime from "react/jsx-runtime";
import { VFile } from "vfile";
import * as v from "valibot";
import { matter } from "vfile-matter";

const SLUG_PATTERN = /^[a-z0-9-]+$/;

const FrontmatterSchema = v.object({
  title: v.pipe(v.string(), v.nonEmpty()),
  date: v.pipe(v.string(), v.isoDate()),
});

function isFileNotFound(error: unknown) {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

export function createPostReader(contentDir: string) {
  async function readPostFile(slug: string) {
    const filePath = path.join(contentDir, `${slug}.mdx`);
    const file = new VFile({
      path: filePath,
      value: await readFile(filePath, "utf8"),
    });
    matter(file, { strip: true });
    const result = v.safeParse(FrontmatterSchema, file.data.matter);
    if (!result.success) {
      throw new Error(
        `${slug}.mdx の frontmatter が正しくありません\n${v.summarize(result.issues)}`,
      );
    }
    return { file, frontmatter: result.output };
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
    } catch (error) {
      if (isFileNotFound(error)) return null;
      throw error;
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
    return posts.toSorted((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));
  }

  return { getPost, getAllSlugs, getAllPosts };
}
```

---

### 手順 8：コミットする

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
git status
git add lib/createPostReader.ts package.json bun.lock
git commit -m "feat: 原稿の frontmatter を Valibot で検査する

as で型を約束するだけでは、frontmatter の書き間違いが一覧の空行や
ファイル名しだいの TypeError として素通りしていたため。読み込んだ直後に
検査し、ファイル名つきのエラーでビルドを止める。記事ページの catch が
検査の失敗まで 404 に変えていたので、ファイルがないときだけに絞った。"
```

`git status` に `content/a-draft.mdx` や `content/bad-date.mdx` が出たら、手順 6・7 の片付けが済んでいない。`mv` で移してから `git add` する。

---

### うまくいかないとき

上の4行は実際に出たもの。下の2行は起きると予想されるもので、文面は確かめていない。

| 症状                                                             | 原因と対処                                                                                                                           |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `Error occurred prerendering page "/posts/..."` でビルドが止まる | 原稿のどれかが壊れている。すぐ下の行の `〜.mdx の frontmatter が正しくありません` と、その下の `× ...` `→ at ...` を読んで原稿を直す |
| `× Invalid date: Received "..."`                                 | `date` が `yyyy-mm-dd` の形でない。`2026-9-1` のように桁を省いていないか、`/` で区切っていないかを見る                               |
| `× Invalid type: Expected string but received null`              | その項目の値が空になっている。`title:` の後ろに何も書いていないなど                                                                  |
| `Invalid key: Expected "title" but received undefined`           | frontmatter がない、または読めていない。原稿の1行目が `---` になっているかを見る（1-2 の `lib-or-util.mdx` と同じ壊れ方）            |
| `Cannot find module 'valibot'`（未確認）                         | 手順 2 の `bun add` がリポジトリ直下で実行されていない。`package.json` のある場所で入れ直す                                          |
| 存在しない記事の URL を開くと 404 ではなくエラーになる（未確認） | `isFileNotFound` の判定が効いていない。`"ENOENT"` の綴りと、`catch (error)` の `error` を渡しているかを見る                          |

ここに載っていないエラーが出たら、そのまま貼って聞いてほしい。

---

## 受け入れ条件

- [x] `bun run build` が通り、表に `○ /posts/hello` と `○ /posts/lib-or-util` が出る
- [x] `lib/createPostReader.ts` に `as` で型を付けている行がなく、`MyFrontmatter` も残っていない
- [x] `package.json` の `dependencies` に `"valibot": "1.5.0"` がある
- [x] `content/a-draft.mdx` を足すと、ビルドが `a-draft.mdx の frontmatter が正しくありません` で止まることを自分で確かめた
- [x] `date: 2026/9/1` の原稿を足すと、ビルドが `Invalid date` で止まることを自分で確かめた
- [x] `bun -e` で `getPost("no-such-post")` が `null` を返し、壊れた原稿ではエラーになることを自分で確かめた
- [x] `content/` に `a-draft.mdx` と `bad-date.mdx` が残っていない
- [x] `bunx tsc --noEmit` がエラーなしで終わる

## この回で理解したこと

着手後に埋める。動いたか（受け入れ条件）とは別に、何が分かったかを残す。

- [x] `as` と `v.parse` の違いを、「箱を開けるかどうか」の言葉で説明できる
- [x] 1-2 の `TypeError` と今回の `ValiError` で、エラーが起きた場所がどう違い、なぜ今回のほうが原因に早くたどり着けるかを説明できる
- [x] `catch` が何でも `null` に変えていると、なぜ検査が記事ページで働かなくなるのかを説明できる
- [x] schema から型が作られると、型を手で書くより何がうれしいかを言える

## 参考

- Valibot 公式ドキュメント: https://valibot.dev/guides/introduction/
- `safeParse`: https://valibot.dev/api/safeParse/
- `summarize`: https://valibot.dev/api/summarize/
- `isoDate`: https://valibot.dev/api/isoDate/
- Node.js のエラーコード（`ENOENT`）: https://nodejs.org/api/errors.html#common-system-errors
- ADR: `docs/adr/20260925-1914-unified-content-pipeline.md`
- 前の回: `tickets/1-2-list-posts.md`（手順 3・4）
