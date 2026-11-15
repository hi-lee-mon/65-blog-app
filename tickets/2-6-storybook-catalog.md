# 2-6: Storybook 11 を CSF Next で入れ、タグとカードをスマートフォン幅のカタログに並べる

- 起票日: 2026-11-11（2026-11-14 に、Storybook 11 の beta を使う形に書き直した）
- 学習計画: 設計の全体像は `docs/design/20260925-blog-design-proposal.md` の「デザインシステムの作り方」。2-6 以降の順番は ADR `20261111-0041-storybook-detour.md`
- ステータス: 完了（2026-11-15）

## 全体のどこか

「見た目を作る」段の7回目。React Aria に進む前の寄り道として、2-6 から 2-9 の4回で Storybook を入れる。この回はその1回目で、部品を1つずつ取り出して眺める**カタログ**を作る。テストと a11y の自動検査はこの回で作ったカタログの上に、次の回から足していく。

| Step | 内容                                                                              | 進捗       |
| ---- | --------------------------------------------------------------------------------- | ---------- |
| 2-0  | デザインシステムとは何かを知り、今のサイトを棚卸しする                            | ■□□ 進行中 |
| 2-1  | Panda CSS v2 を入れ、Tailwind CSS を外す                                          | ■■■ 完了   |
| 2-2  | 基本トークン（色・文字の大きさ・余白）を作る                                      | ■■■ 完了   |
| 2-3  | 意味トークンとダークモードを作る                                                  | ■■■ 完了   |
| 2-4  | 記事ページの文字組みを整える（最初の実戦）                                        | ■■■ 完了   |
| 2-5  | 状態を持たない部品（タグ・カード）を作り、`/design-system` に並べる               | ■■■ 完了   |
| 2-6  | Storybook 11 を CSF Next で入れ、タグとカードをスマートフォン幅のカタログに並べる | ■■■ 完了   |
| 2-7  | addon-vitest で部品のテストを書く                                                 | □□□        |
| 2-8  | a11y の自動検査を、違反があれば落ちる形にする                                     | □□□        |
| 2-9  | 自動検査で拾えない a11y を確かめる                                                | □□□        |
| 2-10 | 2-5 の残りの部品（リンク・コードブロック）を、ストーリーとテストつきで作る        | □□□        |
| 2-11 | React Aria で状態を持つ部品（テーマ切り替え・メニュー）を作る                     | □□□        |
| 2-12 | React Aria で目次を作る。PC では記事の右に固定し、スマートフォンでは開閉する      | □□□        |
| 2-13 | React Aria のフックに置き換え、さらに自作に置き換える                             | □□□        |

作業ブランチは作らず、`dev` に直接コミットする。

## 作るもの

| 場所                                                  | 中身                                                                                                                       |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                                        | Storybook の4パッケージ（`11.0.0-beta.1`）と `vite` を devDependencies に足す。`storybook`・`build-storybook` のスクリプト |
| `.gitignore`                                          | ビルドの出力先 `storybook-static/` とログを、git の対象から外す。oxlint と oxfmt もこの指定に従う                          |
| `.storybook/main.ts`（新規）                          | Storybook 全体の設定。どこのストーリーを読むか、どのアドオンを使うか                                                       |
| `.storybook/preview.tsx`（新規）                      | ストーリーを描く画面の設定。Panda の CSS、Geist のフォント、スマートフォン幅の既定                                         |
| `app/_components/tag.stories.tsx`（新規）             | タグのストーリー（`Medium`・`Small`）                                                                                      |
| `app/_components/post-card.stories.tsx`（新規）       | カードのストーリー（`Default`・`LongTitle`）                                                                               |
| `docs/adr/<yyyymmdd-hhmm>-storybook-setup.md`（新規） | この回で決めたこと（11 の beta を使うこと、入れ方、CSF Next、インストール時スクリプトの扱い）                              |

今回は扱わないもの: テストの実行（`@storybook/addon-vitest`、2-7）、a11y の自動検査を落ちる形にする設定（2-8）、ダークモードを Storybook の中で切り替えるボタン、MDX で書くトークンの一覧、Storybook の公開。

## なぜこれをやるか

2-5 で部品を2つ作り、`/design-system` に並べた。ただ、`/design-system` は公開するページなので、そこで部品の大きさを切り替えたり、わざと壊した状態を並べたりはしにくい。部品を作る人のための作業台が別に要る。

Storybook はその作業台になる。部品を1つずつ取り出し、引数（props）を変えながら眺められる。2-7 からは、ここで書いたストーリーがそのままテストの単位になる。a11y の検査もストーリーごとに走る。

この回でつまずきやすいのは、**Next.js が裏でやってくれていたことを、Storybook では自分で用意する**点だ。Storybook は `app/layout.tsx` を通らずに部品だけを描く。そのため、layout が `<html>` に付けていたフォントの設定や、ページの幅は、`.storybook/preview.tsx` に書き直すことになる。手順 6 で、この差に実際にぶつかる。

## 周辺知識

### Storybook 11 と CSF Next（出典: https://storybook.js.org/docs/11/writing-stories/csf/api 、https://github.com/storybookjs/storybook/blob/next/MIGRATION.md 、2026-11-14 確認）

- **CSF**（Component Story Format）は、ストーリーのファイルの書き方の決まり。CSF 3 までは `export default { component }` とオブジェクトを書いていた
- **CSF Next** は関数を順に呼んで型を引き継ぐ書き方。`definePreview()` → `preview.meta()` → `meta.story()` → `Story.extend()` の順に呼ぶ
- Storybook 10 では Preview（正式版の手前）だった。11 では「CSF 4」の名前で標準の書き方になり、`storybook init` も 11.0.0-beta.1 からこの形で書く。CSF 3 も引き続き使え、非推奨にはなっていない
- `defineMain` は `@storybook/nextjs-vite/node` から、`definePreview` は `@storybook/nextjs-vite` から import する
- `definePreview({ addons: [...] })` にアドオンを渡すと、そのアドオンの設定に型が付く
- `Story.extend()` で派生させると、`args` は浅く上書き、`parameters` は深く上書き、`tags` は足し合わせになる
- ストーリーの題名はファイルの場所から自動で付く。何も設定しないと、`app/_components/tag.stories.tsx` の題名は `_components/tag` になり、サイドバーにはフォルダ名がそのまま出る。`main.ts` の `stories` に `titlePrefix`（題名の頭に付ける言葉）を書くと `Components/tag` になる。どちらでも、URL などに使う ID は `components-tag--medium` で変わらない（実測）

### Storybook 11 の状態と、10 からの主な違い（出典: MIGRATION.md と https://github.com/storybookjs/storybook/blob/next/CHANGELOG.prerelease.md 、2026-11-14 確認）

- 2026-11-14 時点の 11 は beta で、`next` タグは `11.0.0-beta.3` を指す。正式版の日付は公表されていない（公式の告知は「coming soon」）。11 用のドキュメントのサイトも「Version 11 (alpha)」と表示している
- **beta** は正式版の前の試用版。機能はほぼ出そろい、不具合を直している段階を指す
- Node.js は 22.12 以上が要る。このリポジトリは mise で 24.22.1
- `preview.meta({ args })` には、部品の props にある名前しか書けなくなった（11.0.0-alpha.2 の「CSF: Type meta args by the keys you provide」）。10.6.6 では、知らない名前を書いても型検査が通った（実測）
- `storybook dev` は、ブラウザを自動では開かなくなった。開きたいときは `--open` を付ける
- props の表（Autodocs・Controls）は、サーバー側で TypeScript が型を読んで作る方式（`docgenServer`）が既定になった。TypeScript 7 にはこのための API がないので、`typescript` パッケージは 6 のままにしておく必要がある。このリポジトリは `typescript` を `npm:@typescript/typescript6@6.0.2` にしてあり（ADR `20261103-1640-markuplint-with-typescript6.md`）、移行ガイドが勧める形とそのまま同じになっている
- ストーリーのコードを見せる「Code」パネルが、最初から出るようになった。11.0 では、Controls で引数を変えてもコードの表示は変わらない（既知の制限。11.1 までに直す予定）
- サイドバーは react-aria-components で作り直された。2-11 から使う React Aria の部品が、Storybook の画面そのものに使われている
- webpack 版の `@storybook/nextjs` は非推奨になり、12 で削除される予定
- 既定の表示幅を `parameters.viewport.defaultViewport` で決める書き方はなくなった。この回で使う `initialGlobals` が今の書き方
- サイドバーで右クリック（または ⌘ + Shift + U）すると、メニューが開く。「すべて開く・閉じる」や、2-7 で addon-vitest を入れたあとはテストの実行もここからできる
- git の差分から、変えたファイルに関係するストーリーに印を付ける機能（change detection）が、設定なしで常に動く。開発サーバーのときだけ動く
- タグでサイドバーを絞り込む機能（Tag filters）が正式になった。2-8 で検査の対象を決めるときに使う
- 部品の一覧を AI 向けの JSON（`manifests/components.json`）に書き出す機能が、React では最初から有効になっている。ビルドの出力の中にファイルができるだけで、外には送らない（実測）。AI 向けの機能（MCP、skills）はまだ preview の段階で、この寄り道では使わない

### フレームワークとアドオン（出典: https://storybook.js.org/docs/get-started/frameworks/nextjs-vite 、2026-11-11 確認）

| パッケージ               | 役割                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `storybook`              | 本体と CLI。ビューポート（表示幅の切り替え）、Controls、背景色などは本体に入っている        |
| `@storybook/nextjs-vite` | Next.js の部品を Vite で描くためのフレームワーク。`next/link`・`next/font` などを差し替える |
| `@storybook/addon-docs`  | Autodocs（props の表つきの説明ページ）を作る                                                |
| `@storybook/addon-a11y`  | axe でストーリーを検査し、違反をパネルに出す。色覚の見え方のフィルターも持つ                |

- `next/link` は Storybook の中ではリンク先に移動しない部品に差し替わる。押すと Actions パネルに `next/link::Link` が記録される
- Next.js 16.4 で App Router の差し替えの部品が落ちる不具合は、10 系では 10.6.3、11 では 11.0.0-alpha.7 で直っている
- React Compiler は Storybook の中では効かない（`next.config.ts` の `turbopackRustReactCompiler` は、フレームワークが取り除いてから読む）。最適化なので、表示の結果は変わらない
- `@storybook/addon-a11y` の既定では、違反があっても警告にとどまる（`test: "todo"`。11.0.0-beta.1 のソースで確認）。落ちる形にするのは 2-8

### ビューポートの既定の幅（`storybook` 11.0.0-beta.1 の `MINIMAL_VIEWPORTS`）

| キー      | 名前         | 幅 × 高さ   |
| --------- | ------------ | ----------- |
| `mobile1` | Small mobile | 320 × 568   |
| `mobile2` | Large mobile | 414 × 896   |
| `tablet`  | Tablet       | 834 × 1112  |
| `desktop` | Desktop      | 1280 × 1024 |

320px は、WCAG 1.4.10（リフロー）が「横にスクロールせずに読めること」を求める幅でもある。

### 実測したこと

2026-11-14、`dev` の `41e0e67` と同じ内容を一時ディレクトリに複製し、macOS / Node 24.22.1 / bun 1.4.4 / Next.js 16.4.1 / Storybook 11.0.0-beta.1 / Vite 8.3.7 で、このチケットの手順どおりに動かした。Storybook の画面は、`storybook build` の出力を手元で配信し、Playwright 1.65.0 の Chromium で開いて確かめた。

- `bun add -d` で入れると、`package.json` には `^` の付かない版（`11.0.0-beta.1`）で書かれる。`bunfig.toml` は書き換わらない。新しく止められたインストール時スクリプトは `esbuild@0.28.2` の `postinstall` だけで、止めたままでも `storybook build` と開発サーバーが動く
- 版を書かずに入れると、`storybook@next` では `11.0.0-beta.0`、`storybook@latest` では `10.6.7` が入る（11-14 時点）
- `storybook build` が通り、ストーリーは `components-tag--docs`・`--medium`・`--small`、`components-post-card--docs`・`--default`・`--long-title` の6つ
- Panda の CSS が Storybook に届く。暗いときの表示（`prefers-color-scheme: dark`）では、背景が `rgb(0, 0, 0)`、文字が `rgb(242, 242, 242)` になる
- フォントの変数を付けないときと、部品を包む `div` に付けたときは、タグの `font-family` が `ui-sans-serif, system-ui, ...` になる。`<html>` に付けると `Geist, "Hiragino Sans", "Noto Sans JP", sans-serif` になる
- `initialGlobals` で `mobile1` を既定にすると、ストーリーを描く枠の幅は 320px になる。カードの長い題名も横にはみ出さない（`scrollWidth` と `clientWidth` がどちらも 320）
- 4つのストーリーとも、Accessibility タブは「Violations 0」「Passes 6」「Inconclusive 0」
- タグの名前を空にしたストーリーでは、「Link name（`link-name`）」の違反が1件、影響度「Serious」で出る
- `bun run tc`（tsrs）と `bun run lint` が通る。わざと型を壊したときのエラー文は手順 10 に写した
- oxlint と oxfmt は `.gitignore` を読む。`.gitignore` に `storybook-static/` があれば、`.oxlintrc.json` を変えなくても検査の対象から外れる
- 2-7 の下見として、`@storybook/addon-vitest` 11.0.0-beta.1 と Vitest 5.1.0 で、4つのストーリーと `.test()` 1つのテストが通ることも確かめた

**未確認**: 開発サーバー（`bun run storybook`）で開いた画面。起動して「Storybook ready!」が出るところまでは確かめたが、画面は `storybook build` の出力で見た。サイドバーや Accessibility タブの文言は同じはずだが、開発サーバーにだけある表示があるかもしれない。

### 現時点のバージョン（2026-11-14 確認）

| パッケージ               | バージョン    | この回での扱い                                                                    |
| ------------------------ | ------------- | --------------------------------------------------------------------------------- |
| `storybook`              | 11.0.0-beta.1 | 新しく入れる。beta.2 は 11-15 18:13、beta.3 は 11-17 0:44（日本時間）まで入らない |
| `@storybook/nextjs-vite` | 11.0.0-beta.1 | 新しく入れる                                                                      |
| `@storybook/addon-docs`  | 11.0.0-beta.1 | 新しく入れる                                                                      |
| `@storybook/addon-a11y`  | 11.0.0-beta.1 | 新しく入れる                                                                      |
| `vite`                   | 8.3.7         | 新しく入れる。8.3.8 は 11-14 11:49（日本時間）から入るが、検証した 8.3.7 にする   |
| `next`                   | 16.4.1        | そのまま                                                                          |
| `@pandacss/dev`          | 2.5.0         | そのまま                                                                          |
| （参考）`storybook`      | 10.6.7        | 10 系の最新の正式版（`latest` タグ）。この回では使わない                          |

## 作業手順（全体の地図）

1. Storybook 11 の4パッケージと Vite を、版を固定して入れる
2. スクリプトを足し、ビルドの出力先を git の対象から外す
3. Storybook 全体の設定（`main.ts`）を書く
4. ストーリーを描く画面の設定（`preview.tsx`）を最小の形で書く
5. タグのストーリーを CSF Next で書き、Storybook を開く（**この回の本題**）
6. 文字が Geist にならないのを確かめ、フォントの設定を `<html>` に付ける
7. スマートフォンの幅を既定にし、カードの長い題名の折り返しを見る
8. Autodocs と Controls で、引数を変えながら部品を眺める
9. a11y パネルと色覚のフィルターを使い、わざと違反を出す
10. わざと間違った引数を渡し、型検査が止めるのを確かめる
11. 暗いときの見た目を、DevTools で切り替えて見る
12. この回で決めたことを ADR に書く
13. lint・型検査・Storybook のビルドを通し、コミットして push する

## 確認事項

- [ ] **寄り道の位置と回数。** 推奨案「React Aria の前に 2-6〜2-9 の4回を置く。React Aria は 2-11 から」で作成。理由はカタログ・テスト・a11y の検査の3層を1回で入れると、つまずいたときにどの層の問題か分からないから。状態を持つ部品を作る前に検査の仕組みがあれば、2-11 以降の部品は最初から検査される（ADR `20261111-0041-storybook-detour.md`）。ただし、React Aria に戻るのが4回ぶん（2-10 を入れると5回ぶん）遅れる
- [x] **Storybook の版。【一般的な推奨からの逸脱】** 本人の指定（2026-11-14）で「`11.0.0-beta.1`」に変えた。最初の推奨案は「10.6.6。11 の beta は使わない」だった。11 を選ぶ利点は、11 で標準になる CSF 4 の形のまま始められ、正式版が出たときも beta から版を上げるだけで済むこと。`11.0.0-beta.1` に固定するのは、`next` タグが指す最新の beta（11-14 時点で beta.3）が `minimumReleaseAge`（3日）にかかり、版を書かずに入れると bun が別の古い beta（実測では beta.0）を黙って選ぶから。ただし、欠点は4つある。正式版の前なので、API や画面が変わったり、不具合が残っていたりする。11 用のドキュメントはまだ「alpha」の表示で、説明が足りないところがある。新しい beta が出るたびに上げるかを決め、そのつど3日待つ。正式版が出たら、版を上げる手間がもう1回かかる
- [ ] **フレームワーク。** 推奨案「`@storybook/nextjs-vite`」で作成。理由は公式の推奨で、2-7 で使う addon-vitest がこちらでしか動かないから。webpack 版の `@storybook/nextjs` は 11 で非推奨になり、12 で削除される予定。ただし、Next.js 本体は Turbopack で、Storybook は Vite で組み立てるので、2つの道具が同じ部品を別々に組み立てることになる。React Compiler も Storybook の中では効かない
- [ ] **入れ方。** 推奨案「`create storybook` の CLI を使わず、`bun add -d` で入れて設定を手で書く」で作成。理由は3つある。11.0.0-beta.1 の CLI も、`minimumReleaseAge` にかかる版を入れようとすると、`bunfig.toml` に除外の設定を書き足すかを尋ねてくる（ソースで確認）。11 の CLI は AI 向けの機能を入れるかも尋ね、はいと答えると、版を固定しない `npx skills@latest` を実行して `CLAUDE.md` と `AGENTS.md` に書き足す（ソースで確認）。どちらも ADR `20261103-1657-supply-chain-hardening.md` の方針に合わない。手で書けば、どのファイルが何をしているか分かる。ただし、CLI が用意してくれる例のストーリーや、`.gitignore` への追記は自分でやる。なお、11 の CLI は最初から CSF 4 で書くので、10 のときにあった「CSF 3 の設定を直す手間」はなくなった
- [ ] **書き方。** 推奨案「CSF Next（`defineMain`・`definePreview`・`preview.meta`・`meta.story`）」で作成。理由は 11 で CSF 4 として標準の書き方になり、引数の型が `meta` から `story` まで引き継がれるから。ただし、2-7 で使う `.test()` は 11 でもまだ実験的な機能で、設定（`experimentalTestSyntax`）で有効にする必要がある。`extend` の `args` に知らない名前を書いても、型検査は止めない（手順 10、実測）
- [ ] **この回で入れるアドオン。** 推奨案「`addon-docs` と `addon-a11y` の2つ。`addon-vitest` は 2-7」で作成。理由は a11y がこの寄り道でいちばんやりたいことなので、最初の回からパネルで違反を見られるようにしたいから。テストの実行は Vitest と Playwright が加わり、別の層になる。ただし、この回の a11y は「パネルで見る」までで、違反があってもどこも落ちない
- [ ] **ストーリーの置き場所。** 推奨案「部品の隣（`app/_components/tag.stories.tsx`）」で作成。理由は部品とストーリーを並べて開けるから。`panda.config.ts` の `include`（`./app/**/*.{ts,tsx}`）にも最初から入る。ただし、`app/` の中のファイルが増える。markuplint と型検査もストーリーのファイルを検査するようになる
- [ ] **サイドバーの名前。** 推奨案「題名は自動で付けたまま、`main.ts` の `titlePrefix` で頭に `Components` を付ける（「Components」→「tag」）」で作成。理由はファイルを動かせば題名も自動で変わり、ずれることがないうえ、`_components` というフォルダ名がサイドバーに出なくなるから。Shopify Polaris も同じ書き方をしている。ID は付けないときと同じ `components-tag--medium` になる（実測）。ただし、`stories` に書く場所が `app/_components/` に絞られるので、ほかのフォルダにストーリーを置くときは `stories` に足す必要がある。ファイル名の小文字（`tag`・`post-card`）はそのまま出る。大文字にしたいなら、`preview.meta({ title: "Components/Tag", ... })` と題名を書く
- [ ] **既定の表示幅。** 推奨案「`mobile1`（320px）」で作成。理由はモバイルファーストで組む方針（ADR `20261111-0041-storybook-detour.md`）で、320px はいちばん狭いスマートフォンの幅と WCAG 1.4.10 の基準の幅を兼ねるから。ただし、今よく使われる iPhone（390px 前後）より狭い。広い画面での見た目はツールバーで幅を切り替えて確かめる
- [ ] **フォントの読み込み方。** 推奨案「`.storybook/preview.tsx` でも `next/font/google` で Geist を読み、クラスを `<html>` に付ける」で作成。理由はサイトの `app/layout.tsx` と同じ仕組みにすれば、Storybook でも本番と同じ文字で見られるから（手順 6）。ただし、フォントの設定が `layout.tsx` と `preview.tsx` の2か所になる。片方だけ変えると見た目がずれる
- [ ] **暗いときの確かめ方。** 推奨案「この回は Chrome の DevTools で `prefers-color-scheme: dark` を真似して目で見る」で作成。理由はこのサイトのダークモードが OS の設定（メディアクエリ）で切り替わる作りで、Storybook のテーマ切り替えのアドオン（`@storybook/addon-themes`）はクラスか data 属性でしか切り替えられないから。ただし、Storybook のツールバーから1クリックでは切り替えられない。暗いときの自動検査は 2-8 で足す
- [ ] **`/design-system` との関係。** 推奨案「両方残す。`/design-system` は公開する展示、Storybook は手元の作業台。Storybook は公開しない」で作成。理由は役割が違うから（読者に見せるか、作る人が使うか）。ただし、部品を足すたびに、ストーリーと `/design-system` の両方に書くことになる
- [ ] **テレメトリー（匿名の利用状況の送信）。** 推奨案「`core: { disableTelemetry: true }` で切る」で作成。理由はこのリポジトリが外に送るものを減らす方針を取っているから（ADR `20261103-1657-supply-chain-hardening.md` の考え方に合わせる）。ただし、Storybook の開発チームに利用状況が届かなくなる
- [ ] **esbuild のインストール時スクリプト。** 推奨案「止めたまま。`trustedDependencies` に足さない」で作成。理由は止めても OS 用のバイナリは `optionalDependencies` で入り、ビルドも開発サーバーも動いたから（11.0.0-beta.1 で実測）。ただし、esbuild の CLI を直接呼ぶと少し遅くなる（esbuild の公式ドキュメント）。このリポジトリでは直接呼ばない
- [ ] **ADR を書くか。** 推奨案「書く（手順 12）」で作成。理由は 11 の beta を選んだ理由、CLI を使わない理由、esbuild の扱いが、2-7 以降でパッケージを足すときや正式版に上げるときの前提になるから。ただし、手順が1つ増える
- [ ] **【標準ルールからの逸脱】TDD を適用しない。** 本人の判断（2026-11-03）による。テストは 2-7 から書く

## ハンズオン

コマンドの出力と画面の文言は、`41e0e67` と同じ内容を一時ディレクトリに複製して実際に動かし、写したもの（2026-11-14、Node 24.22.1 / bun 1.4.4 / Storybook 11.0.0-beta.1 / Playwright 1.65.0 の Chromium）。画面は `storybook build` の出力で確かめた（周辺知識の「未確認」を参照）。

---

### 準備：この回で何をするのか

部品の「撮影スタジオ」を作る。Next.js のページはヘッダーや記事の本文と一緒に部品を描く。Storybook は部品だけを真っ白な台の上に載せ、照明（引数）を変えながら1つずつ撮り直せる場所だ。撮った1枚1枚を**ストーリー**と呼ぶ。タグなら「大きいタグ」「小さいタグ」が、それぞれ1つのストーリーになる。

この回では、スタジオを建て（手順 1〜4）、タグとカードを載せて撮り（手順 5〜7）、撮った写真を見本帳と検査機にかける（手順 8〜9）。

#### Storybook の2つの設定ファイル

設定ファイルは `.storybook/` に2つ置く。役割がはっきり分かれているので、先に押さえておく。

- `main.ts` は**スタジオの建物の設計図**。どの部屋（フォルダ）からストーリーを集めるか、どの機材（アドオン）を置くかを書く。Node.js の上で読まれる
- `preview.tsx` は**撮影台の照明と背景**。すべてのストーリーに共通で当てる CSS やフォントを書く。ブラウザの中で読まれる

#### Storybook の中の仕組み

Storybook を動かすと、役割の違う3つのものが動き出す。

```
 [受付 = Node.js]                       [ブラウザ]
  main.ts を読む                    ┌─ 案内所（サイドバー・パネル）──┐
  ストーリーの一覧を作る ─────────▶│            ▲ 手紙でやり取り     │
  TypeScript で props の表を作る ─▶│  ┌─ 展示ケース（iframe）───┐   │
  Vite で展示ケースを組み立てる ──▶│  │ preview.tsx が飾り付け   │   │
                                    │  │ 部品（next/* は代役）    │   │
                                    │  └──────────────────────────┘   │
                                    └──────────────────────────────────┘
```

- `main.ts` は受付の仕事のメモなので、Node.js が読む。`preview.tsx` は展示ケースの飾り付けなので、ブラウザが読む
- 展示ケースの中では Next.js 本体は動かない。だから `app/layout.tsx` は通らず、`next/link` や `next/font` も代わりの部品に差し替わる
- サイドバーやパネル（案内所）と展示ケースは、別々のページとして動き、手紙（`postMessage`）でやり取りする。11 では、決まった相手からの手紙しか受け取らないように厳しくなった
- a11y の検査（axe）は展示ケースの中で、部品を描いたあとに走り、結果を手紙で案内所のパネルに送る

（Storybook 11.0.0-beta.1 のソースを読んで確かめた。`storybook/dist/channels`、`@storybook/builder-vite`、`vite-plugin-storybook-nextjs`、`@storybook/addon-a11y` の dist）

#### Storybook 11 の beta を使う

この回は、正式版の前の **beta**（試用版）の Storybook 11 を使う。機能はほぼそろっていて、今は不具合を直している段階だ。そのため、版は検証した `11.0.0-beta.1` にきっちり固定し、この回の途中で新しい beta が出ても上げない。画面の文言がこのチケットと違ったら、まず `package.json` の版が `11.0.0-beta.1` になっているかを見る。

#### 用意するもの

- 2-5 までが終わった `dev`（`41e0e67` 以降）
- Chrome（手順 6 と手順 11 で DevTools を使う）

---

### 手順 1：Storybook 11 の4パッケージと Vite を、版を固定して入れる

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
bun add -d storybook@11.0.0-beta.1 @storybook/nextjs-vite@11.0.0-beta.1 @storybook/addon-docs@11.0.0-beta.1 @storybook/addon-a11y@11.0.0-beta.1 vite@8.3.7
```

期待される出力（最後の数行）:

```
installed @storybook/addon-docs@11.0.0-beta.1
installed @storybook/addon-a11y@11.0.0-beta.1
installed vite@8.3.7 with binaries:
 - vite

48 packages installed [10.22s]

Blocked 1 postinstall. Run `bun pm untrusted` for details.
```

入ったら、`package.json` を開いて `devDependencies` を見る。5つとも `^` の付かない版で書かれていればよい。

```json
    "@storybook/addon-a11y": "11.0.0-beta.1",
    "@storybook/addon-docs": "11.0.0-beta.1",
    "@storybook/nextjs-vite": "11.0.0-beta.1",
    "storybook": "11.0.0-beta.1",
    "vite": "8.3.7"
```

止められたスクリプトも見ておく。

```bash
bun pm untrusted
```

```
./node_modules/esbuild @0.28.2
 » [postinstall]: node install.js
```

（`lefthook` と `@parcel/watcher` も並ぶ。この2つは前からある）

**なぜ** — Storybook のパッケージは、本体とアドオンの版が1つでもずれると起動しない。`@storybook/` で始まるものは全部同じ版にそろえる。

`11.0.0-beta.1` と版を書くのは、名前で指す方法がどちらも使えないからだ。`storybook@latest` は 10 系の最新の正式版を指し、実測では `10.6.7` が入った。11 の最新を指す `storybook@next` は今 `11.0.0-beta.3` を指しているが、公開から3日たっていない。実測では、bun が `bunfig.toml` の `minimumReleaseAge` を通る古い beta を代わりに選び、`11.0.0-beta.0` がエラーも出さずに入った。どちらも、このチケットで検証した版とは違う。検証した版を、そのまま書いて固定する。

`vite` を自分で入れるのは、`@storybook/nextjs-vite` が「Vite は使う側が用意する」（peer dependency）という作りだから。Next.js 本体は Turbopack で組み立てるが、Storybook は Vite で組み立てる。

esbuild の `postinstall` は `trustedDependencies: []` で止まった。esbuild は OS ごとのバイナリを別のパッケージ（`@esbuild/darwin-arm64`）で配っていて、スクリプトを止めてもそちらは入る。実測でも、止めたままで Storybook が動いた。

---

### 手順 2：スクリプトを足し、ビルドの出力先を git の対象から外す

設定ファイルなので、まとめて書く。

`package.json` の `scripts` に2行足す。

```json
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
```

`.gitignore` の末尾に足す。

```gitignore
# Storybook のビルドの出力とログ
storybook-static/
*storybook.log
```

**なぜ** — `bun run storybook` で開発用のスタジオが開き、`bun run build-storybook` で静的なファイル一式が `storybook-static/` に書き出される。書き出されたファイルは Storybook の画面そのもの（数 MB の JavaScript）なので、git に入れない。

この1か所で、lint と整形の対象からも外れる。oxlint と oxfmt は `.gitignore` を読み、そこに書かれたファイルを検査しないからだ。実測では、`.gitignore` から `storybook-static/` を消して `bun run lint` を実行すると、次のように書き出されたファイルの中でエラーが出た（ファイル名の英数字はビルドのたびに変わる）。

```
storybook-static/assets/iframe-W6Cy2Vfj.js:985:911: error eslint(no-func-assign): '$de' is a function. help: Do not re-assign a function declared as a FunctionDeclaration.
storybook-static/assets/iframe-W6Cy2Vfj.js:985:923: error eslint(no-unused-expressions): Expected expression to be used help: Consider using this expression or removing it
```

`bun run format:check` も、`storybook-static/` の中のファイルを79件並べた。自分で書いたコードではないので、直しようがない。最初から外しておく。

---

### 手順 3：Storybook 全体の設定（`main.ts`）を書く

`.storybook/main.ts` を作る。

```ts
import { defineMain } from "@storybook/nextjs-vite/node";

export default defineMain({
  framework: "@storybook/nextjs-vite",
  stories: [
    { directory: "../app/_components", files: "**/*.stories.tsx", titlePrefix: "Components" },
  ],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  core: { disableTelemetry: true },
});
```

**なぜ** — 1行ずつ見ていく。

- `defineMain` は中に書いた設定に型を付けるための関数。CSF Next では設定もストーリーも `define〜` の関数で包む。`/node` から import するのは、このファイルがブラウザではなく Node.js の上で読まれるから
- `framework` は「どの道具で部品を組み立てるか」。Next.js の部品を Vite で組み立てる
- `stories` は「どこからストーリーを集めるか」。`app/_components/` の下の `*.stories.tsx` を集める。`titlePrefix` は、ファイルの場所から自動で付ける題名の頭に `Components` を足す指定で、サイドバーが「Components」→「tag」になる（手順 5）
- `addons` は「スタジオに置く機材」
- `disableTelemetry` は、Storybook が匿名の利用状況を開発チームに送るのを止める

---

### 手順 4：ストーリーを描く画面の設定（`preview.tsx`）を最小の形で書く

`.storybook/preview.tsx` を作る。まずは最小の形にし、手順 6・7 で足していく。

```tsx
import { definePreview } from "@storybook/nextjs-vite";
import addonDocs from "@storybook/addon-docs";
import addonA11y from "@storybook/addon-a11y";
import "../app/globals.css";

export default definePreview({
  addons: [addonDocs(), addonA11y()],
  tags: ["autodocs"],
  parameters: {
    nextjs: { appDirectory: true },
    htmlLang: "ja",
  },
});
```

**なぜ** — `main.ts` が建物の設計図なら、ここは撮影台の準備になる。

- `import "../app/globals.css"` で、Panda の CSS をすべてのストーリーに当てる。`globals.css` に書いた1行（`@layer reset, base, tokens, recipes, utilities;`）を PostCSS が読み、Panda がトークンや部品の CSS をここに差し込む。Next.js と同じ `postcss.config.mjs` を、Vite もそのまま読む
- `addons: [addonDocs(), addonA11y()]` は、`main.ts` の `addons` と同じものをもう一度書いている。こちらに書くと、ストーリーの `parameters.a11y` などに型が付く。`main.ts` は「機材を運び込む」、ここは「機材の取扱説明書を撮影台に置く」くらいの違いだと思えばよい
- `tags: ["autodocs"]` は、すべての部品に説明ページ（Autodocs）を作る指定。手順 8 で見る
- `nextjs: { appDirectory: true }` は、このサイトが App Router（`app/`）で書かれていることを Storybook に伝える。`next/navigation` を使う部品が来たときに、差し替えの部品が App Router 用になる
- `htmlLang: "ja"` は、ストーリーを描く場所（`id="storybook-root"` の要素）に `lang="ja"` を付ける。読み上げや a11y の検査が、部品の中の文字を日本語として扱うようになる。`<html>` の `lang` は `en` のまま変わらない（実測）。Storybook の資料には「`<html>` に付ける」とあり、実物とずれている

---

### 手順 5：この回の本題。タグのストーリーを CSF Next で書き、Storybook を開く

ここが CSF Next の書き方の中心になる。最初に1枚だけ撮り、次に1枚派生させる。

#### 5-a：大きいタグを1枚撮る

`app/_components/tag.stories.tsx` を作る。

```tsx
import preview from "../../.storybook/preview";
import { Tag } from "./tag";

const meta = preview.meta({
  component: Tag,
  args: { tag: "react" },
});

export const Medium = meta.story({});
```

Storybook を起動する。

```bash
bun run storybook
```

期待される出力（抜粋）:

```
┌  storybook v11.0.0-beta.1
│
●  Starting...
│ ╭────────────────────────────────────────────────────────────────────────────╮
│ │   Storybook ready!                                                         │
│ │                                                                            │
│ │   - Local:                http://127.0.0.1:6106/                           │
│ │   - On your network:      run with --host <ip> to expose to local          │
│ │   network                                                                  │
│ │                                                                            │
│ ╰────────────────────────────────────────────────────────────────────────────╯
```

実測では `-p 6106` で起動したので、`Local:` の行は 6106 になっている。手順どおりなら `http://127.0.0.1:6006/` になる。

11 では、ブラウザは自動では開かない。`Local:` の行の URL を自分でブラウザに貼って開く。`On your network:` の行は、同じネットワークにある別の端末からは見えないという意味で、`--host` を付けたときだけ公開される。

開くと、左のサイドバーに「Components」→「tag」があり、その下に「Docs」と「Medium」が並ぶ。「Medium」を押すと、枠で囲んだ丸い「react」のタグが出る。

**なぜ「Components」「tag」という名前なのか** — ストーリーに題名を書かなかったので、Storybook がファイルの場所から題名を付けた。`stories` に書いた `app/_components/` から見た場所が `tag.stories.tsx` なので `tag` になり、手順 3 の `titlePrefix` で頭に `Components` が付いた。`titlePrefix` を書かないと「\_components」→「tag」と、フォルダ名がそのまま出る。ファイル名の小文字もそのまま出る。

**3つの関数が何をしているか**

CSF Next は3段の入れ子の箱だと考えると分かりやすい。

| 段        | 書き方                 | 中身                                                        |
| --------- | ---------------------- | ----------------------------------------------------------- |
| 撮影台    | `definePreview({...})` | すべてのストーリーに共通の設定（手順 4 の `preview.tsx`）   |
| 被写体    | `preview.meta({...})`  | どの部品を撮るか（`component`）と、全ストーリーに共通の引数 |
| 1枚の写真 | `meta.story({...})`    | その1枚だけの引数                                           |

`preview.tsx` を import してから `preview.meta()` を呼ぶのは、撮影台の設定（アドオンの型など）を被写体に引き継ぐためだ。`meta` に `component: Tag` を渡した時点で、`meta.story()` には `Tag` の props の型が付く。

**CSF 3 との違い（なぜ書き方が変わったのか）**

CSF 3 までは、ファイルの末尾で `export default { component: Tag }` とオブジェクトを書き出し、ストーリーも `export const Medium = { args: {...} }` とオブジェクトで書いていた。オブジェクトはそれぞれ独立した値なので、「この `Medium` は `Tag` のストーリーだ」という関係を TypeScript が知る手段がない。そのため `satisfies Meta<typeof Tag>` や `StoryObj<typeof meta>` といった型の注釈を、使う側が毎回書き足していた。

CSF Next では `preview` → `meta` → `story` と関数を順に呼ぶので、前の段の型が次の段に自動で渡る。型の注釈は1つも書いていないのに、`Medium` の引数には `Tag` の props の型が付いている。Storybook 11 はこの書き方を「CSF 4」と呼び、標準の書き方にした。

#### 5-b：小さいタグを派生させる

同じファイルの末尾に足す。

```tsx
import preview from "../../.storybook/preview";
import { Tag } from "./tag";

const meta = preview.meta({
  component: Tag,
  args: { tag: "react" },
});

export const Medium = meta.story({});

export const Small = Medium.extend({
  args: { size: "sm" },
});
```

保存すると、サイドバーに「Small」が増える（Storybook を起動したままでよい）。「Medium」と「Small」を行き来して、文字の大きさと左右の余白が変わることを確かめる。

**なぜ `extend` を使うのか** — `Small` は「`Medium` と同じで、大きさだけ違う」写真だ。`meta.story({ args: { size: "sm" } })` と書いても同じ見た目になるが、`extend` で書くと「`Medium` から派生した」という関係がコードに残る。あとで `Medium` に引数を足すと、`Small` にも自動で入る。

`tag: "react"` を `meta` に書いたのも同じ理由で、全ストーリーに共通の引数はいちばん上の段に1回だけ書く。

---

### 手順 6：文字が Geist にならないのを確かめ、フォントの設定を `<html>` に付ける

Storybook のタグと、`bun dev` で開いたサイトのタグを見比べると、文字の形が違う。Storybook のほうは、Mac ならシステムの書体（San Francisco）で描かれている。

#### 6-a：DevTools で文字の書体を見る

Storybook の画面でタグを右クリックし、「検証」を押す。DevTools の「Computed」タブで `font-family` を探す。実測では次の値だった。

```
ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"
```

サイトのほうで同じことをすると、先頭に `Geist` が来るはずだ。

**なぜこうなるのか** — サイトでは、`app/layout.tsx` が Geist を読み込み、`<html>` に `--font-geist-sans` という CSS 変数を持つクラスを付けている。Panda の `fonts.sans` は `var(--font-geist-sans), "Hiragino Sans", ...` なので、この変数があって初めて Geist になる。

Storybook は `layout.tsx` を通らない。変数がないまま `var(--font-geist-sans)` を読むと、CSS はこの宣言全体を「無効」として捨てる。`"Hiragino Sans"` に落ちるのではなく、宣言ごと捨てられて、Panda の既定の書体（上の `ui-sans-serif, ...`）になる。

#### 6-b：わざと内側の `div` に付けてみる

`preview.tsx` に、フォントを読み込んでストーリーを包む `div` に付ける処理（decorator）を足す。

```tsx
import { definePreview } from "@storybook/nextjs-vite";
import addonDocs from "@storybook/addon-docs";
import addonA11y from "@storybook/addon-a11y";
import { Geist, Geist_Mono } from "next/font/google";
import "../app/globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default definePreview({
  addons: [addonDocs(), addonA11y()],
  tags: ["autodocs"],
  parameters: {
    nextjs: { appDirectory: true },
    htmlLang: "ja",
  },
  decorators: [
    (Story) => (
      <div className={`${geistSans.variable} ${geistMono.variable}`}>
        <Story />
      </div>
    ),
  ],
});
```

**decorator** はすべてのストーリーを外側から包む額縁のようなもの。ここでは、Geist の変数を持つ `div` で包んでいる。

保存して、6-a と同じ方法で `font-family` を見る。実測では、**値は変わらなかった**（`ui-sans-serif, ...` のまま）。

**なぜ効かないのか** — `font-family` を宣言しているのは、Panda が書き出した `html` や `body` の CSS だ。CSS 変数は、**宣言している要素の位置で**値が決まる。`body` の位置から見ると、`--font-geist-sans` は子の `div` にしかなく、自分の位置ではまだ未定義になる。だから `body` の `font-family` は無効になり、その結果を子の `div` もタグも受け継ぐ。変数は親から子へは伝わるが、子から親へは伝わらない。

#### 6-c：`<html>` に付ける

decorator をやめ、`<html>` にクラスを付ける1行に置き換える。

```tsx
import { definePreview } from "@storybook/nextjs-vite";
import addonDocs from "@storybook/addon-docs";
import addonA11y from "@storybook/addon-a11y";
import { Geist, Geist_Mono } from "next/font/google";
import "../app/globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// app/layout.tsx と同じく <html> に付ける。CSS 変数は宣言した要素で解決されるので、内側の div では効かない
document.documentElement.classList.add(geistSans.variable, geistMono.variable);

export default definePreview({
  addons: [addonDocs(), addonA11y()],
  tags: ["autodocs"],
  parameters: {
    nextjs: { appDirectory: true },
    htmlLang: "ja",
  },
});
```

保存して `font-family` を見る。実測では次の値になった。

```
Geist, "Hiragino Sans", "Noto Sans JP", sans-serif
```

**なぜ `document` に直接書けるのか** — `preview.tsx` はブラウザの中で読まれるファイルなので（準備の節を参照）、`document` がある。`main.ts` に同じことを書くと、Node.js の上では `document` がないので落ちる。2つの設定ファイルの役割の違いが、ここに表れている。

**`layout.tsx` と同じにする理由** — Storybook は本番と同じ見た目で部品を確かめる場所なので、フォントの読み込み方も本番に合わせる。ただし、これで設定が2か所になった。`layout.tsx` のフォントを変えたら、ここも変える。

---

### 手順 7：スマートフォンの幅を既定にし、カードの長い題名の折り返しを見る

#### 7-a：既定の表示幅を 320px にする

`preview.tsx` の `definePreview` に `initialGlobals` を足す。

```tsx
import { definePreview } from "@storybook/nextjs-vite";
import addonDocs from "@storybook/addon-docs";
import addonA11y from "@storybook/addon-a11y";
import { Geist, Geist_Mono } from "next/font/google";
import "../app/globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// app/layout.tsx と同じく <html> に付ける。CSS 変数は宣言した要素で解決されるので、内側の div では効かない
document.documentElement.classList.add(geistSans.variable, geistMono.variable);

export default definePreview({
  addons: [addonDocs(), addonA11y()],
  tags: ["autodocs"],
  parameters: {
    nextjs: { appDirectory: true },
    htmlLang: "ja",
  },
  initialGlobals: {
    viewport: { value: "mobile1", isRotated: false },
  },
});
```

ブラウザを再読み込みすると、ストーリーを描く枠が細くなる。上のツールバーの表示幅のボタンに「Small mobile」と出て、枠の上の入力欄は「W 320px」「H 568px」になる（実測）。

**なぜ** — このサイトの読者は、スマートフォンから読む人が多いと見込んでいる。だから部品もまず狭い画面で見る。**globals** はツールバーで切り替えられる「スタジオ全体の状態」のこと（表示幅、背景色など）で、`initialGlobals` はその最初の値になる。`mobile1` は Storybook に最初から入っている幅の1つで、320 × 568 の「Small mobile」を指す。

320px にしたのは、いちばん狭いスマートフォンの幅だからだ。WCAG 1.4.10（リフロー）も、横にスクロールせずに読めることを 320px の幅で求めている。ここで崩れなければ、広い画面でも崩れにくい。

#### 7-b：カードのストーリーを書く

`app/_components/post-card.stories.tsx` を作る。

```tsx
import preview from "../../.storybook/preview";
import { PostCard } from "./post-card";

const meta = preview.meta({
  component: PostCard,
  args: {
    slug: "blog",
    title: "ブログを作り始めた",
    date: "2026-09-25",
  },
});

export const Default = meta.story({});

export const LongTitle = Default.extend({
  args: {
    title: "とても長い題名がスマートフォンの幅でどう折り返されるかを確かめるための記事",
  },
});
```

サイドバーの「Components」→「post-card」→「Long Title」を開く。サイドバーのストーリー名は、`export` の名前 `LongTitle` を単語に分けて付く。320px の幅の中で、題名が何行かに折り返され、カードが横にはみ出さないことを確かめる。

**なぜ長い題名のストーリーを作るのか** — 部品が崩れるのは、たいてい中身が想定より長いか短いときだ。実際の記事には長い題名もある。サイトでそういう記事が来るのを待たずに、崩れやすい状態を最初から1枚の写真にしておく。こうした「極端な状態のストーリー」を足していくのが、Storybook の使い方の基本になる。

---

### 手順 8：Autodocs と Controls で、引数を変えながら部品を眺める

サイドバーの「tag」の下にある「Docs」を開く。実測では次のように並んだ。

- いちばん上に「tag」の見出しと、「Medium」の見本が出る。見本の下に「Show code」と「Copy code」のボタンがある
- その下に、props の表が出る。列は「Name」「Description」「Default」「Control」

| Name      | Description   | Default | Control                   |
| --------- | ------------- | ------- | ------------------------- |
| `tag`     | `string`      | `-`     | 文字の入力欄（`react`）   |
| `onClick` | `() => void`  | `-`     | なし（`-`）               |
| `size`    | `"sm"` `"md"` | `-`     | `sm` と `md` の選択ボタン |

- 表の「Control」の列で `size` を `sm` に切り替えると、上の見本が小さくなる
- 表の下に「Stories」の見出しがあり、「Medium」「Small」の見本が並ぶ

ストーリーの画面（「Medium」）でも、下のパネルの「Controls」タブで同じように切り替えられる。パネルのタブは「Controls」「Actions」「Interactions」「Code」「Accessibility」の5つだ（実測）。

**なぜ** — 手順 4 の `tags: ["autodocs"]` で、すべての部品にこのページが自動で作られた。props の表は `tag.tsx` の型（`TagProps`）を読んで作られる。2-5 で `RecipeVariantProps` から取り出した `size` の型が、そのまま表と切り替えの選択肢になっている。

11 では、この型の読み取りを Node.js の側で TypeScript が行う。TypeScript 7 には型を読むための API がないので、Storybook は 6 の `typescript` パッケージを使う。このリポジトリは `typescript` の中身を 6 にしてあるので（ADR `20261103-1640-markuplint-with-typescript6.md`）、何も足さずに表が出た。

`/design-system` との違いもここで見える。`/design-system` は「決まった状態を並べた展示」で、こちらは「状態を手で動かせる作業台」だ。

**`size` の「Default」が `-` で、どちらも選ばれていない理由** — 見本は `md` の大きさで描かれているのに、表の「Default」は `-` で、選択ボタンもどちらにも印が付いていない。`md` を既定にしているのは、2-5 で `cva()` に書いた `defaultVariants` で、部品の props の既定値ではないからだ。Storybook は props の型と既定値しか読まないので、`cva()` の中の既定は表に出ない。

**Controls で切り替えても見た目が崩れない理由** — Panda は、ファイルの中の `cva()` に書いた種類（`sm`・`md`）を、使われているかどうかに関係なく全部 CSS にする。Controls でどちらに切り替えても、CSS はもうある。`panda.config.ts` に書く config recipe（2-5 で採らなかった書き方）だと、使われていると分かる種類しか CSS にならないので、Storybook では別の設定（`staticCss`）が要る。

**「Code」タブについて** — 11 で最初から出るようになったタブで、ストーリーのコードを見せる。ただし 11.0 では、Controls で引数を変えてもコードの表示は変わらない（Storybook が既知の制限として挙げている）。

---

### 手順 9：a11y パネルと色覚のフィルターを使い、わざと違反を出す

この寄り道でいちばんやりたい a11y の、最初の一歩になる。

#### 9-a：違反がないことを見る

「tag」の「Medium」を開き、下のパネルの「Accessibility」タブを押す。タブの中は「Violations」（違反）・「Passes」（合格）・「Inconclusive」（判定できなかったもの）の3つに分かれ、それぞれに件数が付く。

実測では、タグ2つとカード2つの4つのストーリーとも、「Violations 0」「Passes 6」「Inconclusive 0」だった。「Violations」の下には「No accessibility violations found.」と出る。

**なぜ** — このパネルの裏では **axe**（アクス）という検査の道具が動いている。axe は描かれた HTML と計算後の色を見て、WCAG のルールに合っているかを1つずつ確かめる。ストーリーを開くたびに検査が走る。

#### 9-b：わざとリンクの名前を消す

`tag.stories.tsx` の末尾に、名前が空のタグを足す。

```tsx
export const Empty = Medium.extend({
  args: { tag: "" },
});
```

「Empty」を開くと、枠だけで文字のない小さな丸が出る。パネルのタブの名前が「Accessibility 1」に変わり、「Violations 1」の下に次の1行が出る（実測）。

```
Link name  link-name                                  Serious  1
```

行の右端の矢印（「Expand details for: Link name」）を押すと、説明が開く。

```
Give each link meaningful text or an aria-label so its purpose is clear.
Learn how to resolve this violation

Element does not have text that is visible to screen readers. aria-label attribute does not exist or is empty. aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty. Element has no title attribute. Element is in tab order and does not have accessible text.
```

その下の「Jump to element」を押すと、問題のタグの位置に移る。

**なぜこれが違反なのか** — タグは `<a>`（リンク）だ。スクリーンリーダーはリンクに来ると中の文字を「名前」として読み上げる。中が空だと、「リンク」とだけ読まれ、どこへ飛ぶのか分からない。目で見える人にとっても、文字のない丸は押していいのか分からない。

**「Serious」は何か** — axe が違反ごとに付ける影響の大きさで、軽いほうから minor・moderate・serious・critical の4段階ある。リンクの名前がないと、読み上げを使う人はそのリンクを使えないので、2番目に重い serious になっている。

確かめたら、`Empty` の3行を消す。

**今はどこも落ちない** — この違反は、パネルに出るだけで、型検査も lint もビルドも止めない。`@storybook/addon-a11y` の既定（`test: "todo"`）が「違反は警告として出すだけ」だからだ。違反があればテストを落とす形にするのは 2-8 で、そこでは今の `Empty` と同じ壊し方をもう一度使う。

#### 9-c：色覚のフィルターで見る

ツールバーの「Small mobile」の右にある、人の形のボタン（「Vision filter」）を押す。次の見え方を選べる（実測。右の割合は Storybook が表示している、その見え方の人の割合）。

| 名前               | 表示される割合 | 見え方                        |
| ------------------ | -------------- | ----------------------------- |
| Reset color filter | -              | フィルターを外す              |
| Blurred vision     | 22.9%          | ぼやけた見え方                |
| Deuteranomaly      | 2.7%           | 2型（緑を感じにくい）の弱い型 |
| Deuteranopia       | 0.56%          | 2型の強い型                   |
| Protanomaly        | 0.66%          | 1型（赤を感じにくい）の弱い型 |
| Protanopia         | 0.59%          | 1型の強い型                   |
| Tritanomaly        | 0.01%          | 3型（青を感じにくい）の弱い型 |
| Tritanopia         | 0.016%         | 3型の強い型                   |
| Achromatopsia      | 0.0001%        | 色を感じない見え方            |
| Grayscale          | -              | 白黒                          |

「post-card」の「Default」を開いて、Deuteranopia と Protanopia に切り替える。題名のリンクの青と、日付の灰色が見分けられるかを見る。終わったら「Reset color filter」で戻す。

**なぜ** — 今のサイトは青と灰色しか使っていないので、どの見え方でも大きくは変わらないはずだ。このサイトでは、あとで 404 のページやエラーの表示に赤・黄・緑を足す予定がある。色を足す回に、ここで見え方を確かめる習慣を先に作っておく。

**フィルターは検査ではない** — この機能は、画面にフィルターをかけて見え方を変えるだけだ。axe は計算後の色で検査するので、フィルターをかけても検査の結果は変わらない。「この見え方で区別できるか」は自分の目で判断する。自動で確かめる方法は 2-9 で扱う。

---

### 手順 10：わざと間違った引数を渡し、型検査が止めるのを確かめる

#### 10-a：ない大きさを渡す

`tag.stories.tsx` の `Small` の `size` を、ない種類にする。

```tsx
export const Small = Medium.extend({
  args: { size: "lg" },
});
```

型検査を走らせる。

```bash
bun run tc
```

期待される出力:

```
app/_components/tag.stories.tsx(12,11): error TS2322: Type '"lg"' is not assignable to type '"md" | "sm" | undefined'.
```

**ここで止まる理由** — 型の注釈を1つも書いていないのに、ストーリーの引数に `Tag` の型が付いている。手順 5 で見た「関数を順に呼んで型を引き継ぐ」の効き目がこれだ。2-5 の手順 8 で、ページの中に `size="lg"` と書いて止まったのと同じ型が、Storybook の中まで届いている。

#### 10-b：必須の引数を消す

`"sm"` に戻したら、`meta` の `args` から `tag` を消す。

```tsx
const meta = preview.meta({
  component: Tag,
  args: {},
});
```

```bash
bun run tc
```

期待される出力:

```
app/_components/tag.stories.tsx(9,34): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Argument of type '{}' is not assignable to parameter of type 'never'.
```

**このエラーの読み方** — `tag` は `Tag` の必須の props なので、どこかで渡さないと描けない。`meta` で渡さないなら、`meta.story()` の側で渡す必要がある。ところが `Medium` は `meta.story({})` と何も渡していないので、TypeScript が「この呼び方はどの形にも合わない」と止めた。`'never'`（あり得ない型）という言い回しは分かりにくいが、**必須の引数がどこにもない**という意味だと覚えておく。

#### 10-c：部品にない名前を足す（11 で止まるようになった）

`args: { tag: "react" }` に戻したら、`Tag` の props にない `color` を足す。

```tsx
const meta = preview.meta({
  component: Tag,
  args: { tag: "react", color: "red" },
});
```

```bash
bun run tc
```

期待される出力:

```
app/_components/tag.stories.tsx(6,25): error TS2322: Type 'string' is not assignable to type 'undefined'.
```

**このエラーの読み方** — 11 では、`preview.meta()` の `args` に書ける名前が、部品の props にあるものだけになった。props にない `color` には「何も入れてはいけない」（`undefined`）という型が付くので、`"red"` という文字（`string`）を入れると止まる。10.6.6 で同じことをすると、型検査は何も言わずに通った（実測）。props の名前を書き間違えても気づけるようになった、ということだ。

ただし、`extend` の `args` には、知らない名前を書いても止まらない。`Small` に `sise: "md"` のような打ち間違いを足しても、型検査は通った（実測）。`extend` で派生させたストーリーの引数は、画面で目で確かめる。

確かめたら `args: { tag: "react" }` に戻し、もう一度 `bun run tc` でエラーがなくなるのを見る。

---

### 手順 11：暗いときの見た目を、DevTools で切り替えて見る

1. Storybook で「post-card」の「Default」を開く
2. ストーリーの上で右クリックして「検証」を押し、DevTools を開く
3. DevTools の右上の「⋮」→「More tools」→「Rendering」を開く
4. 「Emulate CSS media feature prefers-color-scheme」を `prefers-color-scheme: dark` にする

ストーリーの背景が黒、文字が白に変わる（実測では、背景が `rgb(0, 0, 0)`、文字が `rgb(242, 242, 242)`）。Accessibility タブの右端にある、丸い矢印のボタン（「Rerun accessibility scan」）を押すと、暗いときの色で検査し直す。

**なぜ DevTools を使うのか** — このサイトのダークモードは、OS の設定（`@media (prefers-color-scheme: dark)`）で切り替わる。Storybook のテーマ切り替えのアドオンは、HTML にクラスや data 属性を付けて切り替える作りなので、OS の設定には触れない。DevTools の Rendering は、ブラウザに「OS が暗い設定になっている」と思い込ませる機能で、サイトと同じ条件で見られる。

この確かめ方は手作業なので、毎回はやらない。暗いときの検査を自動で走らせる方法は 2-8 で扱う。確かめたら、Rendering の設定は「No emulation」に戻す。

---

### 手順 12：この回で決めたことを ADR に書く

`docs/adr/` に ADR を作る。ファイル名の `yyyymmdd-hhmm` は作った日時に書き換える（例: `20261115-2030-storybook-setup.md`）。

```markdown
# Storybook 11 の beta を CSF Next と nextjs-vite で入れ、CLI を使わずに設定を手で書く

- 日付: 2026-11-xx
- 状態: 採用

## 背景

部品を1つずつ取り出して眺め、テストと a11y の検査をかける場所として Storybook を入れる（ADR `20261111-0041-storybook-detour.md`）。2026-11-14 の時点で、Storybook の正式版は 10.6 系、11 は beta だった。

## 決めたこと

- `storybook`・`@storybook/nextjs-vite`・`@storybook/addon-docs`・`@storybook/addon-a11y` を `11.0.0-beta.1` で、`vite` を `8.3.7` で入れる。`@storybook/` のパッケージは、すべて同じ版にそろえる
- `create storybook` の CLI は使わず、`bun add -d` で入れて `.storybook/main.ts` と `.storybook/preview.tsx` を手で書く
- 設定とストーリーは CSF Next（11 では CSF 4）で書く
- ストーリーは部品の隣に `*.stories.tsx` として置き、題名はファイルの場所から自動で付ける。`titlePrefix` で頭に `Components` を付ける
- Geist は `preview.tsx` でも `next/font/google` で読み、クラスを `<html>` に付ける
- 既定の表示幅は `mobile1`（320px）
- テレメトリーは切る
- esbuild の `postinstall` は止めたままにする

## 理由

- 11 では CSF Next が標準の書き方（CSF 4）になる。10 で始めて 11 に移るより、11 で始めれば、正式版が出たときの作業が版を上げるだけで済む
- `11.0.0-beta.1` に固定するのは、より新しい beta が `minimumReleaseAge`（3日）にかかって入らないから
- 11.0.0-beta.1 の CLI も、`minimumReleaseAge` にかかる版を入れようとすると、`bunfig.toml` に除外を書き足すかを尋ねてくる
- 11 では、`preview.meta` の `args` に props にない名前を書くと、型検査が止める
- CSS 変数は宣言した要素の位置で解決されるので、ストーリーを包む `div` に付けても `body` の `font-family` には効かない
- esbuild は止めても OS 用のバイナリが入り、ビルドも開発サーバーも動いた

## 採らなかった案

- **10.6 系の正式版で入れ、11 の正式版が出たら移る。** 安定しているが、11 で標準になる書き方へ移る回が別に要る
- **CLI（`bun create storybook`）で入れる。** `bunfig.toml` の除外を勧められる。AI 向けの機能を選ぶと、版を固定しない `npx skills@latest` が動き、`CLAUDE.md` も書き換わる
- **webpack 版の `@storybook/nextjs`。** 11 で非推奨になり、addon-vitest も使えない
- **既定の表示幅を指定しない。** 広い画面で見る癖がつき、スマートフォンで崩れても気づきにくい

## 気をつけること

- beta なので、正式版までに API や画面が変わることがある。新しい beta や正式版に上げるときは、`@storybook/` のパッケージをまとめて上げ、`bun run build-storybook` と `bun run tc` で確かめる
- props の表は、TypeScript 6 の `typescript` パッケージで作られる。11.0.0-beta.2 で TypeScript 7.1 の API で作る変更が入ったので、上げるときに `typescript` の扱いを見直す
- フォントの設定が `app/layout.tsx` と `.storybook/preview.tsx` の2か所にある。片方を変えたら、もう片方も変える
- React Compiler は Storybook の中では効かない
- `storybook-static/` は `.gitignore` で外してあり、oxlint と oxfmt もそれに従う
```

**なぜ** — 2-7 から `@storybook/addon-vitest` や Vitest を足していく。そのとき「版はそろえる」「CLI は使わない」「インストール時スクリプトは確かめてから」という前提を、ここに残しておく。11 の正式版が出て版を上げるときにも、この ADR を読み返す。

---

### 手順 13：lint・型検査・Storybook のビルドを通し、コミットして push する

開発サーバーは `Ctrl + C` で止めてから実行する。

```bash
bun run lint
```

```
✔ 23 files checked, 0 problems
```

（markuplint の行が並んだあとに出る。数はファイルの数で変わる）

```bash
bun run tc
```

エラーが出なければよい。

```bash
bun run build-storybook
```

期待される出力（最後の行）:

```
└  Storybook build completed successfully
```

途中で `"use client"` についての警告がいくつか出るが、Vite が「ここにある `"use client"` は使わない」と知らせているだけで、ビルドは通る。

コミットする。

```bash
git status
git add .storybook app/_components/tag.stories.tsx app/_components/post-card.stories.tsx package.json bun.lock .gitignore docs/adr tickets/2-6-storybook-catalog.md
git commit -m "feat: Storybook 11 を CSF Next で入れ、部品をスマートフォン幅で1つずつ確かめられるようにする"
```

コミットの直前に lefthook が format・oxlint・markuplint・型検査を走らせる。通ったら push する。

```bash
git push
```

---

### うまくいかないとき

| 症状                                                                          | 原因と対処                                                                                                                                 |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `package.json` に `10.6.7` が入った                                           | 版を書かずに `storybook@latest` で入れている。`latest` は 10 系を指す。`storybook@11.0.0-beta.1` のように版を書いて入れ直す                |
| `package.json` に `11.0.0-beta.0` など、`11.0.0-beta.1` 以外の beta が入った  | 版を書かずに `@next` で入れている。bun は公開から3日たっていない beta を避け、別の beta を黙って選ぶ。`11.0.0-beta.1` と版を書いて入れ直す |
| Storybook が「versions mismatch」のような警告を出す                           | `@storybook/` のパッケージの版がそろっていない。`package.json` で全部 `11.0.0-beta.1` になっているか見る                                   |
| `bun run storybook` のあと、ブラウザが開かない                                | 11 では自動で開かない。出力の `Local:` の行の URL をブラウザで開く                                                                         |
| `bun run lint` が `storybook-static/` の中のファイルのエラーで止まる          | 手順 2 で `.gitignore` に `storybook-static/` を足し忘れている                                                                             |
| タグの枠も角丸も出ない                                                        | `preview.tsx` で `../app/globals.css` を import し忘れている                                                                               |
| 文字が Geist にならない                                                       | フォントのクラスを `<html>` 以外に付けている。手順 6-c の1行（`document.documentElement.classList.add(...)`）になっているか見る            |
| `Type '"lg"' is not assignable to type '"md" \| "sm" \| undefined'.`          | 手順 10-a でわざと壊した状態のまま。`"sm"` に戻す                                                                                          |
| `Argument of type '{}' is not assignable to parameter of type 'never'.`       | `tag` をどこにも渡していない。`meta` の `args` に `tag` を書く                                                                             |
| `Type 'string' is not assignable to type 'undefined'.`（`preview.meta` の行） | `meta` の `args` に、部品の props にない名前を書いている。手順 10-c の `color` を消す。名前の書き間違いもこのエラーになる                  |
| 画面の文言やボタンの位置がチケットと違う                                      | 版が `11.0.0-beta.1` 以外になっている。`package.json` を見る。版が合っているのに違うときは、エラーや画面のようすを貼って聞いてほしい       |

ここに載っていないエラーが出たら、そのまま貼って聞いてほしい。

---

## 受け入れ条件

- [x] `package.json` の devDependencies に `storybook`・`@storybook/nextjs-vite`・`@storybook/addon-docs`・`@storybook/addon-a11y`（すべて `11.0.0-beta.1`）と `vite`（`8.3.7`）があり、`^` が付いていない
- [x] `.storybook/main.ts` が `defineMain` で書かれ、`stories` に `titlePrefix: "Components"` がある。`.storybook/preview.tsx` が `definePreview` で書かれている
- [x] `app/_components/tag.stories.tsx` と `app/_components/post-card.stories.tsx` があり、`preview.meta`・`meta.story`・`extend` で書かれている。`Empty` のストーリーと、手順 10-c の `color` は消してある
- [ ] `bun run storybook` で開いた画面のサイドバーに、「Components」の下の「tag」（Docs・Medium・Small）と「post-card」（Docs・Default・Long Title）が並ぶ（画面で確かめる条件。チェックなしのままのコミットを本人が了承）
- [ ] ストーリーを開いたときの表示幅が「Small mobile」（W 320px）になる（画面で確かめる条件。チェックなしのままのコミットを本人が了承）
- [ ] DevTools の Computed で、タグの `font-family` の先頭が `Geist` になっている（画面で確かめる条件。チェックなしのままのコミットを本人が了承）
- [ ] 「tag」の Docs に props の表が出て、`size` を切り替えると見本の大きさが変わる（画面で確かめる条件。チェックなしのままのコミットを本人が了承）
- [ ] 手順 9-b で、`Empty` のストーリーの Accessibility タブに「Link name（`link-name`）」の違反が出たのを見た（画面で確かめる条件。チェックなしのままのコミットを本人が了承）
- [ ] 手順 10-c で、`preview.meta` の `args` に props にない名前を書くと型検査が止まるのを見た（画面で確かめる条件。チェックなしのままのコミットを本人が了承）
- [x] `.gitignore` に `storybook-static/` がある
- [x] `bun run lint`・`bun run tc`・`bun run build-storybook` が通る（script 名を縮めたので、実際に通したのは `bun run l`・`bun run tc`・`bun run b-sb`）
- [ ] `docs/adr/` に、この回の ADR がある（新しくは作らず、版と入れ方の決めごとは `20261111-0041-storybook-detour.md` で足りると本人が判断）
- [x] `dev` にコミットして push している

## この回で理解したこと

着手後に埋める。受け入れ条件とは別に、何が分かったかを残す。

- [ ] `main.ts` と `preview.tsx` の役割の違いを、「どこで読まれるか（Node.js かブラウザか）」で説明できる
- [ ] Storybook の中で `app/layout.tsx` が通らない理由を、受付・案内所・展示ケースの図で説明できる
- [ ] `definePreview` → `preview.meta` → `meta.story` の順に呼ぶと、なぜ型の注釈なしで props の型が付くのかを説明できる
- [ ] 手順 6 で、フォントの変数を `div` に付けても効かなかった理由を、CSS 変数が解決される位置で説明できる
- [ ] 既定の表示幅を 320px にした理由を、モバイルファーストと WCAG 1.4.10 の両方から説明できる
- [ ] 手順 9 の違反がパネルに出るだけで、どこも落ちなかった理由を説明できる
- [ ] 色覚のフィルターをかけても axe の結果が変わらない理由を説明できる
- [ ] 正式版ではなく beta の `11.0.0-beta.1` を選んだときに、何を得て何を引き受けたのかを説明できる

## 参考

- CSF 4 の API（Storybook 11）: https://storybook.js.org/docs/11/writing-stories/csf/api
- Storybook 11 の移行ガイド: https://github.com/storybookjs/storybook/blob/next/MIGRATION.md
- Storybook 11 の変更履歴（beta まで）: https://github.com/storybookjs/storybook/blob/next/CHANGELOG.prerelease.md
- Storybook for Next.js with Vite: https://storybook.js.org/docs/get-started/frameworks/nextjs-vite
- Accessibility tests（Storybook 11）: https://storybook.js.org/docs/11/writing-tests/accessibility-testing
- Viewport（Storybook 11）: https://storybook.js.org/docs/11/essentials/viewport
- Storybook 11 のベストプラクティス: https://storybook.js.org/docs/11/ai/best-practices
- サイドバーと URL（titlePrefix）: https://storybook.js.org/docs/11/configure/user-interface/sidebar-and-urls
- Panda CSS と Storybook: https://panda-css.com/docs/installation/storybook
- WCAG 2.2 の 1.4.10 リフロー: https://www.w3.org/TR/WCAG22/#reflow
- Chrome DevTools の Rendering: https://developer.chrome.com/docs/devtools/rendering/emulate-css
