# デザインシステムを Panda CSS v2 で組み、状態を持つ部品は React Aria から自作へ置き換える

- 日付: 2026-11-06
- 状態: 採用

## 背景

母屋の見た目を作り始める。設計書（`docs/design/20260925-blog-design-proposal.md`）では、Panda CSS で自作のデザインシステムを組み、コンポーネントは Mantine の作りを参考に自作するとしていた。

本人はデザインシステムを作ったことがなく、作り方から学びたいと考えている。コンポーネントは最終的に自作したいが、最初は headless UI（見た目を持たず、キーボード操作や読み上げへの対応といった振る舞いだけを提供する部品集）の React Aria を使い、少しずつ自作に置き換えたい。

## 決めたこと

- スタイリングは Panda CSS v2 で組む。create-next-app が入れた Tailwind CSS v4 は、Panda を入れる回（2-1）で外す
- 状態を持つ部品（メニュー、ダイアログ、テーマ切り替えなど）は、React Aria の部品（`react-aria-components`）から始める。次に React Aria のフック（`react-aria`）へ、最後に自作へと段階を踏んで置き換える
- 状態を持たない部品（文字、リンク、タグ、カード）には React Aria を使わず、最初から Panda で自作する
- 次の順に進める。1回を1チケットにし、番号は 2-0 から振る

| Step | 内容                                                                |
| ---- | ------------------------------------------------------------------- |
| 2-0  | デザインシステムとは何かを知り、今のサイトを棚卸しする              |
| 2-1  | Panda CSS v2 を入れ、Tailwind CSS を外す                            |
| 2-2  | 基本トークン（色・文字の大きさ・余白）を作る                        |
| 2-3  | 意味トークンとダークモードを作る                                    |
| 2-4  | 記事ページの文字組みを整える（最初の実戦）                          |
| 2-5  | 状態を持たない部品（タグ・カード）を作り、`/design-system` に並べる |
| 2-6  | React Aria で状態を持つ部品（テーマ切り替え・メニュー）を作る       |
| 2-7  | React Aria のフックに置き換え、さらに自作に置き換える               |

## 理由

### Panda CSS v2 にした理由

- ビルド時に CSS を作るので、Server Components のまま使える。設計書の時点から変わらない理由
- トークン、意味トークン（`semanticTokens`）、テーマ、部品の見た目の型（recipes）が最初からそろっている。デザインシステムを組むための道具が1つにまとまっている
- v2 は 2026-09-29 に正式版が出た（2026-11-06 時点で 2.5.0）。コンパイラが Rust で書き直され、Oxc の構文解析器を使うようになった。このリポジトリで使っている oxlint・oxfmt も Oxc でできている
- `@pandacss/dev` と `@pandacss/compiler` にはインストール時スクリプトがない。コンパイラは OS ごとのバイナリを `optionalDependencies` で配る（`npm view` で確認）。依存の `@parcel/watcher` には、組み立て済みのファイルがない OS のためにソースから組み立てる `install` スクリプトがあり、`trustedDependencies: []` で止まる。macOS では組み立て済みのファイルが入り、`@parcel/watcher` を使うのは `panda --watch` だけなので、止めたままでよい（2-1 の調査で実測。当初この ADR には「インストール時スクリプトがない」とだけ書いていた）

### React Aria から始める理由

React Aria は、見た目のない部品の層（`react-aria-components`）と、振る舞いだけを提供するフックの層（`react-aria`）に分かれている。部品をそのまま使う段から、フックを使って自分で DOM を書く段へ、さらにフックも自作する段へと、1段ずつ置き換えられる。少しずつ自作にしていく計画と、この層の分かれ方が合う。

読み上げやキーボード操作への対応が作り込まれているので、自作するときの手本にもなる。

### 状態を持たない部品に React Aria を使わない理由

`react-aria-components` の部品は `'use client'` で書かれていて、使うとブラウザに JavaScript が送られる。文字やリンクは操作されても状態が変わらないので、Server Components のまま Panda で書けば足りる。2026-11-06 時点のコードには、状態を持つ部品が1つもない。

### この順番にした理由

デザインシステムの作り方の先行研究から、次の3点を取り入れた。

- Brad Frost は『Atomic Design』第4章で、最初の一歩に interface inventory（今ある部品を1種類ずつ集めて並べる棚卸し）を挙げている。これを 2-0 にした
- トークンは、基本（実際の値）・意味（用途の名前）・部品ごとの3段で組むのが一般的とされる（Contentful の解説）。部品の色や余白はトークンを参照するので、部品より先にトークンを作る。2-2・2-3 がこれにあたる
- Dan Mall は、デザインシステムを単体で作りためず、実際のプロジェクト（pilot）で使いながら育てることを勧めている。記事ページを最初の実戦の場にした（2-4）

状態を持つ部品を後半（2-6）に置いたのは、フォーカスの輪の色や、開いたメニューの影に、先に決めたトークンを使うためでもある。

## 採らなかった案

- **Tailwind CSS v4 のまま組む。** CSS 変数でテーマを切り替えることはできる。ただ、設計書で Panda を選んだ理由（型の付いた recipes と、意味トークンをページごとに差し替えるテーマ）は変わっていない
- **Ark UI を使う。** Panda と同じ Chakra のチームが作る headless UI で、Panda と組み合わせた例（Park UI）が多い。ただ、振る舞いは Zag.js という状態機械で書かれていて、自作へ移るときの中間の段が React のフックではなく Zag.js になる。本人が React Aria を試したいと考えていることもあり、採らなかった
- **Mantine を参考に、最初から自作する（設計書の案）。** 読み上げやキーボード操作への対応を一から作るのは、デザインシステムを初めて作る段階では重い。部品の API の形（見た目の部品を外から差し替えられる Styles API など）は、引き続き Mantine を参考にする
- **部品を一通りそろえてから、ページに使う。** 使われない部品ができやすく、先行研究も避けている

## 気をつけること

- Panda CSS v2 は ESM 専用で、`package.json` に `"type": "module"` が要る。今は書いていない。足すと、`oxlint-plugins/nextjs-metadata.mts` の拡張子を `.mts` にした理由（ADR `20261106-1800-require-canonical-lint-rule.md`）がなくなる。2-1 の調査で、`"type": "module"` を足しても開発サーバー・ビルド・型検査・lint・format が通ることを確かめた（2026-11-06、一時ディレクトリで実測。足さなくても通った）
- Panda CSS v2 の公式ブログは Turbopack に触れていない。PostCSS の設定は CommonJS のまま動くとだけ書いてある。2-1 の調査で、Next.js 16.4.1 の Turbopack の開発サーバーとビルドで、PostCSS 経由で動くことを確かめた（2026-11-06、一時ディレクトリで実測）
- React Aria は部品の状態をデータ属性で表す。Panda の組み込みの条件は、ほとんどが同じ属性を見ているが、ホバーだけ名前が違う（React Aria は `data-hovered`、Panda の `_hover` は `[data-hover]`）。2-6 で条件を足すか、コミュニティのプリセット `pandacss-react-aria-components` を使うかを決める。このプリセットが v2 で動くかは未確認
- 依存を足すときは、ADR `20261103-1657-supply-chain-hardening.md` に従って版を固定する

## 参考

- Panda CSS 2.0: https://panda-css.com/blog/panda-css-v2
- React Aria: https://react-aria.adobe.com/getting-started
- Panda CSS の条件: https://panda-css.com/docs/concepts/conditional-styles
- Atomic Design 第4章: https://atomicdesign.bradfrost.com/chapter-4/
- Dan Mall, Design Systems: Pilots & Scorecards: https://danmall.com/posts/design-systems-pilots-scorecards
- Contentful, Design tokens: https://www.contentful.com/blog/design-token-system/
- pandacss-react-aria-components: https://github.com/kianomg/pandacss-react-aria-components
