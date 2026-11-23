# RSS、sitemap、robots を標準の仕組みで作り、スクリプトを制限しない CSP を入れる

- 日付: 2026-11-23
- 状態: 採用（2026-11-23。キーボード、VoiceOver、CSP の実際の応答、iframe は未確認のまま本人が了承。チケット `tickets/3-8-feed-sitemap-robots-csp.md`）
- 関連: ADR `20261122-1821-publish-first-path.md`（公開までの順番と CSP の値）、ADR `20261119-0109-publish-prep-after-ui.md`（3-8・3-9 の位置づけ）

## 背景

最初の公開までに、検索エンジンが記事を見つける入口と、読者が更新を受け取る入口が要る。いまのサイトには `robots.txt`、`sitemap.xml`、RSS がない。CSP（ページの扱い方をブラウザに指示する HTTP ヘッダー）も付いていない。

## 決めたこと

1. RSS は依存を足さず、`app/feed.xml/buildRssFeed.ts` で XML を組み立てる（本人の変更。推奨は `lib/buildRssFeed.ts`）
2. RSS の各項目は題、URL、公開日、タグにし、本文は入れない
3. RSS に載せるのは最新20件の記事にする
4. ふせんは個別の URL がないので RSS に載せない
5. sitemap には固定の5ページ、全記事、全タグを載せる。下書きは載せない
6. sitemap に `lastmod` を入れない
7. robots はすべてのクローラーに全ページを許可する。AI のクローラーを分ける判断は 3-10 に回す
8. RSS の自動検出リンクの値を、`canonical` を持つ各ページの `alternates` にも渡す
9. フッターに「RSS フィード」のリンクを `<a>` で置く
10. CSP は `frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'` にする
11. CSP は `next.config.ts` の `headers()` で、すべての応答に付ける

## 採らなかった案

- **`feed` パッケージを使う。** RSS と Atom の細かい形式を任せられるが、このサイトの項目は4種類だけで、依存を増やすほどの量がない
- **RSS に記事の全文を入れる。** リーダーの中で読み切れるが、MDX を HTML に変える処理が別に要り、コードブロックの色も崩れやすい
- **`app/robots.txt` と `app/sitemap.xml` を手で書く。** 仕組みは単純だが、記事を足すたびに更新が要る
- **`sitemap` に `lastmod` として公開日を入れる。** 値は埋まるが、更新日ではないので Google が求める「正確な最終更新日」にならない
- **`app/layout.tsx` の `<head>` に `<link>` を直接書く。** 1か所で済むが、markuplint が `title` と文字コードの宣言を求めてエラーになる
- **`<body>` の中に `<link>` を書いて React に `<head>` へ運ばせる。** 出力は正しいが、`alternate` は `<body>` の中で許されず、markuplint がエラーにする
- **nonce を使う厳格な CSP。** XSS に強いが、全ページの動的描画が必要になる（ADR `20261122-1821-publish-first-path.md`）

## 確認事項の推奨と欠点

- 手書きの RSS: 文字の置き換え（エスケープ）を自分で保守する。`app/` の中に置くので、ほかのフレームワークへ移るときは置き場所を変える
- 本文を入れない: リーダーだけでは記事を読めず、サイトへ移動する
- 最新20件: それより古い記事は購読を始めた人のリーダーに出ない
- ふせんを載せない: ふせんの更新は購読者に届かない
- 固定ページ、記事、タグを載せる: 記事が少ないタグの一覧も検索エンジンに知らせる
- `lastmod` なし: 記事を更新しても sitemap からは更新を伝えられない
- 全クローラーを許可: AI の学習用クローラーも記事を読める
- 各ページに `types` を渡す: 新しいページで書き忘れると自動検出リンクが消える
- `<a>` と lint の無効化コメント: コメントが1行増える
- スクリプトを制限しない CSP: XSS は止められない
- すべての応答に付ける: 画像やスクリプトの応答にも不要なヘッダーが付く

## 確かめた結果

2026-11-23 に、リポジトリの複製でチケットの手順を流した（next 16.4.6、react 19.3.1、bun 1.4.4、Node.js 24.22.1）。

- 本番ビルドの出力で、`/robots.txt`、`/sitemap.xml`、`/feed.xml` が静的に生成された
- `sitemap.ts` は `"use cache"` がないと動的な配信（`ƒ`）になり、足すと静的（`○`）になった
- `sitemap.xml` には27件の URL が出て、下書きは出なかった
- `feed.xml` は `xmllint` を通り、11件の記事が出た
- エスケープを外すと、題に `&` があるときに `xmllint` が失敗した
- `layout.tsx` だけに `alternates` を書くと、`canonical` を持つページから自動検出リンクが消えた。各ページに `types` を渡すと、確かめた8ページすべてに出た
- `routes-manifest.json` に CSP の値が `/(.*)` で登録された
- `bun run l`、`bun run fc`、`bun run tc`、`bun run ay` が通った
- 本人がブラウザで `/feed.xml` を開き、XML を取得できた

未確認: 実際の HTTP 応答のヘッダー、iframe がブロックされたときのブラウザの表示、VoiceOver の読み上げ、RSS リーダーでの表示、本番環境での解析スクリプトの動作。

## 参考

- Next.js 同梱ガイド: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md`
- Next.js 同梱ガイド: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/robots.md`
- Next.js 同梱ガイド: `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`
- [Build and Submit a Sitemap（Google）](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [RSS 2.0 Specification](https://www.rssboard.org/rss-specification)
- [RSS Autodiscovery](https://www.rssboard.org/rss-autodiscovery)
- [CSP: frame-ancestors（MDN）](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors)
