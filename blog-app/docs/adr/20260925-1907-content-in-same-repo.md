# 記事の原稿はアプリと同じリポジトリに置く

- 日付: 2026-09-25
- 状態: 採用

## 背景

記事は1本の原稿から Zenn・Qiita・自サイトの3か所へ配る（`20260925-1714-cross-post-articles.md`）。原稿を置くリポジトリを決める必要があった。

Zenn の GitHub 連携は、リポジトリ直下に `articles/` があることを前提にしており、場所を変えられない。Qiita CLI は `public/` を使う。どちらも場所はぶつからない（https://zenn.dev/sawasige/articles/manage-qiita-and-zenn-in-one-repo ）。

## 決定

リポジトリ `65-blog-app` の直下に原稿と配信用のディレクトリを置き、Next.js アプリ（`blog-app/`）と同居させる。

```
65-blog-app/
├── content/   原稿（MDX）
├── articles/  Zenn 用（GitHub Actions で生成）
├── public/    Qiita 用（GitHub Actions で生成）
└── blog-app/  Next.js アプリ
```

## 理由

- Next.js アプリが `blog-app/` に入っているので、直下が空いており、Zenn の制約をそのまま満たせる
- push 1回で3か所すべてに届く
- 自サイトは同じリポジトリ内の原稿を読むだけで済む

## 採らなかった案

- 記事専用リポジトリを分ける: 記事を push したときにアプリを再ビルドさせる仕組みと、ビルド時に別リポジトリから原稿を取ってくる仕組みが別に要る

## 影響

- コードと記事の変更履歴が同じリポジトリに混ざる。コミットメッセージの接頭辞などで区別する
- Zenn の GitHub 連携はこのリポジトリ全体を対象にする。連携できるリポジトリは最大2つまで
