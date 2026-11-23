# 公開に必要な作業を先にし、残り4回で最初の公開まで進める

- 日付: 2026-11-22
- 状態: 採用
- 置き換えるもの: ADR `20261115-2117-publishable-home-before-storybook.md` と ADR `20261119-0109-publish-prep-after-ui.md` の進める順番
- 関連: ADR `20261122-0024-page-container-and-header.md`（3-3c）、ADR `20261103-2241-host-on-vercel.md`（`main` への push で本番に出る）

## 背景

本人は早く公開したいと考え、公開できる品質に関わる実装を先に進めることにした（2026-11-22）。3-3c は部品への整理が中心なので一度は飛ばす案になったが、本人がレイアウトは重要と判断して実装し、完了した。

同じ日に手元のコードを調べると、公開前に足りないものは次のとおりだった。本番サイトの状態は確かめていない。

- トップ画面にリンクが3つ並ぶだけで、自己紹介がない
- 自作の 404 ページ、ファビコン、`sitemap.xml`、`robots.txt`、RSS がない
- `content/ogp.mdx` の題が「DNSを理解する」で、`content/dns.mdx` と重複している
- 記事11本のうち4本は、本文が300字未満のメモになっている

## 決めたこと

3-3c のあと、次の4回で最初の公開まで進める。番号は既存の計画のものを残す。

| 回  | Step     | 内容                                                           |
| --- | -------- | -------------------------------------------------------------- |
| 1   | 3-5      | トップ画面を作る。自己紹介を置き、ナビの名前を「ふせん」に直す |
| 2   | 3-11     | 404 ページとファビコンを作る                                   |
| 3   | 3-8・3-9 | RSS、`sitemap.xml`、`robots.txt` を作り、軽い CSP を入れる     |
| 4   | 4-0      | 記事を仕分け、`dev` を `main` に早送りで進めて公開する         |

公開のあとに回すものは 3-4（付箋の並べ替え）、3-5b（OGP 画像のデザイン）、3-6（X のツイート表示）、3-10（AI が読みやすくする対応）、独立した `/about` ページ、2-7 以降の Storybook の回、5-x（国際化）とする。3-7 の一覧ページの整理は 3-3c で済んだ。

### CSP は読み込むスクリプトを制限しない形にする

CSP（Content Security Policy）は、ページが読み込んでよいものや扱われ方をブラウザに指示するルールで、HTTP ヘッダーで送る。3-8・3-9 の回に `next.config.ts` の `headers()` で次の値を全ページに付ける。

```text
frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'
```

| 指定              | 何をするか                                       |
| ----------------- | ------------------------------------------------ |
| `frame-ancestors` | 他のサイトの iframe にこのサイトを埋め込ませない |
| `base-uri`        | 相対リンクの基準になる URL を書き換えさせない    |
| `object-src`      | 古い埋め込み機能（`<object>` など）を使わせない  |
| `form-action`     | フォームの送信先を自サイトに限る                 |

この形では XSS（ページに悪意のあるスクリプトを埋め込む攻撃）を止められない。このサイトにはログイン、フォーム、読者の投稿がなく、原稿を書くのも本人だけなので、攻撃の入口は小さいと判断した。

## 採らなかった案

- **sitemap と RSS を公開の直後に足す。** いちばん早く出せるが、検索エンジンに見つかるのが遅れ、最初の読者が購読できない
- **OGP 画像のデザインまで公開前に入れる。** X で共有したときの見栄えは良くなるが、公開が1回ぶん遅れる
- **nonce を使う厳格な CSP。** nonce はアクセスごとに発行する使い捨ての合言葉で、XSS に強い。ただし Next.js の同梱ガイドによると全ページを動的に描く必要があり、事前生成や Partial Prerendering と両立しない
- **外部スクリプトを許可制にする CSP。** 守りは強くなるが、許可の書き漏れで Cloudflare と Umami の解析が止まるおそれがあり、本番で違反を確かめる手順も増える

## 未確認のこと

- 本番サイトの現在の表示とレスポンスヘッダー
- CSP を入れた状態での動作。3-8・3-9 のチケットで確かめる

## 参考

- Next.js 同梱ガイド: `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`
- [Mitigate cross-site scripting (XSS) with a strict Content Security Policy（web.dev）](https://web.dev/articles/strict-csp)
- [Content Security Policy Cheat Sheet（OWASP）](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
