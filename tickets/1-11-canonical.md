# 1-11: 正式な住所を `www.65banseki.dev` に1つに決め、`vercel.app` に来た人も転送する

- 起票日: 2026-11-04（2026-11-06 に確認事項を決め、`og:url` の手順を足した）
- 学習計画: まだない（設計の全体像は `docs/design/20260925-blog-design-proposal.md`）
- ステータス: 未着手

## 全体のどこか

「記事を表示する」段の11段目にあたる。1-8 で独自ドメインをつないだが、Vercel が最初に付けた `https://65-blog-app.vercel.app` でも同じページが見られる。この回で、正式な住所を1つに決める。

| Step | 内容                                                   | 進捗         |
| ---- | ------------------------------------------------------ | ------------ |
| 1-1  | 記事1本を `/posts/[slug]` に表示する                   | ■■■ 完了     |
| 1-2  | `/posts` に記事の一覧を出す                            | ■■■ 完了     |
| 1-3  | Shiki でコードブロックに色を付ける                     | ■■■ 完了     |
| 1-4  | Valibot で frontmatter の中身を検査し、`as` を取り除く | ■■■ 完了     |
| 1-5  | タグを付け、`/tags` と `/tags/[tag]` を作る            | ■■■ 完了     |
| 1-6  | 見出しから目次を作る                                   | ■■■ 完了     |
| 1-7  | 記事ごとにシェア用の画像を作る                         | ■■■ 完了     |
| 1-8  | Vercel で公開し、ドメインをつなぐ                      | ■■□ 確認待ち |
| 1-9  | サイト全体の名札を整える                               | ■■■ 完了     |
| 1-10 | アクセス解析を入れる                                   | ■■■ 完了     |
| 1-11 | 正式な住所を1つに決める                                | □□□ ← つぎ   |

作業ブランチは作らず、`dev` に直接コミットする。

## 作るもの

| パス（リポジトリ直下から）  | 中身                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------- |
| `app/page.tsx`              | `canonical` と `og:url` を `/` にする                                                                   |
| `app/posts/page.tsx`        | `canonical` と `og:url` を `/posts` にする。`generateMetadata` に書き換え、親のシェア用の画像を引き継ぐ |
| `app/tags/page.tsx`         | `canonical` と `og:url` を `/tags` にする。`generateMetadata` に書き換え、親の画像を引き継ぐ            |
| `app/tags/[tag]/page.tsx`   | `canonical` と `og:url` を `/tags/タグ名` にする。親の画像を引き継ぐ                                    |
| `app/posts/[slug]/page.tsx` | `canonical` と `og:url` を `/posts/記事の名前` にする                                                   |
| `next.config.ts`            | `65-blog-app.vercel.app` に来たリクエストを、`www.65banseki.dev` へ 308 で転送する                      |

今回は扱わないもの: `sitemap.xml`、Google Search Console への登録、日本語のタグ名を URL にしたときの扱い、`canonical` の書き忘れを見つける lint ルール（設計書の「この先の予定」に書いた別の回）。

## なぜこれをやるか

いま、同じ記事が2つの住所で見られる。

- `https://www.65banseki.dev/posts/hello`（正にしたい）
- `https://65-blog-app.vercel.app/posts/hello`（Vercel が最初に付けた住所）

検索エンジンから見ると、同じ中身のページが2つある状態になる。Vercel のガイドによれば、これで罰を受けるわけではないが、評価が2つに割れたり、検索エンジンが `vercel.app` のほうを正式な住所に選んだりすることがある。1-10 で入れたアクセス解析にも、`vercel.app` で開いた訪問が混ざる。

もう1つの狙いは、1-9 で見た「親の値が子に受け継がれる」決まりを、別の項目で確かめることにある。`canonical` をうっかりレイアウトに書くと、全ページが「正式な住所はトップページです」と名乗ってしまう。逆に、子のページで `openGraph` を書き直すと、親から受け継いでいたシェア用の画像が消える。どちらもエラーは出ない。

## 周辺知識

### canonical（出典: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md` の `alternates` と `metadataBase`）

- メタデータの `alternates.canonical` に書くと、`<link rel="canonical" href="...">` が出る
- `/posts` のような相対の値は、`metadataBase`（1-8 で `https://www.65banseki.dev` にした）とつないで完全な URL になる
- `alternates` は入れ子の項目なので、1-9 の `openGraph` と同じく、子が書くと親の値は丸ごと隠れる

### og:url（出典: https://ogp.me の Basic Metadata）

- SNS 向けの「このページの正式な住所」。`openGraph.url` に書くと `<meta property="og:url" ...>` が出る
- ogp.me では、`og:title`・`og:type`・`og:image`・`og:url` の4つを、どのページにも要る基本の項目としている
- `canonical` が検索エンジン向けの札なら、`og:url` は SNS 向けの札にあたる

### `parent`（出典: `generate-metadata.md` の `parent` の説明と、`previousImages` の例）

- `generateMetadata` の2つ目の引数。親（レイアウトなど）で決まったメタデータを受け取れる
- ドキュメントの例は、親の `openGraph.images` を受け取って、子の画像に足している。「置き換えるのではなく、親の値を引き継いで広げる」ための仕組み
- `export const metadata` のような決まった値には、この引数がない。使うには `generateMetadata` に書き換える

### `vercel.app` の住所（出典: Vercel のガイド https://vercel.com/kb/guide/avoiding-duplicate-content-with-vercel-app-urls 、2026-11-04 に確認）

- 同じ中身の住所が2つあっても、自動で罰を受けるわけではない。ただし、評価が割れたり、検索エンジンが別の住所を正式なものに選んだりする
- 勧めているのは、独自ドメインを正にし、`vercel.app` からは住所とクエリを保ったまま**恒久的に**転送する形
- 転送の書き方は3つある。Vercel の Firewall のルール（ダッシュボードで作ると 307 の一時的な転送になる）、`vercel.json`、`next.config` の `redirects`
- プレビューの `vercel.app` の住所には、Vercel が最初から「検索に載せない」印（`X-Robots-Tag: noindex`）を付ける。本番の `65-blog-app.vercel.app` には付かない

### Next.js の `redirects`（出典: `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/redirects.md`）

- `source` に合うリクエストを `destination` へ転送する。`permanent: true` で 308、`false` で 307
- `has` に `{ type: "host", value: "..." }` を書くと、その名前で来たリクエストだけを対象にできる

### 実測したこと

2026-11-04 と 2026-11-06、macOS / bun 1.4.4 / Next.js 16.4.1 で、`dev` の `3c119e8` を一時ディレクトリに複製して確かめた。

- レイアウトに `canonical: "/"` を書くと、全ページの `canonical` がトップページになる。エラーも警告も出ない。レイアウトの `openGraph` に `url: "/"` を書いた場合も同じく、記事ページ以外の `og:url` がすべてトップページになった
- レイアウトに `canonical: "./"` を書くと、各ページの住所に合わせた `canonical` になる。ドキュメントの表（`./` は `https://acme.com` になる）とは違う動きで、Next.js の中身（`node_modules/next/dist/lib/metadata/resolvers/resolve-url.js` の `resolveRelativeUrl`）が `./` で始まる値だけを今のページの住所から解決していた
- 一覧（`/posts`、`/tags`）とタグ（`/tags/mdx`）のページで `openGraph` を書くと、`og:image` が消える。`app/opengraph-image.tsx` の画像は、そのファイルがある階層の `openGraph` にしか差し込まれない（`node_modules/next/dist/lib/metadata/metadata-resolution-primitives.js` の 113 行目から）。トップページはその階層にあり、記事ページは自分の画像を持つので消えない
- `generateMetadata` の `parent` から `openGraph.images` を受け取って渡すと、`og:image` と `twitter:image` が戻る。`/posts` と `/tags` は `generateMetadata` にしても、ビルドの表では `○ (Static)` のままだった
- `has` の `value` は正規表現として扱われ、全体が一致したときだけ転送される。`.` をエスケープしないと、`65-blog-appxvercelxapp` のような名前も転送された
- ホスト名を `65-blog-app.vercel.app` にしたリクエストは、`308` で `https://www.65banseki.dev/posts/hello?ref=zenn` に転送された（パスとクエリが残る）。`www.65banseki.dev` とプレビューのような名前（`65-blog-app-git-dev-hi-lee-mon.vercel.app`）は転送されなかった
- 完成形で `bun run typecheck`・`bun run lint` が通る

転送の確かめは `curl` ではなく、Bun の `fetch` でホスト名を変えて送った。ハンズオンの `curl` の出力は、その結果を `-w` で決めた形に写したもの。

**未確認**: 本番の `https://65-blog-app.vercel.app` が実際に転送されること（デプロイしてから手順 11 で確かめる）。

## 作業手順（全体の地図）

1. `dev` を最新にする
2. いまの `canonical` を見る
3. わざとレイアウトに `canonical: "/"` を書き、全ページがトップページを名乗るのを見る
4. レイアウトに `"./"` を書くとどうなるかを見て、中身を読む（寄り道）
5. ページごとに `canonical` を書く（**この回の本題 その1**）
6. ページごとに `og:url` を書き、一覧とタグのページで画像が消えるのを見る
7. `parent` で親の画像を引き継ぐ（**この回の本題 その2**）
8. `vercel.app` からの転送を `next.config.ts` に書く
9. 手元で、ホスト名を変えたリクエストが転送されるのを見る
10. コミットして push する
11. 本番に出し、`vercel.app` が転送されるのを見る

## 確認事項

- [x] **`canonical` を書く場所。** 推奨案「ページごとに書く」で決定。理由は、Next.js のドキュメントにある一般的な書き方で、どのページが何を名乗るかが各ファイルを見れば分かるから。将来の国際化でページごとに `alternates.languages` を書くようになっても、同じ場所にまとまる。ただし、ページを足すたびに書く必要があり、書き忘れると `canonical` のないページができる（間違った住所を名乗るよりは害が小さい）。書き忘れは、本人の希望で、oxlint の自作ルールで見つける回を別に作る（設計書の「この先の予定」）。手順 4 の「レイアウトに `"./"` を1行」は短く済むが、ドキュメントの表と違う動きに頼ることになるので採らない
- [x] **転送の書き方。** 推奨案「`next.config.ts` の `redirects`」で決定。転送そのものが要るかについては、`canonical` は検索エンジンへの「お願い」で従うとは限らず、本番の `vercel.app` には「検索に載せない」印も付かないので、確実に1つにまとめるために入れる。放っておいても大きな害はないが、設定は数行で済む。書き方の理由は、設定がリポジトリに残って履歴で追え、手元でも動きを確かめられるから。`permanent: true` で 308 の恒久的な転送になり、パスとクエリも残る。ただし、Next.js の設定ファイルに Vercel の住所を書くことになる。ほかのフレームワークへ移るときは書き直しが要る。Vercel の Firewall のルールは、ダッシュボードで作ると 307 の一時的な転送になるので採らない
- [x] **転送するホスト名の書き方。** 推奨案「`65-blog-app\\.vercel\\.app`（`.` をエスケープする）」で決定。理由は、`value` が正規表現として扱われるのを確かめたから。Vercel のガイドの例も同じくエスケープしている。ただし、`\\` が2つ並ぶ見た目が読みにくい
- [x] **`og:url` も足すか。** 本人の判断で「この回で全ページに足し、`parent` で親の画像を引き継ぐ」に決定（推奨案は「今回は足さない」だった）。足してみると一覧とタグのページで画像が消えると分かり、改めて3つの案（全ページに足して `parent` で引き継ぐ／記事ページだけに足す／足さない）から選んだ。理由は、ogp.me が `og:url` を基本の4項目に入れていて一般的な形になり、ドキュメントにある `parent` の使い方も学べるから。ただし、一覧とタグのページを `generateMetadata` に書き換えるので、手順が2つ増える
- [x] **【標準ルールからの逸脱】TDD を適用しない。** 本人の判断（2026-11-03）による。この回は設定値の追加が中心で、確かめるのはビルドした HTML と転送の結果

## ハンズオン

ここに出てくるコマンドの出力は、実際に動かして写したもの（2026-11-04 と 2026-11-06、bun 1.4.4 / Next.js 16.4.1）。手順 9 の `curl` の出力だけは、上の「実測したこと」のとおり `fetch` の結果を写している。

---

### 準備：この回で何をするのか

同じ記事に住所が2つある状態をなくす。やることは2つで、1つ目は各ページに「私の正式な住所はここです」という札（`canonical` と `og:url`）を付けること、2つ目は `vercel.app` に来た人を正式な住所へ送ることだ。

#### canonical は「本店の住所」の札

チェーン店の支店に「本店はこちら」と貼ってあるのと同じだ。検索エンジンは、中身が同じページをいくつも見つけたとき、この札を見て「評価は本店にまとめよう」と決める。札は HTML の `<head>` に1行で書く。

```html
<link rel="canonical" href="https://www.65banseki.dev/posts/hello" />
```

SNS 向けには、同じ役目の札がもう1枚ある。それが `og:url` だ。

```html
<meta property="og:url" content="https://www.65banseki.dev/posts/hello" />
```

札は「お願い」で、検索エンジンが従うとは限らない。だから、確実に1つにまとめたい住所は、手順 8 で転送もする。

#### 用意するもの

- 1-10 を完了してコミットした状態のリポジトリ（`dev`）
- ターミナルを1つ

---

### 手順 1：`dev` を最新にする

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
git switch dev
git pull
git status
```

`nothing to commit, working tree clean` と出ることを確かめる。記事の下書き（`content/` の中の、まだコミットしていないファイル）が `Untracked files` に出ていても、この回では触らない。

**なぜ** — `dev` に直接コミットする流れなので、GitHub の `dev` と手元の `dev` を先にそろえておく。

---

### 手順 2：いまの `canonical` を見る

```bash
bun run build
for p in index posts posts/hello tags tags/mdx; do printf "%-12s " $p; grep -o '<link rel="canonical"[^>]*>' .next/server/app/$p.html || echo "(none)"; done
```

```
index        (none)
posts        (none)
posts/hello  (none)
tags         (none)
tags/mdx     (none)
```

どのページにも `canonical` がない。この回では、この `for` のコマンドを何度も使う。

---

### 手順 3：わざとレイアウトに `canonical: "/"` を書き、全ページがトップページを名乗るのを見る

`app/layout.tsx` の `metadata` の、`description` と `openGraph` の間に足す。「サイトの正式な住所は `/`（トップ）だ」と思って書きがちな形だ。

```tsx
  alternates: {
    canonical: "/",
  },
```

```bash
bun run build
for p in index posts posts/hello tags tags/mdx; do printf "%-12s " $p; grep -o '<link rel="canonical"[^>]*>' .next/server/app/$p.html || echo "(none)"; done
```

```
index        <link rel="canonical" href="https://www.65banseki.dev"/>
posts        <link rel="canonical" href="https://www.65banseki.dev"/>
posts/hello  <link rel="canonical" href="https://www.65banseki.dev"/>
tags         <link rel="canonical" href="https://www.65banseki.dev"/>
tags/mdx     <link rel="canonical" href="https://www.65banseki.dev"/>
```

全ページが「本店はトップページです」と名乗った。エラーも警告も出ない。

**何が起きたのか** — 1-9 の「名札の重ね貼り」の2つ目の決まりだ。子のページは `alternates` を書いていないので、親（レイアウト）の値がそのまま見える。検索エンジンがこの札に従うと、記事ページは「トップページの写し」とみなされ、検索結果に記事が出なくなるおそれがある。

**この失敗が怖い理由** — 1-9 の `og:title` の失敗は、SNS のカードを見れば気づけた。`canonical` は画面にもカードにも出ないので、HTML を見ない限り誰も気づかない。

---

### 手順 4：レイアウトに `"./"` を書くとどうなるかを見て、中身を読む（寄り道）

手順 3 の `"/"` を `"./"` に変える。

```tsx
  alternates: {
    canonical: "./",
  },
```

```bash
bun run build
for p in index posts posts/hello tags tags/mdx; do printf "%-12s " $p; grep -o '<link rel="canonical"[^>]*>' .next/server/app/$p.html || echo "(none)"; done
```

```
index        <link rel="canonical" href="https://www.65banseki.dev"/>
posts        <link rel="canonical" href="https://www.65banseki.dev/posts"/>
posts/hello  <link rel="canonical" href="https://www.65banseki.dev/posts/hello"/>
tags         <link rel="canonical" href="https://www.65banseki.dev/tags"/>
tags/mdx     <link rel="canonical" href="https://www.65banseki.dev/tags/mdx"/>
```

今度は、各ページが自分の住所を名乗った。ところが、ドキュメント（`generate-metadata.md` の URL Composition の表）では、`./` は `https://acme.com`、つまりトップと同じになると書いてある。どちらが正しいのか、中身を読む。

```bash
sed -n 86,92p node_modules/next/dist/lib/metadata/resolvers/resolve-url.js
```

```js
// Resolve with `pathname` if `url` is a relative path.
function resolveRelativeUrl(url, pathname) {
  if (typeof url === "string" && url.startsWith("./")) {
    return _path.default.posix.resolve(pathname, url);
  }
  return url;
}
```

`./` で始まる値だけは、**今のページの住所**（`pathname`）を基準に解決していた。

**どう使うか** — 1行で済むので魅力的だが、ドキュメントと食い違う動きに頼ると、Next.js を上げたときに黙って変わるおそれがある。この回では使わず、手順 5 でページごとに書く（確認事項を参照）。1-8 で `metadataBase` の決まり方を中まで読んだのと同じく、「ドキュメントと動きが違ったら中身を読む」が身につけばよい。

確かめたら、レイアウトに足した `alternates` の3行を消す。

---

### 手順 5：ページごとに `canonical` を書く（この回の本題 その1）

5つのページに、それぞれ自分の住所を書く。

`app/page.tsx` には `metadata` がまだないので、`import` と一緒に足す。

```tsx
import type { Metadata } from "next";
import Link from "next/link";
```

`navs` の下、`export default async function Home` の上に足す。

```tsx
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};
```

`app/posts/page.tsx` と `app/tags/page.tsx` は、1-9 で書いた `metadata` に1行足す。

```tsx
export const metadata: Metadata = {
  title: "記事一覧",
  alternates: { canonical: "/posts" },
};
```

```tsx
export const metadata: Metadata = {
  title: "タグ一覧",
  alternates: { canonical: "/tags" },
};
```

`app/tags/[tag]/page.tsx` は、`generateMetadata` の `return` を書き換える。

```tsx
return {
  title: `タグ: ${tag}`,
  alternates: { canonical: `/tags/${tag}` },
};
```

`app/posts/[slug]/page.tsx` も、`generateMetadata` の `return` に1行足す。

```tsx
return {
  title: post.frontmatter.title,
  alternates: { canonical: `/posts/${slug}` },
  openGraph: {
    ...siteOpenGraph,
    type: "article",
    publishedTime: post.frontmatter.date,
  },
};
```

```bash
bun run build
for p in index posts posts/hello tags tags/mdx; do printf "%-12s " $p; grep -o '<link rel="canonical"[^>]*>' .next/server/app/$p.html || echo "(none)"; done
```

```
index        <link rel="canonical" href="https://www.65banseki.dev"/>
posts        <link rel="canonical" href="https://www.65banseki.dev/posts"/>
posts/hello  <link rel="canonical" href="https://www.65banseki.dev/posts/hello"/>
tags         <link rel="canonical" href="https://www.65banseki.dev/tags"/>
tags/mdx     <link rel="canonical" href="https://www.65banseki.dev/tags/mdx"/>
```

**`/posts` と書いただけで、なぜ `https://www.65banseki.dev/posts` になるのか** — 1-8 でレイアウトに書いた `metadataBase` とつながるからだ。ページには住所の後ろ半分だけを書けばよい。

**なぜ `vercel.app` で開いても `www` を名乗るのか** — `metadataBase` が `www.65banseki.dev` に決め打ちしてあるからだ。`vercel.app` で開いたページも「本店は `www` です」と名乗るので、検索エンジンに正式な住所を伝えられる。1-8 で `metadataBase` を書いた理由の1つが、ここで効いてくる。

**この発見が今後どこに効くか** — 国際化（設計書の「この先の予定」）では、ページごとに `alternates.languages`（「英語版はこちら」の札）を書く。`alternates` は丸ごと置き換わるので、そのときは `canonical` と `languages` を同じ場所に並べて書く。ページごとに書く形にしておけば、そのまま足せる。

---

### 手順 6：ページごとに `og:url` を書き、一覧とタグのページで画像が消えるのを見る

`og:url` も `canonical` と同じく、レイアウトに `url: "/"` と書くと全ページがトップを名乗る（一時ディレクトリで確かめた）。だから、最初からページごとに書く。

`openGraph` は入れ子の項目で、子が書くと親の値が丸ごと隠れる（1-9）。そこで、1-9 の記事ページと同じく、`siteOpenGraph` と `type` も一緒に書く。

`app/page.tsx` に `import` を1行足し、手順 5 の `metadata` に `openGraph` を足す。

```tsx
import { siteOpenGraph } from "../lib/siteMetadata";
```

```tsx
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...siteOpenGraph, type: "website", url: "/" },
};
```

`app/posts/page.tsx` と `app/tags/page.tsx` も同じように足す。

```tsx
import { siteOpenGraph } from "../../lib/siteMetadata";
```

```tsx
export const metadata: Metadata = {
  title: "記事一覧",
  alternates: { canonical: "/posts" },
  openGraph: { ...siteOpenGraph, type: "website", url: "/posts" },
};
```

```tsx
export const metadata: Metadata = {
  title: "タグ一覧",
  alternates: { canonical: "/tags" },
  openGraph: { ...siteOpenGraph, type: "website", url: "/tags" },
};
```

`app/tags/[tag]/page.tsx` も同じ。

```tsx
import { siteOpenGraph } from "../../../lib/siteMetadata";
```

```tsx
return {
  title: `タグ: ${tag}`,
  alternates: { canonical: `/tags/${tag}` },
  openGraph: { ...siteOpenGraph, type: "website", url: `/tags/${tag}` },
};
```

`app/posts/[slug]/page.tsx` は、もう `openGraph` を書いているので、`url` を1行足すだけでよい。

```tsx
  openGraph: {
    ...siteOpenGraph,
    type: "article",
    publishedTime: post.frontmatter.date,
    url: `/posts/${slug}`,
  },
```

`og:url` と `og:image` を見る。

```bash
bun run build
for p in index posts posts/hello tags tags/mdx; do echo "== $p"; grep -oE '<meta property="og:(url|image)"[^>]*>' .next/server/app/$p.html; done
```

```
== index
<meta property="og:url" content="https://www.65banseki.dev"/>
<meta property="og:image" content="https://www.65banseki.dev/opengraph-image?8ec7bf66e2cdb547"/>
== posts
<meta property="og:url" content="https://www.65banseki.dev/posts"/>
== posts/hello
<meta property="og:url" content="https://www.65banseki.dev/posts/hello"/>
<meta property="og:image" content="https://www.65banseki.dev/posts/hello/opengraph-image?0203e9bf893d0cb0"/>
== tags
<meta property="og:url" content="https://www.65banseki.dev/tags"/>
== tags/mdx
<meta property="og:url" content="https://www.65banseki.dev/tags/mdx"/>
```

`og:url` は全ページに出た。ところが、`posts`・`tags`・`tags/mdx` から **`og:image` が消えた**。`?` の後ろの文字は、手元では違う値になることがある。

**何が起きたのか** — Next.js の中身を読む。

```bash
sed -n 113,122p node_modules/next/dist/lib/metadata/metadata-resolution-primitives.js
```

```js
// file based metadata is specified and current level metadata openGraph.images is not specified
if (
  openGraph &&
  !(source == null
    ? void 0
    : (_source_openGraph = source.openGraph) == null
      ? void 0
      : _source_openGraph.hasOwnProperty("images"))
) {
  const resolvedOpenGraph = await(0, _resolveopengraph.resolveOpenGraph)(
    {
      ...target.openGraph,
      images: openGraph,
    },
    metadataBase,
    pathname,
    {
      ...metadataContext,
      isStaticMetadataRouteFile: true,
    },
    titleTemplates.openGraph,
  );
  target.openGraph = convertUrlsToStrings(resolvedOpenGraph);
}
```

`opengraph-image.tsx` で作った画像（コメントの `file based metadata`）は、**そのファイルがある階層**で `openGraph` に差し込まれる。流れはこうなる。

1. `app/` の階層で、レイアウトの `openGraph` に `app/opengraph-image.tsx` の画像が入る
2. `/posts` の階層には画像のファイルがない。ここでページの `openGraph` が親の `openGraph` を丸ごと置き換えるので、画像も一緒に消える

手順 6 より前に画像が出ていたのは、子が `openGraph` を書かず、画像入りの親の値が丸ごと見えていたからだ。トップページは画像のファイルと同じ `app/` の階層にあるので消えない。記事ページは 1-7 で作った自分の画像が `app/posts/[slug]/` にあるので消えない。

**この失敗が怖い理由** — 手順 3 と同じく、エラーは出ず、画面にも出ない。SNS でシェアしたときに、一覧とタグのページだけ画像のないカードになる。

---

### 手順 7：`parent` で親の画像を引き継ぐ（この回の本題 その2）

ドキュメントの `generateMetadata` の例にある `parent` を使い、親で決まった画像を受け取って渡し直す。

`app/posts/page.tsx` は、`import` を変え、`metadata` を `generateMetadata` に書き換える。

```tsx
import type { Metadata, ResolvingMetadata } from "next";
```

```tsx
export async function generateMetadata(
  _props: PageProps<"/posts">,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { openGraph } = await parent;
  return {
    title: "記事一覧",
    alternates: { canonical: "/posts" },
    openGraph: { ...siteOpenGraph, type: "website", url: "/posts", images: openGraph?.images },
  };
}
```

`app/tags/page.tsx` も同じ形にする（`"/posts"` を `"/tags"` に、`"記事一覧"` を `"タグ一覧"` に変える）。

`app/tags/[tag]/page.tsx` は、もう `generateMetadata` なので、引数に `parent` を足し、`images` を渡す。

```tsx
import type { Metadata, ResolvingMetadata } from "next";
```

```tsx
export async function generateMetadata(
  { params }: PageProps<"/tags/[tag]">,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // paramsはこのファイルの上部にあるgenerateStaticParams によってstaticになっているのでcache不要
  const { tag } = await params;
  const { openGraph } = await parent;
  return {
    title: `タグ: ${tag}`,
    alternates: { canonical: `/tags/${tag}` },
    openGraph: {
      ...siteOpenGraph,
      type: "website",
      url: `/tags/${tag}`,
      images: openGraph?.images,
    },
  };
}
```

**1行ずつ何をしているか**

- `parent: ResolvingMetadata` — 2つ目の引数。親の階層まででできあがったメタデータが、まだ届いていない状態（Promise）で渡される
- `const { openGraph } = await parent;` — 届くのを待ち、親の `openGraph` を取り出す。手順 6 で見た「`app/` の階層で画像が入った `openGraph`」がこれにあたる
- `images: openGraph?.images` — 親の画像を、そのまま自分の `openGraph` に渡す。`?.` は「`openGraph` がなければ `undefined` にする」書き方
- `_props` — 1つ目の引数は使わないが、2つ目の `parent` を受け取るために書く。頭の `_` は「わざと使っていない」という印

**なぜ `export const metadata` のままではだめか** — 決まった値のオブジェクトには、親の値を受け取る入口がないからだ。親の値を見て決めるものは、関数（`generateMetadata`）にする。

```bash
bun run build
for p in index posts posts/hello tags tags/mdx; do echo "== $p"; grep -oE '<meta property="og:(url|image)"[^>]*>' .next/server/app/$p.html; done
```

```
== index
<meta property="og:url" content="https://www.65banseki.dev"/>
<meta property="og:image" content="https://www.65banseki.dev/opengraph-image?8ec7bf66e2cdb547"/>
== posts
<meta property="og:url" content="https://www.65banseki.dev/posts"/>
<meta property="og:image" content="https://www.65banseki.dev/opengraph-image?8ec7bf66e2cdb547"/>
== posts/hello
<meta property="og:url" content="https://www.65banseki.dev/posts/hello"/>
<meta property="og:image" content="https://www.65banseki.dev/posts/hello/opengraph-image?0203e9bf893d0cb0"/>
== tags
<meta property="og:url" content="https://www.65banseki.dev/tags"/>
<meta property="og:image" content="https://www.65banseki.dev/opengraph-image?8ec7bf66e2cdb547"/>
== tags/mdx
<meta property="og:url" content="https://www.65banseki.dev/tags/mdx"/>
<meta property="og:image" content="https://www.65banseki.dev/opengraph-image?8ec7bf66e2cdb547"/>
```

全ページに `og:url` と `og:image` がそろった。X のカード用の `twitter:image` も、`og:image` から引き継がれて戻る。手順 5 の `for` のコマンドで、`canonical` が変わっていないことも確かめておく。

**関数にしたら、静的なページでなくなるのでは** — ならない。`bun run build` の最後の表で、`/posts` と `/tags` は `○ (Static)` のままだ。`parent` は親のメタデータを待つだけで、リクエストごとに変わる値（クッキーなど）を読まないからだ。

---

### 手順 8：`vercel.app` からの転送を `next.config.ts` に書く

`next.config.ts` の `typescript` と `experimental` の間に足す。

```ts
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "65-blog-app\\.vercel\\.app" }],
        destination: "https://www.65banseki.dev/:path*",
        permanent: true,
      },
    ];
  },
```

**1行ずつ何をしているか**

- `source: "/:path*"` — どのパスでも対象にする。`:path*` は「ここに0個以上のパスが入る」という印
- `has: [{ type: "host", ... }]` — 「ホスト名がこれのときだけ」という条件。ホスト名は、ブラウザが「どの住所を開こうとしているか」をサーバーに伝える値だ。同じ Vercel のサーバーが `www.65banseki.dev` と `65-blog-app.vercel.app` の両方を受けているので、これで見分ける
- `value: "65-blog-app\\.vercel\\.app"` — 正規表現（文字の並びのパターン）として扱われる。`.` は「任意の1文字」の意味になるので、`\\.` で「本当のドット」にする
- `destination` — 送り先。`:path*` に、元のパスがそのまま入る
- `permanent: true` — 308（恒久的な転送）にする。1-8 で `65banseki.dev` から `www` に送っているのと同じ番号だ

**なぜエスケープするのか** — 一時ディレクトリで、エスケープしない形を試すと、`65-blog-appxvercelxapp` のような名前でも転送された。ここに実害はないが、正規表現の `.` は「何でも1文字」になる、と覚えておく価値がある。

---

### 手順 9：手元で、ホスト名を変えたリクエストが転送されるのを見る

```bash
bun run build
PORT=3123 bun run start
```

別のターミナルを開いて、ホスト名を変えて送る。`curl` の `-H "Host: ..."` で「この住所を開こうとしています」と名乗れる。

```bash
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' -H "Host: 65-blog-app.vercel.app" "http://localhost:3123/posts/hello?ref=zenn"
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' -H "Host: www.65banseki.dev" "http://localhost:3123/posts/hello?ref=zenn"
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' -H "Host: 65-blog-app-git-dev-hi-lee-mon.vercel.app" "http://localhost:3123/posts/hello?ref=zenn"
```

```
308 https://www.65banseki.dev/posts/hello?ref=zenn
200
200
```

1行目は `vercel.app` の名前で来たので、308 で `www` へ送られた。パス（`/posts/hello`）とクエリ（`?ref=zenn`）も残っている。2行目の正式な住所と、3行目のプレビューのような名前は、そのまま 200 でページが返った。

**なぜクエリが残ると嬉しいのか** — Zenn や Qiita の記事に `?ref=zenn` のような印を付けたリンクを置いたとき、転送で消えると、どこから来たかが分からなくなる。

確かめたら、1つ目のターミナルで `Ctrl + C` を押してサーバーを止める。

---

### 手順 10：コミットして push する

```bash
bun run typecheck
bun run lint
git status
git add app/page.tsx app/posts/page.tsx app/tags/page.tsx 'app/tags/[tag]/page.tsx' 'app/posts/[slug]/page.tsx' next.config.ts tickets/1-11-canonical.md
git commit -m "feat: 各ページに正式な住所を名乗らせ、vercel.app に来た人を www.65banseki.dev へ転送する"
git push
```

push すると `dev` のプレビューができる。プレビューの住所は転送の条件に合わないので、ふつうに開ける。

---

### 手順 11：本番に出し、`vercel.app` が転送されるのを見る

```bash
git switch main
git merge --ff-only dev
git push
git switch dev
```

デプロイが終わったら、本番の `vercel.app` に送ってみる。

```bash
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "https://65-blog-app.vercel.app/posts/hello?ref=zenn"
curl -s https://www.65banseki.dev/posts/hello | grep -oE '<link rel="canonical"[^>]*>|<meta property="og:url"[^>]*>'
```

1行目が `308 https://www.65banseki.dev/posts/hello?ref=zenn` になり、2つ目のコマンドで `canonical` と `og:url` の両方が `https://www.65banseki.dev/posts/hello` を指していれば完了（本番での出力は未確認）。ブラウザで `https://65-blog-app.vercel.app` を開いても、`www.65banseki.dev` に移る。

**アクセス解析への効き目** — `vercel.app` で開いた人は `www` に送られてから数えられるので、1-10 の数字に `vercel.app` が混ざらなくなる。

---

### うまくいかないとき

| 症状                                                 | 原因と対処                                                                                               |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 全ページの `canonical` がトップページになる          | レイアウトに `alternates` が残っている。手順 3・4 で足した3行を消す                                      |
| あるページだけ `canonical` が `(none)`               | そのページに `alternates` を書き忘れている。手順 5 を見る                                                |
| 一覧やタグのページに `og:image` が出ない             | `parent` から受け取った画像を渡していない。手順 7 の `images: openGraph?.images` を見る                  |
| `og:title` や `og:locale` が消えた                   | `openGraph` に `...siteOpenGraph` を書き忘れている。子の `openGraph` は親の値を丸ごと隠す                |
| `ResolvingMetadata` が見つからないという型エラー     | `import type { Metadata, ResolvingMetadata } from "next";` に変えていない                                |
| 手順 9 の1行目が `200`                               | `has` の `value` の綴りか、`\\.` が違う。`next.config.ts` を変えたら `bun run build` をやり直す          |
| 手順 9 の2行目も `308` になる                        | `has` の条件がない。転送が全ホストに効いていて、`www` から `www` へ送り続ける状態になる。`has` を足す    |
| `curl: (7) Failed to connect to localhost port 3123` | サーバーが起動していないか、別のポートで起動している。手順 9 の `bun run start` を見る                   |
| `EADDRINUSE: address already in use :::3123`         | 前に起動したサーバーが残っている。そのターミナルで `Ctrl + C` を押すか、`PORT=3124` のように番号を変える |

ここに載っていないエラーが出たら、そのまま貼って聞いてほしい。

---

## 受け入れ条件

- [ ] 手順 5 の `for` のコマンドで、5ページそれぞれが自分の住所の `canonical` を出す
- [ ] 手順 7 の `for` のコマンドで、5ページそれぞれが自分の住所の `og:url` と、`og:image` を出す
- [ ] 手順 3 で、レイアウトに書くと全ページがトップページを名乗るのを自分で確かめ、元に戻した
- [ ] 手順 6 で、一覧とタグのページから `og:image` が消えるのを自分で確かめた
- [ ] 手順 9 の3つの `curl` が、上から `308 https://www.65banseki.dev/posts/hello?ref=zenn`・`200`・`200` を出す
- [ ] 本番で、`https://65-blog-app.vercel.app/posts/hello?ref=zenn` が `308` で `https://www.65banseki.dev/posts/hello?ref=zenn` に転送される
- [ ] 本番の `https://www.65banseki.dev/posts/hello` に、自分の住所の `canonical` と `og:url` がある
- [ ] `bun run typecheck` と `bun run lint` がエラーなしで終わる

## この回で理解したこと

着手後に埋める。動いたか（受け入れ条件）とは別に、何が分かったかを残す。

- [ ] レイアウトに `canonical: "/"` を書くと全ページがトップページを名乗る理由を、1-9 の決まりで説明できる
- [ ] `"./"` がドキュメントの表と違う動きをした理由と、それでも使わなかった理由を説明できる
- [ ] 一覧とタグのページで `og:image` が消えたのに、トップと記事のページでは消えなかった理由を説明できる
- [ ] `parent` を使うために `metadata` を `generateMetadata` に書き換えた理由を説明できる
- [ ] `vercel.app` で開いたページも `www` を名乗る理由を説明できる
- [ ] `canonical` だけでなく転送もした理由を説明できる
- [ ] `has` の `value` で `.` をエスケープした理由を説明できる

## 参考

- メタデータの `alternates`・`metadataBase`・`parent`: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`
- 転送の書き方: `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/redirects.md`
- `./` の解決: `node_modules/next/dist/lib/metadata/resolvers/resolve-url.js` の `resolveRelativeUrl`
- 画像のファイルが差し込まれる階層: `node_modules/next/dist/lib/metadata/metadata-resolution-primitives.js` の `mergeStaticMetadata`
- OGP の基本の項目: https://ogp.me
- Vercel のガイド（`vercel.app` と独自ドメインの重複）: https://vercel.com/kb/guide/avoiding-duplicate-content-with-vercel-app-urls
- プレビューが検索に載らない理由: https://vercel.com/kb/guide/are-vercel-preview-deployment-indexed-by-search-engines
- 前の回: `tickets/1-10-web-analytics.md`
