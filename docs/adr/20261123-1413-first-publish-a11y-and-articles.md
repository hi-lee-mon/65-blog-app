# a11y の不具合を直し、記事を7本に絞って最初の公開をする

- 日付: 2026-11-23
- 状態: 採用（2026-11-23。キーボード、動きを減らす設定、VoiceOver、Safari、本番の確認は未確認のまま本人が了承。チケット `tickets/4-0-first-publish.md`）
- 関連: ADR `20261122-1821-publish-first-path.md`（公開までの順番と a11y 監査の一覧）、ADR `20261115-2200-page-a11y-check-with-axe.md`（axe の検査）

## 背景

公開までの4回のうち、最後の回にあたる。2026-11-23 の a11y 監査で見つかった項目を最新のコードで調べ直すと、言語指定のないコードブロック、崩れた表、動きを減らす設定、ナビの `aria-current`、記事の題の重複が再現した。監査の一覧にはなかったが、`/posts/dns` の表も同じ原因で崩れていた。

記事11本には動作確認用の記事、答えを書いていない記事、表の中身が見本のままの記事が混ざっている。

## 決めたこと

1. 公開する記事は `blog`、`canonical`、`cloudflare-web-analytics`、`dns`、`pandacss`、`rem`、`umami` の7本にする
2. `hello`、`uiux`、`lib-or-util` は `content/draft/` に移す
3. `ogp` は短いメモなので `content/notes/ogp-type.mdx` に移し、題を「og:type を記事とそれ以外で使い分ける」に変える
4. axe の検査に幅 320px、ふせんのダイアログを開いた状態、横スクロールの確認を足す
5. コードブロックは全部 Shiki に通し、`role="group"` と `aria-label` で名前を付ける
6. Markdown の表は `remark-gfm` 4.0.1 で表にする
7. 動きを減らす設定を Panda CSS の `globalCss` の中に移す
8. ナビは一覧ページで `aria-current="page"`、子ページで `aria-current="true"` にする
9. 一覧カードの `article` を `div` にし、題を見出しにする
10. ナビとフッターのリンクの押せる範囲を24px以上にする
11. `/design-system` の見本のタグを、実在する `blog` と `css` にする
12. 共有画像の `alt` は 3-5b に回す
13. カードの `ul` が Safari で一覧と読まれるかは本人が VoiceOver で確かめ、読まれなければ次の回で直す
14. 本番へは `git push origin dev:main` で早送りする
15. ふせん `line-clamp` と `preload` もこの公開に含める（本人の変更。推奨は含めない）

## 採らなかった案

- **短い記事もすべて公開する。** 公開の手間は減るが、動作確認用の記事や答えのない記事が一覧に並ぶ
- **短い記事を削除する。** 一覧はすっきりするが、書きかけの内容が手元から消える
- **コードブロックを `role="region"` にする。** スクロール領域の作法として広く使われるが、記事によってはランドマークの一覧に同じ種類の項目が5個並ぶ
- **表を自作の処理で組み立てる。** 依存は増えないが、Markdown の表の文法を自分で保守することになる
- **子ページでナビの `aria-current` を外す。** 実装は単純になるが、いまどの区画にいるかが読み上げで分からなくなる
- **`git switch main` してから早送りする。** いつもの手順だが、未コミットの変更があると切り替えが止まるおそれがある

## 確認事項の推奨と欠点

- 記事を7本に絞る: 外した記事の URL は公開後に開けなくなる
- `ogp` をふせんにする: `/posts/ogp` の URL がなくなる
- 検査を広げる: `bun run ay` の時間が約15秒から約20秒に増える
- `role="group"` の名前: `tsx のコード例` のように言語名をそのまま読む
- `remark-gfm`: 依存が1つ増える
- `aria-current="true"`: 読み上げの文言がソフトによって違う
- カードの見出し: `PostCard` の props が1つ増える
- 24pxの押せる範囲: トークンが1つ増え、ナビとフッターが少し高くなる
- 実在するタグを見本にする: そのタグの記事がなくなると、また 404 になる
- 共有画像の `alt` を後回しにする: 公開の時点では内容ではなく画像の種類を説明する文のまま
- Safari の確認を本人に任せる: 読まれない場合は、公開の時点で不具合が残る
- `git push origin dev:main`: いつもの手順と違い、手元の `main` は別に更新が要る
- ふせん2件を含める: 短いメモのまま公開される

## 確かめた結果

2026-11-23 に、リポジトリの複製でチケットの手順を流した（next 16.4.6、react 19.3.1、remark-gfm 4.0.1、bun 1.4.4、Node.js 24.22.1）。

- 検査を広げると、幅 320px の `/posts/cloudflare-web-analytics` が `scrollable-region-focusable` で失敗した
- コードブロックの修正で、8件の検査がすべて通った
- `/posts/dns` に `<table>` が出て、幅 320px で横スクロールが出なかった
- 動きを減らす設定がビルド後の CSS に出た
- 記事ページのナビは `aria-current="true"`、一覧ページは `aria-current="page"` になった
- ナビとフッターのリンクは、すべて高さ24px以上になった。フッターの X は 8×18px から 24×24px になった
- 仕分けのあと、RSS は7件、sitemap は19件になり、外した記事の URL は sitemap に出なかった
- `bun run l`、`bun run fc`、`bun run tc`、`bun run ay` が通った

未確認: VoiceOver の読み上げ、Safari での一覧の読まれ方、本番環境の表示と CSP の応答、解析スクリプトの動作、`git push origin dev:main` の実行結果。

## 参考

- ADR `20261122-1821-publish-first-path.md` の「4-0 に一覧カードの a11y 修正を含める」
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA 1.2 aria-current](https://www.w3.org/TR/wai-aria-1.2/#aria-current)
- [remark-gfm](https://github.com/remarkjs/remark-gfm)
