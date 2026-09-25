# アクセス解析は最初から Cloudflare Web Analytics で計測する

- 日付: 2026-09-25
- 状態: 採用

## 背景

記事は当面 Zenn・Qiita・自サイトにマルチポストし、自サイトに人が来るようになったら自サイトだけへの投稿に切り替える（`20260925-1714-cross-post-articles.md`）。切り替えどきを判断するには、Zenn・Qiita から自サイトに何人来たかを最初から記録しておく必要がある。条件は、無料または安いことと、リファラー（訪問者がどこから来たか）を取れること。

## 決定

公開の最初から Cloudflare Web Analytics を入れる。

## 理由

- 無料で使える
- DNS の変更や Cloudflare のプロキシが要らないので、ホスティング先を決める前に選べる
- リファラーのホスト名をダッシュボードで見られる。パスまでは GraphQL API で取れる（https://developers.cloudflare.com/web-analytics/data-metrics/dimensions/ ）

## 採らなかった案

- Durable Objects で自作する: Durable Objects は状態を持つ処理の協調（チャット、ゲームなど）向けで、アクセス集計には作り込みが多すぎる
- Umami Cloud: 独自イベントを取れるのは魅力だが、現時点では不要。必要になったら追加する
- Vercel Web Analytics: Vercel でホスティングする場合に限られ、無料枠（月5万イベント）を超えると計測が止まる
- Google Analytics 4: Cookie を使うので、同意バナーなどの配慮が要る

## 未確認

- データの保存期間。導入時に公式ドキュメントで確認する
