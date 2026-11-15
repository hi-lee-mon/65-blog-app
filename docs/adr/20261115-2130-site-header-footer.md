# ヘッダーとフッターを layout に置き、今いるページは usePathname を使う小さな Client Component で示す

- 日付: 2026-11-15
- 状態: 提案（チケット `tickets/3-1-header-footer.md` の確認事項が了承されたら採用）

## 背景

公開できる見た目の段（ADR `20261115-2117-publishable-home-before-storybook.md`）の 3-1 にあたる。全ページに共通のヘッダーとフッターを置く。

今の `app/layout.tsx` には「ホーム」へのリンクが1つあるだけで、ほかのページへ移る手段はトップ画面のリストしかない。ページごとの `<main>` の扱いもばらばらで、記事一覧・タグ一覧・デザインシステムは `<main>` で包み、記事ページは `<article>` だけ、トップ画面は `<nav>` だけになっている。

## 決めたこと

- ヘッダーはサイト名（`/` へのリンク）とグローバルナビゲーションにする。ナビには今あるページだけ（記事 `/posts`、タグ `/tags`）を並べる。付箋は 3-3、about は 3-7 で足す
- 今いるページの判定は `usePathname` を使う小さな Client Component（`NavLink`）に任せる。ヘッダー本体（`SiteHeader`）とフッター（`SiteFooter`）は Server Component のまま
- 判定の規則は「href と一致する、または href + `/` で始まる」。`/posts/hello` でも「記事」を今いる場所にする。`/` は完全一致のときだけ
- 今いるリンクには `aria-current="page"` を付け、Panda の `_currentPage` で太字と下線にする
- `<main id="main">` を layout に1つだけ置き、各ページの `<main>` を外す。デザインシステムの `<main>` はスタイルを保ったまま `<div>` に変える
- 「本文へスキップ」のリンクを layout の先頭に置く。ふだんは隠し、キーボードでフォーカスしたときだけ見せる（`css({ srOnly: true, _focusVisible: { srOnly: false } })`）
- 狭い画面のナビはハンバーガーメニューにせず `flexWrap` で回り込ませる。ブレークポイントは使わない
- フッターには X（`@65banseki`）、GitHub（`hi-lee-mon`）、デザインシステム（`/design-system`）へのリンクと、© 表記を置く。Zenn・Qiita は記事を配り始めたら足す
- 本文が短いページでもフッターが画面の下に来るよう、`body` を縦の flex にし、`main` に `flex: 1` を当てる
- markuplint の `no-hardcoded-id` は `.markuplintrc.json` の `nodeRules` で `main#main` だけ外す
- フォーカスの輪は `panda.config.ts` の `globalCss` で `*:focus-visible` に一括で当てる。太さ `2px`・実線・色 `fg.default`・すき間 `4`（0.25rem）

## 理由

- 押すと 404 になるリンクをナビに置かない。まだないページを並べると、読者を行き止まりに案内することになる
- Next.js の layout はページを移動しても描き直されない。そのため layout の Server Component は今の pathname を受け取れず、読むには Client Component の `usePathname` が要る（`layout.md`、`use-pathname.md`）。Client Component にするのはリンク1つ分にとどめ、ブラウザに送る JavaScript を小さくする
- `aria-current="page"` なら、今いるページが読み上げソフトにも伝わる。見た目は太字と下線で示し、色だけに頼らない（WCAG 1.4.1）
- `<main>` を layout にそろえると、ランドマークがどのページでも同じ構造になり、スキップリンクの飛び先も1か所で済む。layout に `<main>` を置いたままページの `<main>` を残すと、`/posts` と `/design-system` で `<main>` が2つになった（実測）。記事ページは `<article>` だけなので1つだった（実測）
- スキップリンクは毎回同じヘッダーを Tab で通り抜けずに本文へ移るための定番の部品（WCAG 2.4.1）
- ナビのリンクが2〜4個なら、横に並べて足りる。開閉するメニューにすると状態を持つ部品になり、React Aria の回まで状態を持つ部品を作らない方針（ADR `20261106-2104-design-system-panda-v2-react-aria.md`）から外れる
- フッターの X は layout の metadata に書いてあるアカウント。GitHub はこのリポジトリの持ち主
- layout は1回しか描かれないので、固定の id が重複することはない。スキップリンクの飛び先は、固定の id のほうが読みやすい
- フォーカスの輪は、キーボードだけで操作する人が今どこを選んでいるかを知る唯一の手がかりになる（WCAG 2.4.7）。`fg.default` と背景のコントラストはライトで 17.4:1、ダークで 18.76:1 で、非テキストのコントラスト（WCAG 1.4.11）の 3:1 を大きく超える（`panda cssgen` の出力から計算。実測）。太さ 2px は WCAG 2.4.13（AAA）の目安を満たす
- `globalCss` に書けば、MDX の本文のリンクのように部品を通らない要素にも同じ輪が付く。`:focus-visible` にすると、マウスでクリックしたときには輪を出さない

検証の結果は次のとおり（2026-11-15、`dev` の `11fe717` を複製、Node 24.22.1 / bun 1.4.4 / Next.js 16.4.1）。

- 各段階で `bun run tc` が通り、最後に `bun run l`・`bun run fc`・`bun run b` が通った（実測）
- `/posts` と `/posts/hello` では「記事」に、`/tags` と `/tags/pandacss` では「タグ」に `aria-current="page"` が付いた。`/` ではどちらにも付かなかった（実測）
- `usePathname` を layout の中（ヘッダー）で使っても、開発サーバーで App Shell の警告は出なかった。初回の読み込みでも、ヘッダーやカードのリンクで移動したときも同じだった。全ルートが静的か `generateStaticParams` 済みなので、pathname がビルド時に決まるためである（`use-pathname.md` の記述どおり）。`/posts/[slug]` と `/tags/[tag]` はもともと `instant = false` にしてある（実測）
- Panda の `_currentPage` は `[aria-current=page]` に当たり、`currentPage:fw_bold` のようなクラスが出た（実測）
- markuplint は `<main id="main">` に warning「It is hard-coded (react/no-hard-code-id)」を出した。終了コードは 0 で、`nodeRules` に `main#main` の例外を足すと消えた（実測）

## 採らなかった案

- **ナビに付箋と about も先に並べる。** 完成したときの形が先に見えるが、ページができるまでは押すと 404 になる
- **ヘッダー全体を Client Component にする。** ファイルは1つで済むが、サイト名やリストまでブラウザに JavaScript として送ることになる
- **今いるページを、ページごとに props で渡す。** `usePathname` が要らないが、layout はページから値を受け取れないので、ヘッダーを各ページに置き直すことになる
- **`useSelectedLayoutSegment` で判定する。** セグメント単位で判定できるが、このサイトの階層は浅く、pathname の比較で足りる
- **色だけで今いるページを示す。** 見た目はすっきりするが、色の見分けにくい人に伝わらない（WCAG 1.4.1）
- **各ページの `<main>` を残し、それぞれに `id="main"` を付ける。** ページ側で `<main>` にスタイルを当てられるが、ページを足すたびに付け忘れの心配が残り、記事ページのように `<main>` がないページも出る
- **スキップリンクを入れない。** 部品が1つ減るが、キーボードで操作する人は、毎回ヘッダーのリンクを Tab で通り抜けることになる
- **狭い画面ではハンバーガーメニューにする。** リンクが増えても1行に収まるが、開閉の状態を持つ部品になる。リンクが2〜4個のうちは、隠すほうが探す手間を増やす
- **`useId` でスキップリンクの飛び先の id を作る。** markuplint の警告は出ないが、飛び先が `#_R_...` のような読めない値になる
- **フォーカスの輪をブラウザの標準のままにする。** 何も書かずに済むが、色と太さがブラウザ任せになり、背景によっては見えにくい
- **フォーカスの輪を部品ごとに書く。** 部品ごとに形を変えられるが、MDX の本文のリンクのように部品を通らない要素で書き忘れる
- **`:focus` に輪を付ける。** どの操作でも輪が出るが、マウスでクリックしたときにも輪が残り、見た目の理由で輪を消したくなる誘因になる

## 気をつけること

- 付箋（3-3）と about（3-7）ができたら、`SiteHeader` の `navItems` に足す
- 配下のページ（`/posts/blog`）で「記事」に `aria-current="page"` を付けるのは、厳密には正しくない。リンク先は一覧で、今のページそのものではないからだ。厳密にするなら、完全一致は `"page"`、配下は `"true"` と分け、見た目の条件（`_currentPage` は `"page"` にしか当たらない）も分ける
- ナビのリンクが5個以上になったら、狭い画面での形（回り込み、ハンバーガー、下部のタブバーなど）を見直す
- Panda の `srOnly: false` は隠すときに付けた値を戻すだけでなく、`padding: 0` や `margin: 0` も当てる。`_focusVisible` で `padding` を一緒に足すと、CSS の並び順によっては効かない。スキップリンクに余白を付けるときは、ほかの要素で包むなど別の方法をとる
- `usePathname` に `<Suspense>` が要るのは、`generateStaticParams` にない値を受ける動的ルートを作ったとき。そのときは pathname がリクエストまで決まらず、`<Suspense>` の外で読むとビルドが止まる（`use-pathname.md`）。付箋やタグで動的ルートを足すときに確かめる
- markuplint はファイルごとに検査するので、layout とページにまたがる `<main>` の入れ子は検出しない。ページを足すときは、ページ側に `<main>` を書かない
- `globalCss` は `strictTokens` の型検査の外にある。`outlineWidth: "2"` のようにトークンにない値を書いても型検査は通り、CSS には無効な `outline-width: 2` が出た（実測）。太さのトークン（`borderWidths`）は今 `1` しかないので `2px` と書いている。デザインシステムとしてそろえるなら `borderWidths` に `2` を足す
- 濃い背景の部品を作ったら、`fg.default` の輪が背景に溶けないかを確かめ、必要ならその部品で輪の色を変える

## 参考

- Next.js `layout.js`（同梱ドキュメント `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md`）
- Next.js `usePathname`（同梱ドキュメント `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-pathname.md`）
- WAI-ARIA Authoring Practices, Landmark Regions: https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/
- `aria-current`（WAI-ARIA 1.2）: https://www.w3.org/TR/wai-aria-1.2/#aria-current
- WCAG 2.2 の 2.4.1 ブロックスキップ: https://www.w3.org/TR/WCAG22/#bypass-blocks
- WCAG 2.2 の 1.4.1 色の使用: https://www.w3.org/TR/WCAG22/#use-of-color
- Panda CSS の条件: https://panda-css.com/docs/concepts/conditional-styles
- W3C WAI, How People with Disabilities Use the Web: https://www.w3.org/WAI/people-use-web/user-stories/
- WCAG 2.2 の 2.4.7・2.4.13・1.4.11: https://www.w3.org/TR/WCAG22/
