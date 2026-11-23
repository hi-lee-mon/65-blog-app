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

### 4-0 に一覧カードの a11y 修正を含める

`PostCard` と `NoteCard` の `article` は名前がなく、VoiceOver で「記事」だけが繰り返し読まれる。本人の判断で、この修正を 4-0 に含める（2026-11-23）。カードの `article` を `div` にし、`li` と見出しで構造を伝える。記事の詳細ページの `article` は残す。

同じ日の監査で見つかった次の項目は、4-0 のチケットを作るときに範囲を決める。

| 優先 | 場所                              | 内容                                                                     | 根拠       |
| ---- | --------------------------------- | ------------------------------------------------------------------------ | ---------- |
| 高   | `panda.config.ts:51`              | 動きを減らす設定が `globalCss` の外にあり、ViewTransition が止まらない   | WCAG 2.3.3 |
| 高   | `/posts/cloudflare-web-analytics` | 言語指定のないコードブロックを、キーボードで横にスクロールできない       | WCAG 2.1.1 |
| 高   | `/posts/lib-or-util`              | Markdown の表が表にならず、`\|` の並んだ文字として表示される             | WCAG 1.3.1 |
| 高   | `app/_components/nav-link.tsx:12` | 記事やタグの子ページでも、ナビに `aria-current="page"` が付く            | WAI-ARIA   |
| 高   | `content/ogp.mdx`                 | ページの題が `content/dns.mdx` と重複している                            | WCAG 2.4.2 |
| 中   | `playwright.config.ts`            | axe の検査が PC 幅だけで、スマートフォン幅とダイアログを開いた状態がない | 検査の漏れ |
| 中   | カードの `ul`                     | `list-style: none` のため、Safari で一覧として伝わらないおそれがある     | 未確認     |
| 中   | コードブロック                    | フォーカスできるが、名前がない                                           | WCAG 4.1.2 |
| 中   | ヘッダーとフッターのリンク        | 押せる範囲が小さい（フッターの X は 8×18px）。axe の基準は満たす         | WCAG 2.5.8 |
| 低   | `opengraph-image.tsx`             | 共有画像の `alt` が内容ではなく画像の種類を説明している                  | WCAG 1.1.1 |
| 低   | `/design-system`                  | 見本のタグのリンク先が 404 になる                                        | WCAG 2.4.4 |

#### 4-0 の受け入れ条件に入れる確かめ方

4-0 のチケットを作るときは、上の表の行番号を信じず、最新のコードで全項目を調べ直す。範囲から外す項目は、理由を確認事項に書く。修正の前に axe の検査範囲を広げ、今の不具合で検査が落ちることを先に確かめる。

- カード: `/`、`/posts`、`/notes` のアクセシビリティツリーに、名前のない `article` が0個ある。修正前は順に6個、11個、5個。`/posts/[slug]` の `article` は1個のまま
- 動きを減らす設定: Playwright の `reducedMotion: "reduce"` で `/notes` のダイアログを開き、`::view-transition` のアニメーションが0個になる。修正前は6個
- コードブロック: 幅 320px の全記事で、axe の `scrollable-region-focusable` が0件になる。修正前は `/posts/cloudflare-web-analytics` で1件
- 表: `/posts/lib-or-util` の `main` に `|` で始まる段落がない。表として残すなら `table` がある
- 現在地: `/posts/[slug]` と `/tags/[tag]` のナビに `aria-current="page"` がなく、`/posts` と `/tags` のナビにはある
- ページの題: 全ページの `document.title` に重複がない。修正前は `/posts/dns` と `/posts/ogp` が重複
- axe の検査範囲: `bun run ay` が、PC 幅に加えて幅 320px とダイアログを開いた状態を、明るい表示と暗い表示で検査する
- カードの一覧: Safari の VoiceOver で、一覧と項目数が読まれる。読まれないときは `role="list"` を足す

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
