# 1-10: Cloudflare Web Analytics を本番にだけ入れ、Zenn・Qiita から何人来たかを数え始める

- 起票日: 2026-11-04
- 学習計画: まだない（設計の全体像は `docs/design/20260925-blog-design-proposal.md`）
- ステータス: 完了

## 全体のどこか

「記事を表示する」段の10段目にあたる。1-8 でサイトを公開し、1-9 で名札を整えた。ADR `20260925-1906-access-analytics.md` では「公開の最初からアクセス解析を入れる」と決めていたが、まだ入っていない。この回で、訪問者を数え始める。

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

作業ブランチは作らず、`dev` に直接コミットする。

## 作るもの

| 場所                                         | 中身                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------ |
| Cloudflare のダッシュボード                  | Web Analytics に `www.65banseki.dev` を登録し、トークンを受け取る              |
| `app/layout.tsx`                             | 環境変数 `CF_WEB_ANALYTICS_TOKEN` があるときだけ、計測用のスクリプトを読み込む |
| Vercel のダッシュボード                      | 環境変数 `CF_WEB_ANALYTICS_TOKEN` を **Production だけ**に設定する             |
| `docs/adr/20260925-1906-access-analytics.md` | 「未確認」だったデータの保存期間を書き込む                                     |

今回は扱わないもの: 独自のイベント（ボタンが押された回数など）、GraphQL API でのリファラーのパスの取得、プライバシーポリシーのページ、Umami。Umami Cloud は 1-11 で、この回と同じ形（環境変数があるときだけ読み込む）を使って足す。切り替えどきを決める正式な数字は、この回で入れる Cloudflare Web Analytics のほうにする。

## なぜこれをやるか

記事は Zenn・Qiita・自サイトの3か所に配っている（ADR `20260925-1714-cross-post-articles.md`）。自サイトに人が来るようになったら、自サイトだけへの投稿に切り替える予定だ。切り替えどきを判断するには、Zenn・Qiita から何人来たかを、公開の最初から記録しておく必要がある。数えていない期間の数字は、あとから取り戻せない。

もう1つの狙いは、Next.js の環境変数が**いつ読まれるか**を知ることにある。このサイトのページはビルドのときに HTML として焼かれる。環境変数もそのときに読まれて焼き込まれるので、あとから値を変えても、作り直すまで反映されない。

## 周辺知識

### Cloudflare Web Analytics（出典: https://developers.cloudflare.com/web-analytics/get-started/ 、同 FAQ。2026-11-04 に確認）

- 無料。ページに小さなスクリプト（beacon）を読み込ませ、そのスクリプトが訪問の情報を Cloudflare に送る
- DNS の Proxy status が **Proxied** のサイトは、Cloudflare が自動でスクリプトを差し込める。**DNS only** のサイト（このサイト。1-8 で決めた）は、スクリプトを自分で入れる（手動の設定）
- スクリプトの場所は `https://static.cloudflareinsights.com/beacon.min.js`。サイトごとのトークンを `data-cf-beacon` 属性に JSON で書く
- 画面を切り替えずにページを移る作り（SPA）にも、既定で対応している。Next.js の `<Link>` での移動も1ページとして数える。止めるときは `"spa": false` を書く
- 広告ブロッカー（Adblock Plus、Brave、DuckDuckGo の拡張など）はこのスクリプトを止める。止めた人は数えられない
- ダッシュボードで見られるのは**過去6か月分**。細かいデータは7日間だけ残り、その後は約10%に間引いて保存される
- 数えた結果は、表示するときに間引いて集計される（サンプリング）。受け取る側では間引かない

### Next.js でスクリプトを読み込む（出典: `node_modules/next/dist/docs/01-app/02-guides/scripts.md`）

- 外部のスクリプトは `next/script` の `<Script>` で読み込む。ルートのレイアウトに置くと全ページに効き、ページを移っても**1回しか**読み込まない
- 既定の読み込み方（`strategy`）は `afterInteractive`。ページが動き出したあとに読み込む
- `data-*` のような、`<Script>` が使わない属性は、そのまま最終的な `<script>` に渡される

### Vercel の環境変数（出典: https://vercel.com/docs/environment-variables 、2026-11-04 に確認）

- 変数ごとに、使う環境（Production・Preview・Development）を選べる
- 値の種類は Config（あとから読める）と Secret（保存後は読めない）の2つ
- 変数を変えても、**作り済みのデプロイには反映されない**。次のデプロイから使われる

### 実測したこと

2026-11-04、macOS / bun 1.4.4 / Next.js 16.4.1 で、`dev` の `ad1b5d8` を一時ディレクトリに複製し、ダミーのトークンで確かめた。

- トークンなしでビルドすると、どのページにもスクリプトは入らない
- トークン付きでビルドすると、HTML に `<script>` タグとしては入らず、ページを動かすためのデータの中に入る。ブラウザで開くと `<script>` が差し込まれ、`beacon.min.js` を読み込み、`https://cloudflareinsights.com/cdn-cgi/rum` に送ろうとする
- `localhost` からの送信は、Cloudflare 側が受け付けず CORS のエラーになる。手元で開いても数えられない
- **ビルドのときにトークンがなく、起動のときにだけ渡すと、スクリプトは入らない**
- 完成形で `bun run typecheck`・`bun run lint` が通る

**未確認**: Cloudflare のダッシュボードの画面（項目名と順番）。本物のトークンでの計測と、ダッシュボードに数字が出るまでの時間。Vercel で Production だけに変数を設定したときの、プレビューの見え方。広告ブロッカーが止めたときに Network に出る文言（トラブルシュートの `ERR_BLOCKED_BY_CLIENT` は Chrome でよく出るもので、実際には出していない）。

## 作業手順（全体の地図）

1. `dev` を最新にする
2. Cloudflare に `www.65banseki.dev` を登録し、トークンを控える
3. レイアウトに計測用のスクリプトを足す
4. トークンなしでビルドし、スクリプトが入らないことを見る
5. トークン付きでビルドし、ブラウザでスクリプトが動くのを見る
6. トークンを起動のときにだけ渡し、スクリプトが入らないのを見る（**この回の本題**）
7. Vercel に、本番だけのトークンを設定する
8. コミットして push し、プレビューにはスクリプトが入らないことを見る
9. 本番に出し、Cloudflare のダッシュボードで訪問が数えられるのを見る
10. ADR の「未確認」を埋める

## 確認事項

- [x] **トークンの渡し方。** 推奨案「環境変数 `CF_WEB_ANALYTICS_TOKEN` で渡し、コードには書かない」で作成。理由は、リポジトリを公開しているから。コードに書くと、このリポジトリを複製して公開した人の訪問まで、自分のダッシュボードに混ざる。環境変数なら、値がないところ（手元・プレビュー・他人の複製）ではスクリプト自体が入らない。ただし、トークンは HTML に載るので秘密ではない。隠すためではなく、計測する場所を選ぶための仕組みと考える。Vercel での設定と、変えたあとの再デプロイが要る
- [x] **計測する環境。** 推奨案「Production だけ」で作成。理由は、自分がプレビューを確かめた訪問を数えると、Zenn・Qiita から来た人数が分からなくなるから。ただし、プレビューでは計測の動きを確かめられない。手順 5 の手元のビルドで確かめる
- [x] **読み込み方。** 推奨案「`next/script` の `<Script>`（既定の `afterInteractive`）」で作成。理由は、Next.js のドキュメントが外部のスクリプトに勧める形で、ページを移っても1回しか読み込まないから。ただし、HTML に直接 `<script>` を書く Cloudflare の例とは形が違う。ページが動き出してから読み込むので、開いてすぐ閉じた訪問は数えられないことがある
- [x] **変数の名前。** 推奨案「`CF_WEB_ANALYTICS_TOKEN`（`NEXT_PUBLIC_` を付けない）」で作成。理由は、読むのがサーバーで動くレイアウトだけだから。`NEXT_PUBLIC_` は、ブラウザで動くコードにも値を渡すための印で、ここでは要らない。ただし、あとでブラウザで動くコンポーネント（`"use client"`）から読もうとすると、値が空になる
- [x] **Vercel での変数の種類。** 推奨案「Config」で作成。理由は、トークンはどうせ HTML に載るので隠す意味がなく、あとから値を見て確かめられるほうが便利だから。ただし、Config の値はプロジェクトのメンバー全員が読める（今は自分だけ）
- [x] **SPA の計測。** 推奨案「既定のまま（オン）」で作成。理由は、Next.js の `<Link>` での移動も1ページとして数えたいから。ただし、ブラウザの戻る・進むも数えるので、同じ人が行き来すると回数が増える
- [x] **登録するホスト名。** 推奨案「`www.65banseki.dev`」で作成。理由は、1-8 で `www` 付きを正にしたから（`65banseki.dev` に来た人も `www` に移る）。ただし、ダッシュボードの画面が手順と違ったら、画面に合わせて読み替える（未確認）
- [x] **【標準ルールからの逸脱】TDD を適用しない。** 本人の判断（2026-11-03）による。この回は外部サービスの設定と、スクリプトを1つ足すことが中心で、確かめるのはビルドした HTML とブラウザの通信

## ハンズオン

ここに出てくるコマンドの出力は、ダミーのトークン（`dummy-token`）で実際に動かして写したもの（2026-11-04、bun 1.4.4 / Next.js 16.4.1）。Cloudflare と Vercel のダッシュボードの操作は、ドキュメントを読んで書いたもので、画面は確かめていない。

---

### 準備：この回で何をするのか

Cloudflare に、このサイトの訪問を数えてもらう。そのために、全ページに小さなスクリプトを読み込ませる。ただし、数えるのは本番だけにする。手元やプレビューの訪問まで数えると、知りたい数字（Zenn・Qiita から何人来たか）が分からなくなるからだ。

#### アクセス解析は「入口のカウンター」

お店の入口にカウンターを置き、人が入るたびにカチッと押すのと同じだ。このサイトでは、ページを開いた人のブラウザが、Cloudflare に「1人来ました。前にいたページはここです」と知らせる。知らせる係が beacon（ビーコン）というスクリプトで、`beacon.min.js` という名前で Cloudflare が配っている。

「前にいたページ」をリファラーと呼ぶ。Zenn の記事のリンクから来た人なら、リファラーは `zenn.dev` になる。この回で欲しいのはこの数字だ。

#### トークンは「お店の番号」

Cloudflare には、たくさんのサイトのカウンターが届く。どのお店のカウンターかを見分けるのがトークンで、スクリプトと一緒にページに書いておく。HTML に載るので、誰でも見られる。パスワードのような秘密ではない。

#### 用意するもの

- 1-9 を完了してコミットした状態のリポジトリ（`dev`）
- Cloudflare のアカウント（1-8 でドメインを管理しているもの）
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

`nothing to commit, working tree clean` と出ることを確かめる。`content/ogp.md` が `Untracked files` に出ていたら、それは 1-9 のときのメモで、この回では触らない。

**なぜ** — `dev` に直接コミットする流れなので、GitHub の `dev` と手元の `dev` を先にそろえておく。

---

### 手順 2：Cloudflare に `www.65banseki.dev` を登録し、トークンを控える

1. https://dash.cloudflare.com/?to=/:account/web-analytics を開く（公式の手順にあるリンクで、Web Analytics の画面に直接移る）
2. **Add a site** を押す
3. **Set up hostname** に `www.65banseki.dev` を**手で入力する**。出てきた候補から入力した名前を選び、**Done** を押す
4. サイトの **Manage site** を開き、表示された JS snippet（スクリプトの見本）を見る

見本は次のような形をしている。これは Cloudflare のドキュメントにある例から、SPA の計測を止める指定（`"spa": false`）を除いたもので、ダッシュボードの見本そのものではない。トークンの中身は人によって違う。

```html
<script
  type="module"
  src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon='{"token": "ここに英数字の長い文字列"}'
></script>
```

`"token":` の後ろの英数字を控える。見本そのものは貼らない。手順 3 で、Next.js の書き方に直して使う。`type="module"` ではなく `defer` になっているなど、細かい形が違っても、トークンを控えればよい。

**なぜ自分で入れるのか** — 1-8 で、Cloudflare の Proxy status を **DNS only** にした。このとき、Cloudflare は住所を答えるだけで、ページの中身は通らない。中身を通らないので、Cloudflare がスクリプトを差し込むことができない。そのため、自分でページに入れる「手動の設定」になる。

**なぜ手で入力するのか** — 一覧から `65banseki.dev` のようなドメインを選ぶのは、Proxied のサイト向けの「自動の設定」の入り方だ。このサイトは DNS only なので、ホスト名を自分で書く「手動の設定」にする。手動の設定では、ここで受け取ったトークンを持つページだけが、このサイトの数字として数えられる。同じドメインの別のサブドメイン（`go-blog.65banseki.dev` など）は、このトークンを使わない限り混ざらない。

**画面が違ったら** — ダッシュボードの画面は確かめていない（未確認）。項目名が違ったら、「Web Analytics」「サイトの追加」「トークン」を探す。

---

### 手順 3：レイアウトに計測用のスクリプトを足す

`app/layout.tsx` を2か所書き換える。

1つ目。`import` に1行足す。

```tsx
import Link from "next/link";
import Script from "next/script";
import { SITE_NAME, siteOpenGraph } from "../lib/siteMetadata";
```

2つ目。`<body>` の中の `{children}` の下に足す。

```tsx
<body className="min-h-full flex flex-col">
  <Link href="/">ホーム</Link>
  {children}
  {process.env.CF_WEB_ANALYTICS_TOKEN && (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: process.env.CF_WEB_ANALYTICS_TOKEN })}
    />
  )}
</body>
```

**`process.env.CF_WEB_ANALYTICS_TOKEN` は何か** — 環境変数という、コードの外から渡す値だ。コードに直接書かず、動かす場所ごとに違う値を渡せる。ここでは「トークンがあればスクリプトを入れ、なければ入れない」という分かれ道に使っている。

**`&&` で何をしているのか** — `A && B` は、A が空でなければ B を、空なら何も出さない。トークンがないところ（手元・プレビュー・他人の複製）では、スクリプトそのものが入らない。

**`JSON.stringify` は何か** — `{ token: "..." }` という JavaScript の値を、`{"token":"..."}` という文字列に直す。Cloudflare の見本の `data-cf-beacon='{"token": "..."}'` と同じ形になる。

**なぜ `<Script>` を使うのか** — Next.js では、ページを移るときに画面全体を読み込み直さない。そのとき、ふつうの `<script>` だと、同じスクリプトが二重に動くことがある。`<Script>` は、ページを移っても1回しか読み込まないように面倒を見てくれる。

---

### 手順 4：トークンなしでビルドし、スクリプトが入らないことを見る

```bash
bun run build
grep -c 'beacon.min.js' .next/server/app/index.html
```

```
0
```

`0` は、トップページの HTML に `beacon.min.js` が1回も出てこない、という意味だ。

**読み取れること** — 手元にはトークンがないので、`&&` の分かれ道で何も出さなかった。手元で何度ページを開いても、自分のダッシュボードには数えられない。

---

### 手順 5：トークン付きでビルドし、ブラウザでスクリプトが動くのを見る

本物のトークンは使わず、ダミーの文字列で試す。コマンドの頭に `変数名=値` を書くと、そのコマンドの間だけ環境変数を渡せる。

```bash
CF_WEB_ANALYTICS_TOKEN=dummy-token bun run build
grep -c 'beacon.min.js' .next/server/app/index.html
grep -c '<script src="https://static.cloudflareinsights' .next/server/app/index.html
```

```
1
0
```

1行目は `1` になった。トークンを渡したので、スクリプトが入った。ところが2行目は `0` で、`<script src="...">` というタグの形ではどこにも出てこない。

**どこに入ったのか** — `<Script>` は、HTML に `<script>` タグを書かない。ページを動かすためのデータの中に「このスクリプトを読み込む」とだけ書いておき、ブラウザでページが動き出したあとに `<script>` を差し込む。手順 3 で見た「既定の `afterInteractive`」がこれだ。

ブラウザで確かめる。サーバーを起動する。

```bash
PORT=3123 bun run start
```

ブラウザで `http://localhost:3123/posts/hello` を開き、開発者ツールを開く（Mac の Chrome なら `Cmd + Option + I`）。

1. **Elements** タブで `Cmd + F` を押し、`cloudflareinsights` を探す。次の `<script>` が見つかる

   ```
   <script src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon="{&quot;token&quot;:&quot;dummy-token&quot;}" data-nscript="afterInteractive"></script>
   ```

2. **Network** タブで、ページを再読み込みし、絞り込みに `cloudflare` と入れる。2つの通信が見える

   ```
   [GET] https://static.cloudflareinsights.com/beacon.min.js => [200]
   [POST] https://cloudflareinsights.com/cdn-cgi/rum => [FAILED] net::ERR_FAILED
   ```

3. **Console** タブに、次のエラーが出ている

   ```
   Access to XMLHttpRequest at 'https://cloudflareinsights.com/cdn-cgi/rum' from origin 'http://localhost:3123' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: The 'Access-Control-Allow-Origin' header has a value 'http://localhost' that is not equal to the supplied origin.
   ```

**読み取れること** — 1つ目の通信で、Cloudflare からビーコンを受け取った。2つ目の通信で、ビーコンが「1人来ました」と送ろうとして、Cloudflare に断られた。

**なぜ断られたのか** — CORS は、ブラウザが「このページから、あのサーバーに送ってよいか」を相手のサーバーに確かめる仕組みだ。Cloudflare は `localhost:3123` からの送信を許していない。手元で試しても数字が混ざらないので、このエラーはむしろ都合がよい。

確かめたら、ターミナルで `Ctrl + C` を押してサーバーを止める。

---

### 手順 6：トークンを起動のときにだけ渡し、スクリプトが入らないのを見る（この回の本題）

手順 5 では、ビルドのときにトークンを渡した。今度は、**トークンなしでビルドし、起動のときにだけ**渡してみる。

```bash
bun run build
CF_WEB_ANALYTICS_TOKEN=dummy-token PORT=3123 bun run start
```

ブラウザで `http://localhost:3123/posts/hello` を開き、手順 5 と同じように Elements で `cloudflareinsights` を探す。**見つからない**。Network にも `cloudflare` の通信は出ない。エラーも警告も出ない。

確かめたら `Ctrl + C` でサーバーを止める。

**何が起きたのか** — 1-7 で見たとおり、このサイトのページはビルドのときに HTML として焼かれる（ビルドの表の `○` と `●`）。`process.env.CF_WEB_ANALYTICS_TOKEN` もそのときに一度だけ読まれ、「トークンなし」で焼かれた。起動のときに渡した値は、もう焼き上がったページには届かない。

```
ビルド（bun run build）              起動（bun run start）
  レイアウトを動かす                    焼いた HTML を配るだけ
  process.env を読む ← ここで決まる     process.env を渡しても、もう読まない
  HTML を焼く
```

**この発見が今後どこに効くか** — 手順 7 で Vercel に変数を足すとき、**足したあとに作り直す（デプロイし直す）までは反映されない**。Vercel のドキュメントにも「変数を変えても、作り済みのデプロイには反映されない」とある。トークンを入れたのに数字が出ないときは、まずこれを疑う。sitemap や RSS で記事の URL を作るときも、ページに値を焼き込む話はすべて同じ順番で動く。

---

### 手順 7：Vercel に、本番だけのトークンを設定する

1. Vercel のダッシュボードで、このプロジェクトを開く
2. **Settings** → **Environment Variables** を開く
3. 次のとおりに入れて、保存する

| 項目         | 値                                    |
| ------------ | ------------------------------------- |
| Key          | `CF_WEB_ANALYTICS_TOKEN`              |
| Value        | 手順 2 で控えたトークン               |
| Environments | **Production** だけにチェックを入れる |
| 種類         | Config                                |

**なぜ Production だけなのか** — Preview にも入れると、自分がプレビューで確かめた訪問まで数えられる。知りたいのは Zenn・Qiita から来た人の数なので、本番だけにする。

**なぜ `.env` ファイルに書かないのか** — 手元にトークンを置く理由がないからだ。手元では手順 5 のように、ダミーの値をコマンドの頭で渡せば確かめられる。

---

### 手順 8：コミットして push し、プレビューにはスクリプトが入らないことを見る

```bash
bun run typecheck
bun run lint
git status
git add app/layout.tsx
git commit -m "feat: Cloudflare Web Analytics のスクリプトを、トークンがあるときだけ読み込む"
git push
```

push すると `dev` のプレビューができる。Vercel のダッシュボードの **Deployments** からプレビューを開き、手順 5 と同じように Elements で `cloudflareinsights` を探す。**見つからない**ことを確かめる。

**読み取れること** — プレビューには `CF_WEB_ANALYTICS_TOKEN` がないので、手順 4 と同じ「トークンなし」で焼かれた。プレビューの訪問は数えられない。

---

### 手順 9：本番に出し、Cloudflare のダッシュボードで訪問が数えられるのを見る

```bash
git switch main
git merge --ff-only dev
git push
git switch dev
```

`main` への push で、本番のデプロイが新しく作られる。手順 7 の変数は、ここで初めて読まれる。

デプロイが終わったら、`https://www.65banseki.dev/posts/hello` を開く。広告ブロッカーを入れているなら、このサイトだけ止める。開発者ツールで2つを確かめる。

1. Elements に、`data-cf-beacon` に手順 2 のトークンが入った `<script>` がある
2. Network に `https://cloudflareinsights.com/cdn-cgi/rum` への `POST` があり、手順 5 と違って失敗していない

最後に、Cloudflare のダッシュボードの **Web Analytics** で、`www.65banseki.dev` の訪問が増えているかを見る。数字が出るまでに時間がかかることがある（どれくらいかは未確認）。

**`ERR_BLOCKED_BY_CLIENT` が出たら** — 広告ブロッカーがビーコンを止めている。周辺知識のとおり、こうした人は数えられない。アクセス解析の数字は「実際に来た人の数」より少なめに出ると思っておく。

---

### 手順 10：ADR の「未確認」を埋める

`docs/adr/20260925-1906-access-analytics.md` の最後の節は、次のようになっている。

```markdown
## 未確認

- データの保存期間。導入時に公式ドキュメントで確認する
```

これを次のように書き換える。

```markdown
## 確認したこと

- データの保存期間: ダッシュボードで見られるのは過去6か月分。細かいデータは7日間だけ残り、その後は約10%に間引いて保存される（2026-11-04 に https://developers.cloudflare.com/web-analytics/faq/ で確認）
```

```bash
git add docs/adr/20260925-1906-access-analytics.md tickets/1-10-web-analytics.md
git commit -m "docs: Web Analytics のデータの保存期間を ADR に書き込む"
git push
```

**なぜ ADR に書くのか** — ADR は、決めたときに分からなかったことも含めて残す記録だ。「未確認」のまま放っておくと、あとで読んだ人は、確かめたのか忘れたのかを見分けられない。6か月より前の数字は自分で残さないと消える、という事実は、切り替えどきを判断するときに効いてくる。

---

### うまくいかないとき

| 症状                                                        | 原因と対処                                                                                              |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 本番の Elements に `cloudflareinsights` がない              | 変数を足す前のデプロイを見ている。Vercel で本番をデプロイし直す（手順 6 の本題）                        |
| 本番でスクリプトはあるが、`data-cf-beacon` のトークンが違う | Vercel の変数の値が違う。直したあと、デプロイし直す                                                     |
| プレビューにもスクリプトが入っている                        | Vercel の変数の Environments に Preview にもチェックが入っている。Production だけにして、デプロイし直す |
| Network で `beacon.min.js` が `ERR_BLOCKED_BY_CLIENT`       | 広告ブロッカーが止めている。このサイトだけ止めて確かめる                                                |
| 手元で `/cdn-cgi/rum` が CORS のエラーになる                | 手元からの送信は Cloudflare が受け付けない。手順 5 のとおりで、問題ない                                 |
| `bun run build` のあと `grep -c` が `1` にならない          | コマンドの頭に `CF_WEB_ANALYTICS_TOKEN=dummy-token` を付け忘れている。付けるのは `bun run build` の側   |
| Cloudflare のダッシュボードに数字が出ない                   | 出るまで時間がかかることがある。本番の Network で `/cdn-cgi/rum` が成功しているかを先に見る             |

ここに載っていないエラーが出たら、そのまま貼って聞いてほしい。

---

## 受け入れ条件

- [x] トークンなしでビルドすると、`grep -c 'beacon.min.js' .next/server/app/index.html` が `0` を出す
- [x] `CF_WEB_ANALYTICS_TOKEN=dummy-token` を付けてビルドすると、同じコマンドが `1` を出す
- [x] 手順 6 で、起動のときにだけトークンを渡しても、スクリプトが入らないのを自分で確かめた
- [x] Vercel の `CF_WEB_ANALYTICS_TOKEN` が Production だけに設定されている
- [x] `dev` のプレビューに `cloudflareinsights` のスクリプトがない
- [x] 本番（`https://www.65banseki.dev`）に、手順 2 のトークンが入ったスクリプトがあり、`/cdn-cgi/rum` への送信が成功している
- [x] Cloudflare のダッシュボードで、`www.65banseki.dev` の訪問が1件以上数えられている
- [x] ADR `20260925-1906-access-analytics.md` に、データの保存期間が書き込まれている
- [x] `bun run typecheck` と `bun run lint` がエラーなしで終わる

## この回で理解したこと

着手後に埋める。動いたか（受け入れ条件）とは別に、何が分かったかを残す。

- [x] DNS only のサイトでは、Cloudflare がスクリプトを自動で差し込めない理由を説明できる
- [x] `<Script>` で読み込んだスクリプトが、HTML に `<script>` タグとして出てこない理由を説明できる
- [x] 起動のときにだけトークンを渡しても、スクリプトが入らなかった理由を説明できる
- [x] Vercel で変数を足したあと、デプロイし直さないと反映されない理由を説明できる
- [x] トークンをコードに書かず、環境変数で渡した理由を説明できる

## 参考

- Cloudflare Web Analytics の始め方: https://developers.cloudflare.com/web-analytics/get-started/
- Cloudflare Web Analytics の FAQ（保存期間、広告ブロッカー）: https://developers.cloudflare.com/web-analytics/faq/
- SPA の計測: https://developers.cloudflare.com/web-analytics/get-started/web-analytics-spa/
- Next.js のスクリプトの読み込み: `node_modules/next/dist/docs/01-app/02-guides/scripts.md`
- Vercel の環境変数: https://vercel.com/docs/environment-variables
- 決定の記録: `docs/adr/20260925-1906-access-analytics.md`
- 前の回: `tickets/1-9-site-metadata.md`
