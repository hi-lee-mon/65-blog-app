# 記事とタグのページは `instant = false` にし、移動が一瞬で終わるかの検査から外す

- 日付: 2026-11-15
- 状態: 採用

## 背景

`next.config.ts` で `partialPrefetching`（Partial Prefetching）を有効にしている。リンク先のルートについて、全 URL で共通の外枠（App Shell）だけを先に読み込んでおく仕組みである。`/posts/a` と `/posts/b` は同じ外枠を使う。

`params` や `searchParams` は URL ごとに値が違う（Next.js は URL データと呼ぶ）。共通の外枠には入れられない。そのため `next dev` は、URL データを `<Suspense>` の外で読むと「移動が一瞬で終わらないかもしれない」と警告する（`instant-shell-url-data`）。`generateStaticParams` で全記事を事前に作っていても、警告は出る。

2026-11-15 に、次の2ルートでこの警告が出た。ログに出る場所は、最初に見つかった1件だけである。

- `/posts/[slug]`: `opengraph-image.tsx`。Next.js が生成するメタデータの処理が `params` を読む
- `/tags/[tag]`: `page.tsx` の `generateMetadata`

`params` を読んでいるのは、ほかにもある。`/posts/[slug]` で `opengraph-image.tsx` を外して試すと、場所の表示がないまま同じ警告が出た。残っているのは `generateMetadata` と本体で、どちらも `use cache` の中で `params` を読んでいる。`use cache` の中で読んでも、警告は消えない。

| ルート          | `params` を読む場所                             | `<Suspense>` に移せるか |
| --------------- | ----------------------------------------------- | ----------------------- |
| `/posts/[slug]` | 本体、`generateMetadata`、`opengraph-image.tsx` | 本体だけ移せる          |
| `/tags/[tag]`   | 本体、`generateMetadata`                        | 本体だけ移せる          |

警告は開発時だけのもので、ビルドは止まらない。ページも 200 で返っている。

## 決めたこと

`app/posts/[slug]/page.tsx` と `app/tags/[tag]/page.tsx` に `export const instant = false` を書き、この2ルートを検査から外す。

## 理由

### `<Suspense>` では消せない

本体の `params` の読み込みは `<Suspense>` に移せる。しかし `generateMetadata` と `opengraph-image.tsx` は `<head>` に入る情報を作る。画面の部品ではないので、`<Suspense>` で囲めない。公式の手引きが示す直し方は「`<Suspense>` に入れる」と「`instant = false`」の2つだけで、メタデータが `params` を読む限り、使えるのは後者しかない。

Dynamic Route だから `instant = false` が要る、というわけではない。メタデータで `params` を読まない Dynamic Route なら、`<Suspense>` で検査を通せる。

### ブログでは、本文を後から流し込んでも得をしない

`<Suspense>` を使うと、まず外枠と仮表示が出て、本文はあとから届く。記事サイトの読者が見たいのは本文なので、仮表示を先に出しても役に立たない。全記事とタグのページはビルド時に作ってあるので、待ち時間はもともと短い。

## 採らなかった案

- **ページ本体の `params` の読み込みを `<Suspense>` に移す。** メタデータからの警告が残るので、これだけでは消えない。そのうえ本文が仮表示のあとに出るようになる
- **警告を放っておく。** 害はないが、開発サーバーを使うたびに表示が流れ、本当に直すべき警告を見落としやすくなる
- **`partialPrefetching` をやめる。** 母屋のほかのページ（`/`, `/posts` など）では効いている。2ルートのためにサイト全体の設定を戻すことになる

## 欠点

`instant = false` は検査を切る宣言で、本番の動きは変えない。検査は開発時にしか動かないためである。この2ルートでは、リンクを押してから画面が切り替わるまで、ページのデータが届くのを待つ。ただしこれはメタデータが `params` を読む今の作りによるもので、`instant = false` を書くかどうかとは関係がない。ページはビルド時に作ってあるので、待つ時間はごく短い。

欠点は、この2ルートで移動が遅くなるような変更を足しても、開発サーバーが知らせてくれなくなること。

## 気をつけること

- `instant = false` は、そのルートの検査をまとめて切る。今後この2ルートに、キャッシュしないデータの取得を足しても警告は出ない。足すときは自分で確かめる
- 新しく動的なルート（`[slug]` のような名前のルート）を作り、メタデータで `params` を読むなら、同じ警告が出る。この ADR を参照して決める

## 参考

- `node_modules/next/dist/docs/01-app/02-guides/adopting-partial-prefetching.md` の「Move URL data behind Suspense」
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/instant.md`
