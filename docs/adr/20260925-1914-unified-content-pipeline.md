# 原稿の読み込みは unified で自前に組み、Next.js に依存させない

- 日付: 2026-09-25
- 状態: 採用

## 背景

アプリは Next.js で作るが、将来ほかのフレームワークへ乗り換える可能性がある。原稿（Markdown / MDX）とその読み込み処理は、Next.js に依存させたくない。また、1本の原稿から Zenn 用・Qiita 用・自サイト用の3種類を出力する必要がある。

## 決定

unified（Markdown を構文木に変換し、プラグインで加工して出力する仕組み）を中心に、読み込み処理を自前で組む。2026-09 時点で次のパッケージを使う。

| 役割 | パッケージ |
|---|---|
| frontmatter | `vfile-matter`、`yaml` |
| Markdown の変換 | `unified`、`remark-parse`、`remark-rehype` |
| MDX | `@mdx-js/mdx` |

## 理由

- どれも Next.js に依存しない。`@mdx-js/mdx` は React 以外（Preact、Vue、Solid）向けにも出力できる
- 構文木の段階で `:::message` の書き換えやデモのリンクへの置き換えができるので、3種類の出力を同じ仕組みで書ける
- 仕組みを自分で組むので、学びが多い

## 採らなかった案

- Velite / Content Collections: どちらもフレームワーク非依存で、Zod による型検査まで手に入る。ただし今回は仕組みを自分で理解したいので見送る。frontmatter の型検査が欲しくなったら再検討する
- `@next/mdx`: Next.js 専用
- `next-mdx-remote`: Next.js 専用で、2026-04 にリポジトリがアーカイブされた
- `gray-matter`: 2023 年から更新が止まっている
- Contentlayer: 2023 年から開発が止まっている

## 関連

- シンタックスハイライターは Shiki に決めた（`20260925-1923-syntax-highlighter-shiki.md`）
