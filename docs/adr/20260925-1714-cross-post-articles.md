# 同じ記事を Zenn・Qiita・自サイトの3か所に配る

- 日付: 2026-09-25
- 状態: 採用

## 背景

技術記事をどこに書くかを決める必要があった。Zenn と Qiita は読者が多い。自サイトは MDX で動くデモを埋め込める。

## 決定

記事は1本の原稿で書き、Zenn・Qiita・自サイトの3か所へ同じ内容を公開する。公開は GitHub への push を起点に自動化する。

- Zenn: GitHub 連携（リポジトリ直下の `articles/` を公開する仕組み）を使う。投稿用の公開 API はない
- Qiita: 公式の Qiita CLI と GitHub Actions を使う
- 自サイト: 原稿の MDX を Next.js で表示する

## 理由

読者の多い Zenn・Qiita で読まれる機会を得つつ、自サイトにも全記事がそろう。技術アピールの場で「記事はすべてここにある」と示せる。

## 採らなかった案

- 役割で分ける（普通の記事は Zenn、デモ入りの記事だけ自サイト）: 自サイトの記事数が少なくなる
- 記事ごとに置き場所を選ぶ: 毎回迷う。自動化もしにくい

## 影響

- frontmatter の形式、補足の枠などの独自記法、動くデモの扱いを、変換で吸収する必要がある
- Zenn・Qiita とも canonical を設定できない。重複コンテンツの扱いは運用で補う（冒頭に掲載先のリンクを書く、公開日をずらす）

## 見直しの条件

マルチポストには賛否がある。Google はペナルティを与えないが、検索結果には1つだけを表示するので、自サイトは Zenn・Qiita に負けやすい。当面はマルチポストで読者を集める。Zenn・Qiita の記事から自サイトへ来る人が増え、自サイトの記事がたまってきたら、自サイトだけに投稿する運用へ切り替える。切り替えの具体的な基準（アクセス数など）は、アクセス解析を入れてから決める。

## 参考

- https://gatilab.com/duplicate-content-in-seo/
- https://qiita.com/nomurasan/items/eb96dc3cece6e4945b96

- https://zenn.dev/sawasige/articles/manage-qiita-and-zenn-in-one-repo
- https://zenn.dev/zhener/articles/zenn-canonical-crosspost-seo
- `docs/design/20260925-blog-design-proposal.md`
