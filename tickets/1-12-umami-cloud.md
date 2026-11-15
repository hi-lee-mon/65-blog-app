# 1-12: Umami Cloud を本番にだけ入れ、記事のタグが押された回数を数える

- 起票日: 2026-11-06
- 学習計画: まだない（設計の全体像は `docs/design/20260925-blog-design-proposal.md` の「アクセス解析に Umami を足す」）
- ステータス: 未着手

## 全体のどこか

「記事を表示する」段の12段目にあたる。1-10 で Cloudflare Web Analytics を入れ、訪問を数え始めた。ただ、Cloudflare で数えられるのは「どのページが何回開かれたか」までで、「どのリンクが押されたか」は数えられない。この回で Umami Cloud を足し、独自のイベントを数え始める。

| Step | 内容                                                   | 進捗         |
| ---- | ------------------------------------------------------ | ------------ |
| 1-1  | 記事1本を `/posts/[slug]` に表示する                   | ■■■ 完了     |
| 1-2  | `/posts` に記事の一覧を出す                            | ■■■ 完了     |
| 1-3  | Shiki でコードブロックに色を付ける                     | ■■■ 完了     |
| 1-4  | Valibot で frontmatter の中身を検査し、`as` を取り除く | ■■■ 完了     |
| 1-5  | タグを付け、`/tags` と `/tags/[tag]` を作る            | ■■■ 完了     |
| 1-6  | 見出しから目次を作る                                   | ■■■ 完了     |
| 1-7  | 記事ごとにシェア用の画像を作る                         | ■■■ 完了     |
| 1-8  | Vercel で公開し、ドメインをつなぐ                      | ■■□ 確認待ち |
| 1-9  | サイト全体の名札を整える                               | ■■■ 完了     |
| 1-10 | アクセス解析を入れる                                   | ■■■ 完了     |
| 1-11 | 正式な住所を1つに決める                                | ■■□ 確認待ち |
| 1-12 | Umami Cloud を足し、独自のイベントを数える             | □□□ ← つぎ   |

作業ブランチは作らず、`dev` に直接コミットする。

## 作るもの

| 場所                                                | 中身                                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------------ |
| Umami Cloud のダッシュボード                        | アカウントを作り、`www.65banseki.dev` を登録して、ウェブサイト ID を受け取る   |
| `app/layout.tsx`                                    | 環境変数 `UMAMI_WEBSITE_ID` があるときだけ、Umami のスクリプトを読み込む       |
| `components/TagLink.tsx`（新規）                    | 記事ページのタグのリンク。押されたら `tag-click` というイベントを Umami に送る |
| `types/umami.d.ts`（新規）                          | Umami がブラウザに置く `window.umami` の型                                     |
| `app/posts/[slug]/page.tsx`                         | タグのリンクを `TagLink` に置き換える                                          |
| Vercel のダッシュボード                             | 環境変数 `UMAMI_WEBSITE_ID` を **Production だけ**に設定する                   |
| `docs/adr/20261106-1200-add-umami-cloud.md`（新規） | Umami Cloud を足すと決めた理由と、Cloudflare との役割分担                      |

今回は扱わないもの: Umami のセルフホスト（設計書では「その後」）、Core Web Vitals の計測（`data-performance`）、エラーの収集（`data-errors`）、利用者のグループ分け（コホート）、トラッキングリンク、目次やコードのコピーなど、タグ以外のイベント。

## なぜこれをやるか

ADR `20260925-1906-access-analytics.md` では、Umami Cloud を「独自のイベントを取れるのは魅力だが、現時点では不要」として採らなかった。必要になったら足す、とも書いた。設計書の「この先の予定」では、Umami v3 の機能を試すために 1-12 で足すことにしている。

数えたいのは、記事を読んだ人がタグを押して、ほかの記事に進んだかどうかだ。Cloudflare では `/tags/mdx` が開かれた回数は分かるが、記事ページのタグから来たのか、一覧から来たのかは分からない。押された瞬間に「タグが押された」と記録できれば、分けて数えられる。

もう1つの狙いは、**計測用のスクリプトが Next.js の画面遷移とぶつかる場面**を体験することにある。Umami の見本どおりに書くと、このサイトでは画面遷移の仕組みが壊れる。その理由をこの回で確かめる。

## 周辺知識

### Umami Cloud の無料プラン（出典: https://umami.is/pricing 、2026-11-06 に確認）

| 項目           | Hobby（無料） |
| -------------- | ------------- |
| イベント数     | 月10万まで    |
| サイト数       | 1つ           |
| データの保存   | 6か月         |
| チームメンバー | なし          |
| 追加のイベント | 買えない      |

月10万を超えたときに Hobby で何が起きるか（計測が止まるのか）は、料金ページに書かれていない（**未確認**）。

### Umami のスクリプト（出典: https://docs.umami.is/docs/tracker-configuration ほか、2026-11-06 に確認）

- Umami Cloud のスクリプトは `https://cloud.umami.is/script.js`。送り先は `https://gateway.umami.is/api/send`（配られている `script.js` の中身で確認）
- サイトの見分けには `data-website-id` 属性を使う。値はダッシュボードで受け取る ID
- `data-domains` に書いたホスト名でだけ動く。`window.location.hostname` と完全に一致する必要があり、`www` の有無も区別する
- `<a>` や `<button>` に `data-umami-event="名前"` を付けると、押されたときにイベントを送る。`data-umami-event-キー="値"` で値も付けられる（値はすべて文字列になる）
- JavaScript からは `umami.track("名前", { キー: 値 })` で送る。イベント名は50文字まで
- ブラウザの localStorage に `umami.disabled` があると送らない
- 最新版は v3.4.1（2026-10-23 公開、GitHub のリリースで確認）。Umami Cloud は常に最新版が動いている前提で書いている

### Umami のスクリプトの中身（出典: https://github.com/umami-software/umami の `src/tracker/index.ts`、2026-11-06 に確認）

- `history.pushState` と `history.replaceState` を上書きして、URL が変わるたびにページビューを送る。Next.js の `<Link>` での移動も1ページとして数える
- `data-umami-event` が付いた `<a>` が押されると、`preventDefault()` でブラウザの移動を止め、イベントを送ってから `location.href = href` で移動し直す。新しいタブで開く場合（`target="_blank"`、Ctrl・Shift・Cmd を押しながら、中ボタン）はこの処理をしない
- 送るのを止める条件（`data-domains` に合わない、`umami.disabled` がある、など）に当たると、最初の初期化を丸ごと飛ばす。クリックの監視も始めない

### Next.js でスクリプトを読み込む

1-10 の周辺知識と同じ。`<Script>` は `data-*` 属性をそのまま渡す。環境変数はビルドのときに読まれて焼き込まれる。

### 実測したこと

2026-11-06、macOS / bun 1.4.4 / Next.js 16.4.1 で、`dev` の `39d74c4` を一時ディレクトリに複製し、ダミーの ID（`00000000-0000-0000-0000-000000000000`）で確かめた。

- ID なしでビルドすると、トップページの HTML に `cloud.umami.is/script.js` は出てこない。ID 付きだと2回出る（先読みの `<link>` と、ページを動かすためのデータの中）
- `data-domains="www.65banseki.dev"` を付けて `localhost` で開くと、`window.umami` はできるが、何も送らない。タグにデータ属性を付けても、ふつうの画面遷移のまま
- `data-domains` を外し、タグの `<Link>` に `data-umami-event` を付けると、押したときに**ページ全体が読み込み直される**。`window` に置いた目印が消え、読み込みの記録（`performance.getEntriesByType("navigation")`）が `/tags/mdx` に変わる
- `onClick` で `window.umami?.track("tag-click", { tag })` を呼ぶ形にすると、目印は残り（読み込み直しなし）、`track` が `["tag-click",{"tag":"mdx"}]` で呼ばれる
- どちらの形でも `https://gateway.umami.is/api/send` に送るが、ダミーの ID なので `400` が返る
- `types/umami.d.ts` がないと、型検査が `Property 'umami' does not exist on type 'Window & typeof globalThis'.` で止まる
- 完成形で `bun run typecheck`・`bun run lint` が通る

**未確認**: Umami Cloud のダッシュボードの画面（項目名と順番）。本物の ID での計測と、ダッシュボードに数字が出るまでの時間。データの地域をあとから変えられるか。広告ブロッカーが Umami を止めるか。

## 作業手順（全体の地図）

1. `dev` を最新にする
2. Umami Cloud に `www.65banseki.dev` を登録し、ウェブサイト ID を控える
3. レイアウトに Umami のスクリプトを足す
4. ID なし・ID ありでビルドし、スクリプトの有無を見る
5. タグのリンクにデータ属性を付け、ページが読み込み直されるのを見る
6. `umami.track()` に書き換え、読み込み直さずに数えられるのを見る（**この回の本題**）
7. `data-domains` を足し、手元では送らないことを見る
8. Vercel に、本番だけの ID を設定する
9. コミットして push し、本番で自分の訪問とタグのクリックが数えられるのを見る
10. 自分のブラウザを数えないようにする
11. ADR を書く

## 確認事項

- [ ] **ID の渡し方と変数の名前。** 推奨案「環境変数 `UMAMI_WEBSITE_ID`（`NEXT_PUBLIC_` を付けない）」で作成。理由は 1-10 の `CF_WEB_ANALYTICS_TOKEN` と同じで、リポジトリを複製した人の訪問を混ぜないためと、読むのがサーバーで動くレイアウトだけだから。ただし、ID は HTML に載るので秘密ではない。あとでブラウザで動くコンポーネントから ID を読もうとすると、値が空になる
- [ ] **計測する環境。** 推奨案「Production だけ」で作成。理由は 1-10 と同じで、自分のプレビューの訪問を数えないため。ただし、プレビューでは計測の動きを確かめられないので、手順 5〜7 の手元のビルドで確かめる
- [ ] **`data-domains` を付けるか。** 推奨案「`www.65banseki.dev` を付ける」で作成。理由は環境変数がうっかりプレビューにも入ったときの二重の守りになるから。ただし、手元（`localhost`）では Umami が初期化を飛ばすので、クリックの計測を手元で確かめるには一時的に外す必要がある（手順 5・6 で外し、手順 7 で足す）
- [ ] **データの地域。** 推奨案「EU」で作成。理由は EU の個人データの規則（GDPR）のもとで保存され、扱いが厳しい側に寄せられるから。送信はページの表示を待たせないので、地域による速さの違いは気にしなくてよい。ただし、あとから地域を変えられるかは**未確認**。迷うなら US でもこのチケットの手順は変わらない
- [ ] **数えるイベント。** 推奨案「記事ページのタグのクリックを `tag-click` という名前で数え、タグ名を `tag` として付ける」で作成。理由は「なぜこれをやるか」に書いたとおり、Cloudflare では分からない数字だから。ただし、`/tags` の一覧ページのタグは数えない。必要になったら同じ `TagLink` を使えばよい
- [ ] **イベントの送り方。** 推奨案「`onClick` で `window.umami?.track()` を呼ぶ」で作成。理由は Umami の見本にあるデータ属性（`data-umami-event`）を `<Link>` に付けると、押すたびにページ全体を読み込み直してしまうから（手順 5 で実測）。ただし、`onClick` を使うために `"use client"` のコンポーネントが1つ増え、そのぶんブラウザに送る JavaScript が少し増える
- [ ] **`window.umami` の型。** 推奨案「`types/umami.d.ts` に自分で書く」で作成。理由は使うのが `track` 1つだけで、型のためにパッケージを足すほどではないから。ただし、Umami の関数の形が変わっても気づけない。使う関数が増えたら書き足す
- [ ] **コンポーネントの置き場所。** 推奨案「リポジトリ直下の `components/`」で作成。理由は今ある `lib/` と同じ高さに置くと探しやすいから。ただし、デザインシステムを組むとき（Panda CSS）に置き場所を見直す可能性がある
- [ ] **自分の訪問を数えない方法。** 推奨案「本番のサイトを開いたブラウザで、localStorage に `umami.disabled` を入れる」で作成。理由は Umami のスクリプトが標準で見ている仕組みで、コードを変えずに済むから。ただし、ブラウザごと・端末ごとに設定が要る。ブラウザのデータを消すと、また数えられるようになる
- [ ] **Cloudflare Web Analytics との関係。** 推奨案「両方を残し、正式な数字は Cloudflare、イベントは Umami」で作成。理由は設計書でそう決めているから。ただし、数え方が違うので、ページビューの数は2つのダッシュボードでそろわない。比べるときは傾向だけを見る
- [ ] **【標準ルールからの逸脱】TDD を適用しない。** 本人の判断（2026-11-03）による。この回は外部サービスの設定と、スクリプトを1つ足すことが中心で、確かめるのはビルドした HTML とブラウザの動き

## ハンズオン

ここに出てくるコマンドの出力とブラウザでの結果は、ダミーの ID で実際に動かして写したもの（2026-11-06、bun 1.4.4 / Next.js 16.4.1）。Umami Cloud と Vercel のダッシュボードの操作は、ドキュメントを読んで書いたもので、画面は確かめていない。

---

### 準備：この回で何をするのか

Umami に、このサイトの訪問と「タグが押された」という出来事を数えてもらう。やることの半分は 1-10 と同じで、全ページにスクリプトを読み込ませ、本番でだけ動かす。残りの半分が新しい。Umami の見本どおりにタグのリンクに印を付けると、Next.js の画面遷移が壊れる。それを自分の目で見てから、壊さない書き方に直す。

#### イベントは「レジの記録」

1-10 のカウンターはお店に何人入ったかを数える。イベントはお店の中で起きた出来事の記録だ。「3番の棚の商品を手に取った」のように、何が起きたかに名前を付けて残す。この回では「記事ページで mdx のタグが押された」を、`tag-click` という名前と `{ tag: "mdx" }` という添え書きで記録する。

#### ソフトナビゲーションと「読み込み直し」

Next.js の `<Link>` を押すと、ブラウザはページを丸ごと取り直さない。変わる部分のデータだけを取ってきて、画面の中身を差し替える。これをソフトナビゲーションと呼ぶ。部屋を出て隣の部屋に移るのではなく、同じ部屋の家具だけを入れ替えるイメージだ。速く、スクロール位置や入力中の内容も保てる。

反対に、ふつうのリンクのようにページを丸ごと取り直すのを、ここでは「読み込み直し」と呼ぶ。手順 5 で、この2つの違いを目で見る。

#### 用意するもの

- 1-11 までをコミットした状態のリポジトリ（`dev`）
- メールアドレス（Umami Cloud のアカウント作成に使う）
- Vercel のアカウント（1-8 でデプロイしているもの）
- ブラウザ（開発者ツールを使う）

---

### 手順 1：`dev` を最新にする

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
git switch dev
git pull
git status
```

```
On branch dev
Your branch is up to date with 'origin/dev'.

nothing to commit, working tree clean
```

**なぜ** — 前の回の変更がすべて入った状態から始めるため。`nothing to commit` でなければ、先にコミットするか、何が残っているかを確かめる。

---

### 手順 2：Umami Cloud に `www.65banseki.dev` を登録し、ウェブサイト ID を控える

1. https://cloud.umami.is/signup でアカウントを作る
2. メールに届いた6桁の番号を入力して、メールアドレスを確かめる
3. データの地域を聞かれたら **EU** を選ぶ（確認事項を参照）
4. ウェブサイトを追加する画面で、名前に `65banseki の技術ブログ`、ドメインに `www.65banseki.dev` を入れる
5. 追加したウェブサイトのトラッキングコード（Tracking code）を開き、`data-website-id="..."` の `...` の部分を控える。`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` のような、ハイフン入りの長い文字列だ

**なぜ** — Umami には、たくさんのサイトの記録が届く。どのサイトの記録かを見分けるのがウェブサイト ID で、1-10 のトークンと同じく「お店の番号」にあたる。HTML に載るので秘密ではない。

画面の項目名や順番は確かめていない。手順と違ったら、画面に合わせて読み替える。

---

### 手順 3：レイアウトに Umami のスクリプトを足す

`app/layout.tsx` の、Cloudflare の `<Script>` の下に足す。`import Script from "next/script";` は 1-10 で足してあるので、そのままでよい。

```tsx
        {process.env.CF_WEB_ANALYTICS_TOKEN && (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({
              token: process.env.CF_WEB_ANALYTICS_TOKEN,
            })}
          />
        )}
        {process.env.UMAMI_WEBSITE_ID && (
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id={process.env.UMAMI_WEBSITE_ID}
          />
        )}
      </body>
```

**なぜ Cloudflare と同じ形なのか** — 「ID があるときだけ読み込む」という分かれ道は、1-10 と同じ理由で要る。手元・プレビュー・他人の複製では、スクリプトそのものを入れない。

**`data-domains` はまだ書かない** — 確認事項で「付ける」と決めたが、付けると手元で Umami が動かなくなる。手順 5・6 の実験を手元でするために、手順 7 まで待つ。

---

### 手順 4：ID なし・ID ありでビルドし、スクリプトの有無を見る

まず ID なしでビルドする。

```bash
bun run build
grep -o 'cloud.umami.is/script.js' .next/server/app/index.html | wc -l
```

```
       0
```

次に、ダミーの ID を付けてビルドする。

```bash
UMAMI_WEBSITE_ID=00000000-0000-0000-0000-000000000000 bun run build
grep -o 'cloud.umami.is/script.js' .next/server/app/index.html | wc -l
```

```
       2
```

**読み取れること** — 2回のうち1回は、スクリプトを先に取りに行かせる `<link rel="preload">`、もう1回はページを動かすためのデータの中にある。1-10 で見たとおり、`<Script>` は HTML に `<script>` タグとしては入らず、ブラウザで動き出してから差し込まれる。

---

### 手順 5：タグのリンクにデータ属性を付け、ページが読み込み直されるのを見る

Umami のドキュメントの見本どおりに、リンクに印を付けてみる。ここでは、あとの手順で使うコンポーネントを先に作り、その中で印を付ける。

#### 5-a：タグのリンクをコンポーネントに切り出す

`components/TagLink.tsx` を新しく作る。

```tsx
"use client";

import Link from "next/link";

export function TagLink({ tag }: { tag: string }) {
  return (
    <Link href={`/tags/${tag}`} data-umami-event="tag-click" data-umami-event-tag={tag}>
      {tag}
    </Link>
  );
}
```

`app/posts/[slug]/page.tsx` を2か所書き換える。

1つ目。`import Link from "next/link";` の行を消し、代わりに次の1行を足す（このファイルでは、`Link` はタグのリンクにしか使っていない）。

```tsx
import { TagLink } from "../../../components/TagLink";
```

2つ目。タグの `<li>` の中を書き換える。

```tsx
{
  frontmatter.tags.map((tag) => (
    <li key={tag}>
      <TagLink tag={tag} />
    </li>
  ));
}
```

**`data-umami-event` は何か** — Umami への合図だ。この印が付いたリンクが押されると、Umami のスクリプトが「`tag-click` が起きた」と記録する。`data-umami-event-tag` は添え書きで、`tag` というキーにタグ名が入る。

**`"use client"` はまだ要らないのでは** — この段階では要らない。次の手順で `onClick` を使うときに要るので、先に書いておく。

#### 5-b：ビルドして起動する

```bash
UMAMI_WEBSITE_ID=00000000-0000-0000-0000-000000000000 bun run build
PORT=3123 bun run start
```

#### 5-c：目印を置いてからタグを押す

1. ブラウザで http://localhost:3123/posts/hello を開く
2. 開発者ツールの Console で、次を入力する

   ```js
   window.__marker = "まだ同じページ";
   ```

3. 記事のタグ（`mdx`）を押す。`/tags/mdx` に移る
4. Console で、次を入力する

   ```js
   window.__marker;
   ```

```
undefined
```

**目印が消えた。** `window` はページごとに1つある入れ物で、ページを丸ごと読み込み直すと空になる。ソフトナビゲーションなら、目印は残るはずだ。

**何が起きたのか** — Umami のスクリプトは、印の付いた `<a>` が押されると、次の順に動く。

1. `preventDefault()` で、ブラウザのふつうの移動を止める
2. イベントを Umami に送る
3. 送り終わったら、`location.href = "/tags/mdx"` で移動し直す

3 が「読み込み直し」の正体だ。`location.href` に URL を入れると、ブラウザはページを丸ごと取り直す。Next.js の `<Link>` がせっかく家具の入れ替えで済ませようとしても、Umami があとから部屋ごと移ってしまう。

**なぜ Umami はこんなことをするのか** — ふつうのサイトでは、リンクを押すとすぐ次のページに移り、今のページのスクリプトは止まる。送る前に止まると、記録が消える。そこで Umami はいったん移動を止めて送り終えてから移る。ページ全体を取り直すサイトでは、これが正しい。ソフトナビゲーションをするサイトでは、移っても今のスクリプトは止まらないので、この工夫が要らないうえに邪魔になる。

Network タブを見ると、`https://gateway.umami.is/api/send` への送信が `400` で失敗している。ダミーの ID なので、Umami が受け付けない。本物の ID なら届く。

確かめたら、サーバーを `Ctrl + C` で止める。

---

### 手順 6：`umami.track()` に書き換え、読み込み直さずに数えられるのを見る（この回の本題）

#### 6-a：`onClick` で送る形に書き換える

`components/TagLink.tsx` を書き換える。

```tsx
"use client";

import Link from "next/link";

export function TagLink({ tag }: { tag: string }) {
  return (
    <Link href={`/tags/${tag}`} onClick={() => window.umami?.track("tag-click", { tag })}>
      {tag}
    </Link>
  );
}
```

型検査をする。

```bash
bun run typecheck
```

```
components/TagLink.tsx(7,55): error TS2339: Property 'umami' does not exist on type 'Window & typeof globalThis'.
```

**なぜエラーになるのか** — `window.umami` は、Umami のスクリプトが読み込まれたあとにブラウザで作られる。TypeScript はそれを知らないので、「`window` に `umami` なんてない」と止める。

#### 6-b：`window.umami` の型を書く

`types/umami.d.ts` を新しく作る。

```ts
interface Window {
  umami?: {
    track: (eventName: string, data?: Record<string, string | number | boolean>) => void;
  };
}
```

```bash
bun run typecheck
```

```
$ next typegen && tsrs --noEmit
Generating route types...
✓ Types generated successfully
```

**`interface Window` で何をしているのか** — TypeScript にもともとある `Window` の型に、`umami` を書き足している。同じ名前の `interface` を書くと、中身が足し合わされる。`import` も `export` もないファイルに書くと、プロジェクト全体に効く。

**なぜ `umami?` と `?` を付けるのか** — スクリプトがまだ読み込まれていないときや、ID がなくてスクリプトが入らないとき（手元・プレビュー）は、`window.umami` がない。`?` を付けると、TypeScript が「ないかもしれない」と扱う。それに合わせて、呼ぶ側も `window.umami?.track(...)` と `?.` で書く。ないときは何もしない。

#### 6-c：同じ実験をもう一度する

```bash
UMAMI_WEBSITE_ID=00000000-0000-0000-0000-000000000000 bun run build
PORT=3123 bun run start
```

1. http://localhost:3123/posts/hello を開く
2. Console で `window.__marker = "まだ同じページ"` を入力する
3. タグ（`mdx`）を押す
4. Console で `window.__marker` を入力する

```
'まだ同じページ'
```

**目印が残った。** 読み込み直しが起きていない。Network タブには `https://gateway.umami.is/api/send` への送信が出ている（ダミーの ID なので `400`）。

**なぜこれで送れるのか** — `onClick` の中で `track` を呼ぶと、送信が始まる。そのあと `<Link>` が家具を入れ替えるが、ページのスクリプトは止まらないので、送信も途中で止まらない。Umami の「送り終わるまで移動を待つ」工夫は、ソフトナビゲーションでは要らない。

**この発見が今後どこに効くか**

- ほかの計測ツールや、リンクに手を出すライブラリを入れるときも、同じことが起きうる。「リンクが押されたら何かして、それから移動する」作りのものは、ソフトナビゲーションを読み込み直しに変えてしまうことがある。入れたら一度、目印の実験をする
- 新しいタブで開くリンク（外部サイトへのリンクなど）には、データ属性を使ってよい。Umami は `target="_blank"` のリンクでは移動を止めないからだ
- Umami はページの移動そのもの（`history.pushState`）も見ているので、ページビューはこの書き換えと関係なく数えられる。手順 6-c の Network に、イベントとは別にもう1回送信が出ているのがそれだ

確かめたら、サーバーを `Ctrl + C` で止める。

---

### 手順 7：`data-domains` を足し、手元では送らないことを見る

`app/layout.tsx` の Umami の `<Script>` に1行足す。

```tsx
{
  process.env.UMAMI_WEBSITE_ID && (
    <Script
      src="https://cloud.umami.is/script.js"
      data-website-id={process.env.UMAMI_WEBSITE_ID}
      data-domains="www.65banseki.dev"
    />
  );
}
```

```bash
UMAMI_WEBSITE_ID=00000000-0000-0000-0000-000000000000 bun run build
PORT=3123 bun run start
```

http://localhost:3123/posts/hello を開き、Network タブで `gateway.umami.is` を探す。**何も出ていない**。タグを押しても出ない。

Console で次を入力すると、`'object'` と出る。スクリプトは読み込まれているが、送っていない。

```js
typeof window.umami;
```

**なぜ** — `data-domains` は「このホスト名のときだけ動く」という指定だ。今のホスト名は `localhost` なので、Umami は初期化を丸ごと飛ばす。環境変数がうっかりプレビューに入っても、プレビューのホスト名は `www.65banseki.dev` ではないので、送らない。手順 5・6 で外していたのは、手元で動かすためだった。

確かめたら、サーバーを `Ctrl + C` で止める。

---

### 手順 8：Vercel に、本番だけの ID を設定する

1. Vercel のダッシュボードで、このプロジェクトを開く
2. Settings → Environment Variables を開く
3. Key に `UMAMI_WEBSITE_ID`、Value に手順 2 で控えた ID を入れる
4. Environments は **Production だけ**にチェックを入れる
5. 種類は Config にする
6. Save を押す

**なぜ Production だけなのか** — 1-10 と同じ。自分がプレビューを確かめた訪問を数えないためだ。変数を足しても、作り済みのデプロイには反映されない。次のデプロイから使われる。

---

### 手順 9：コミットして push し、本番で数えられるのを見る

```bash
bun run format
bun run typecheck
bun run lint
git status --short
```

```
 M app/layout.tsx
 M app/posts/[slug]/page.tsx
?? components/
?? types/
```

```bash
git add app/layout.tsx 'app/posts/[slug]/page.tsx' components/TagLink.tsx types/umami.d.ts
git commit -m "feat: Umami Cloud を本番にだけ入れ、記事のタグが押された回数を数える

Cloudflare Web Analytics ではページが開かれた回数しか分からず、記事のタグから別の記事に進んだかどうかが分からないため。
Umami の見本のデータ属性は、押すたびにページ全体を読み込み直すので、onClick で umami.track() を呼ぶ。"
git push
```

本番に出す手順はいつもどおり `main` を `dev` まで進める。

```bash
git switch main
git merge --ff-only dev
git push
git switch dev
```

デプロイが終わったら、次を確かめる。

1. https://www.65banseki.dev/posts/hello を開く
2. Umami Cloud のダッシュボードで、このサイトのリアルタイム（Realtime）の画面を開く。訪問が1つ増えている
3. 記事のタグを押す
4. ダッシュボードのイベント（Events）の画面で、`tag-click` が数えられている。プロパティ（Properties）のタブで、`tag` の値（`mdx` など）が見える

数字が出るまでの時間は確かめていない。出なければ、数分待ってから開き直す。

---

### 手順 10：自分のブラウザを数えないようにする

本番のサイト（https://www.65banseki.dev ）を開いたまま、Console で次を入力する。

```js
localStorage.setItem("umami.disabled", "1");
```

ページを開き直し、Network タブで `gateway.umami.is` を探す。**何も出ていない**。

**なぜ** — Umami のスクリプトは、送る前に localStorage（ブラウザがサイトごとに持つ小さな保存場所）に `umami.disabled` があるかを見る。あれば送らない。保存場所はサイトごとに分かれているので、本番のサイトを開いた状態で入れる必要がある。手元の `localhost` で入れても効かない。

戻すときは `localStorage.removeItem("umami.disabled")` を入力する。ほかのブラウザやスマートフォンで見るときは、それぞれで入れる。

---

### 手順 11：ADR を書く

`docs/adr/20261106-1200-add-umami-cloud.md` を新しく作る。

```markdown
# 独自のイベントを数えるために Umami Cloud を足す

- 日付: 2026-11-06
- 状態: 採用

## 背景

アクセス解析は Cloudflare Web Analytics で取っている（`20260925-1906-access-analytics.md`）。Cloudflare ではページが開かれた回数は分かるが、記事ページのタグから別の記事に進んだかどうかのような、ページの中で起きた出来事は数えられない。その ADR では Umami Cloud を「現時点では不要」として採らなかったが、必要になったら足すとしていた。

## 決定

Umami Cloud の無料プラン（Hobby）を、Cloudflare Web Analytics に足して入れる。正式な数字は Cloudflare で取り、Umami は独自のイベントと v3 の機能を試すのに使う。

## 理由

- 無料プランで月10万イベントまで数えられ、このサイトの規模なら足りる
- スクリプトを1つ足すだけで、データベースを用意しなくてよい
- 記事のタグのクリックを、タグ名つきで数えられる

## 採らなかった案

- Umami をセルフホストする: Cloudflare は PostgreSQL を提供しないので、データベースを別に用意する必要がある。まず Cloud で使い方を覚えてから考える
- Cloudflare Web Analytics をやめて Umami だけにする: 無料プランはデータの保存が6か月で、Cloudflare と同じ。乗り換える理由がない
- データ属性（`data-umami-event`）でイベントを送る: Next.js の `<Link>` に付けると、押すたびにページ全体を読み込み直してしまう。`onClick` で `umami.track()` を呼ぶ

## 確認したこと

- 料金と上限: https://umami.is/pricing （2026-11-06）
- データ属性を付けたリンクで読み込み直しが起きる理由: Umami の `src/tracker/index.ts` が `preventDefault()` のあと `location.href` で移動し直している（2026-11-06）
```

```bash
git add docs/adr/20261106-1200-add-umami-cloud.md
git commit -m "docs: Umami Cloud を足すと決め、データ属性を使わない理由を ADR に残す

あとで別の計測ツールを足すときに、ソフトナビゲーションを壊さないかを確かめる手がかりにするため。"
git push
```

**なぜ ADR を書くのか** — 前の ADR で「Umami Cloud は採らない」と書いたので、考えを変えた理由を残しておく。残さないと、あとで読んだときに、どちらが今の決定なのか分からなくなる。

---

### うまくいかないとき

| 症状                                                                                         | 原因と対処                                                                                               |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 手順 4 で ID 付きなのに `0`                                                                  | コマンドの頭の `UMAMI_WEBSITE_ID=...` と `bun run build` の間に改行が入っている。1行で書く               |
| `Property 'umami' does not exist on type 'Window & typeof globalThis'.`                      | `types/umami.d.ts` がない、または中に `import` か `export` を書いた。書くとファイル全体に効かなくなる    |
| `Identifier 'Link' is imported but never used.`                                              | `app/posts/[slug]/page.tsx` の `import Link from "next/link";` が残っている。消す                        |
| 手順 5 で目印が消えない                                                                      | `data-domains` を足している。手順 5・6 では外す。または ID を付けずにビルドしている                      |
| 手順 6 で目印が消える                                                                        | `TagLink.tsx` にデータ属性が残っている。`data-umami-event` の2つを消す                                   |
| Network に `gateway.umami.is` が `400` で出る                                                | 手元ではダミーの ID なので正常。本番で出るなら、Vercel の ID の値を確かめ、デプロイし直す                |
| 本番で Network に `gateway.umami.is` が出ない                                                | 手順 10 の `umami.disabled` を入れている。または変数を足す前のデプロイを見ている。デプロイし直す         |
| 本番の Network に `cloud.umami.is/script.js` が `(blocked:other)` や `ERR_BLOCKED_BY_CLIENT` | 広告ブロッカーが止めている（文言は未確認）。そのサイトでだけ広告ブロッカーを切って確かめる               |
| `EADDRINUSE: address already in use :::3123`                                                 | 前に起動したサーバーが残っている。そのターミナルで `Ctrl + C` を押すか、`PORT=3124` のように番号を変える |

ここに載っていないエラーが出たら、そのまま貼って聞いてほしい。

---

## 受け入れ条件

- [ ] `bun run build` のあと、`grep -o 'cloud.umami.is/script.js' .next/server/app/index.html | wc -l` が `0` になる（手元に ID がない）
- [ ] ID 付きでビルドすると、同じコマンドが `2` になる
- [ ] 手順 5 で、データ属性を付けたタグを押すと `window.__marker` が `undefined` になるのを見た
- [ ] 手順 6 で、`umami.track()` の形ではタグを押しても `window.__marker` が残るのを見た
- [ ] 手順 7 で、`data-domains` を付けると手元では `gateway.umami.is` に送らないのを見た
- [ ] `components/TagLink.tsx` にデータ属性（`data-umami-event`）がなく、`onClick` で `window.umami?.track` を呼んでいる
- [ ] Vercel の `UMAMI_WEBSITE_ID` が Production だけに設定されている
- [ ] 本番でタグを押したあと、Umami のダッシュボードに `tag-click` と、その `tag` の値が出ている
- [ ] 本番を開いたブラウザで `umami.disabled` を入れると、`gateway.umami.is` に送らなくなるのを見た
- [ ] `docs/adr/20261106-1200-add-umami-cloud.md` がある
- [ ] `bun run typecheck` と `bun run lint` が通る

## この回で理解したこと

着手後に埋める。受け入れ条件とは別に、何が分かったかを残す。

- [ ] ソフトナビゲーションと読み込み直しの違いを、`window` に置いた目印を使って説明できる
- [ ] Umami のデータ属性を `<Link>` に付けると読み込み直しになる理由を、Umami の3つの動き（止める・送る・移動し直す）で説明できる
- [ ] `umami.track()` を `onClick` で呼べば送信が途中で止まらない理由を説明できる
- [ ] `types/umami.d.ts` で `interface Window` を書くと、なぜ `window.umami` が使えるようになるのかを説明できる
- [ ] `data-domains` が、環境変数とは別の守りとしてどう働くかを説明できる

## 参考

- Umami の料金: https://umami.is/pricing
- スクリプトの設定: https://docs.umami.is/docs/tracker-configuration
- イベントの送り方: https://docs.umami.is/docs/track-events
- スクリプトの関数: https://docs.umami.is/docs/tracker-functions
- アカウント作成: https://docs.umami.is/docs/cloud/sign-up
- スクリプトのソース: https://github.com/umami-software/umami/blob/master/src/tracker/index.ts
- Next.js のスクリプト: `node_modules/next/dist/docs/01-app/02-guides/scripts.md`
