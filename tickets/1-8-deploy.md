# 1-8: Vercel で公開して 65banseki.dev をつなぎ、`metadataBase` の警告を消す

- 起票日: 2026-11-03
- 学習計画: まだない（設計の全体像は `docs/design/20260925-blog-design-proposal.md`）
- ステータス: 未着手

## 全体のどこか

「記事を表示する」段の8段目にあたる。1-7 で作ったシェア用の画像は、サイトがインターネットに出ていないと SNS から見えない。この回でサイトを初めて公開する。

| Step | 内容                                                   | 進捗           |
| ---- | ------------------------------------------------------ | -------------- |
| 1-1  | 記事1本を `/posts/[slug]` に表示する                   | ■■■ 完了       |
| 1-2  | `/posts` に記事の一覧を出す                            | ■■■ 完了       |
| 1-3  | Shiki でコードブロックに色を付ける                     | ■■■ 完了       |
| 1-4  | Valibot で frontmatter の中身を検査し、`as` を取り除く | ■■■ 完了       |
| 1-5  | タグを付け、`/tags` と `/tags/[tag]` を作る            | ■■■ 完了       |
| 1-6  | 見出しから目次を作る                                   | ■■■ 完了       |
| 1-7  | 記事ごとにシェア用の画像を作る                         | ■■■ 完了       |
| 1-8  | Vercel で公開し、ドメインをつなぐ                      | ■□□ ← いまここ |

このチケットは 1-7 を完了してコミットしたあとの状態（`c8a873d`）から始める。

決めたことの理由と採らなかった案は、ADR `docs/adr/20261103-2241-host-on-vercel.md` にある。

## 作るもの

| 場所                                         | 中身                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| `main` ブランチ                              | 1-7 までの作業を取り込む（いまは最初のコミット `init` しかない）        |
| GitHub の `hi-lee-mon/65-blog-app`（public） | 新しく作り、`main` を push する                                         |
| Vercel のプロジェクト                        | GitHub のリポジトリを取り込んで作る。`main` に push すると本番に出る    |
| Cloudflare の DNS                            | `65banseki.dev` と `www.65banseki.dev` を Vercel に向けるレコードを足す |
| `app/layout.tsx`                             | `metadata` に `metadataBase: new URL("https://65banseki.dev")` を足す   |
| `docs/adr/20261103-2241-host-on-vercel.md`   | ホスティング先を決めた記録（作成済み。この回のコミットに含める）        |

今回は扱わないもの: サイト全体の `title`・`description`（「Create Next App」のまま公開される）、Cloudflare Web Analytics、プロキシ（Cloudflare のオレンジの雲）を使った配信。

## なぜこれをやるか

1-7 のビルドで出続けている警告は、「`og:image` の URL の頭に付けるサイトの住所が分からないので、仮に `http://localhost:3000` を使う」という意味だった。住所を書けば警告は消える。ただ、その住所でサイトが実際に開けなければ、SNS は画像を取りに来られない。だから住所を書くことと、その住所でサイトを公開することを1回でやる。

もう1つの狙いは、Next.js が `metadataBase` のない状態をどう扱っているかを知ることにある。Vercel の上では、警告が出ているのに `og:image` の住所が正しくなる。なぜそうなるのかを Next.js のコードで確かめると、「書かなくても動く設定を、なぜ書くのか」に自分で答えられるようになる。

## 周辺知識

### 登場するサービス

| サービス   | この回での役割                                                         |
| ---------- | ---------------------------------------------------------------------- |
| GitHub     | コードの置き場所。Vercel はここからコードを取ってくる                  |
| Vercel     | コードを受け取ってビルドし、インターネットに公開する。Next.js の開発元 |
| Cloudflare | `65banseki.dev` を買った店。DNS（住所録）もここにある                  |

### Vercel の仕様（出典: Vercel のドキュメント、2026-11-03 に読んだ）

- `bun.lock` があると bun でインストールする。ただし、Vercel が使う bun の版はドキュメントに書かれていない（[Package Managers](https://vercel.com/docs/package-managers)）
- Hobby プランは個人の非商用に限られる
- 既定の保護（Standard Protection）では、本番のドメイン以外の URL（プレビューなど）を開くのに Vercel へのログインが要る（[Deployment Protection](https://vercel.com/docs/deployment-protection)）
- ドメインのいちばん短い形（`65banseki.dev`）は A レコード、`www` のような頭の付いた形は CNAME レコードでつなぐ。値は Vercel の画面に出る（[Adding & Configuring a Custom Domain](https://vercel.com/docs/domains/working-with-domains/add-a-domain)）
- Cloudflare は DNS としてだけ使い、プロキシは切る形を勧めている（[Using Cloudflare and other reverse proxies with Vercel](https://vercel.com/kb/guide/can-i-use-a-proxy-on-top-of-my-vercel-deployment)）

### Vercel が入れる環境変数（出典: [System environment variables](https://vercel.com/docs/environment-variables/system-environment-variables)）

| 変数                            | 中身                                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| `VERCEL_ENV`                    | `production`・`preview`・`development` のどれか                                                    |
| `VERCEL_PROJECT_PRODUCTION_URL` | 本番の住所。独自ドメインがあればいちばん短いもの、なければ `vercel.app` の住所。プレビューでも入る |
| `VERCEL_BRANCH_URL`             | ブランチごとの住所（`*-git-*.vercel.app`）                                                         |

### 実測したこと

2026-11-03、macOS / Node v26.13.0 / bun 1.4.4 / Next.js 16.4.1 で、1-7 のコミット（`c8a873d`）を一時ディレクトリに複製して確かめた。

- まっさらな状態から `CI=1 bun install` でインストールが通る。lefthook の postinstall は `trustedDependencies: []` で止まるが、ビルドには関係しない
- `bun.lock` に Linux 向けの tsrs（`@tsrs/linux-x64-gnu`）が載っている。Vercel のビルド機（Linux）でも型検査の道具が入る見込み
- Vercel の環境変数を手で与えてビルドし、`og:image` の住所を見た（手順 6 と手順 9 の表）
- `metadataBase` を足すと警告が消え、`bun run typecheck`・`bun run lint`・`bun run format:check` が通る
- これまでの履歴全体に、秘密の値の形が見つからない（手順 1）

**未確認**: Vercel・GitHub・Cloudflare の画面の操作と、そこに出る値。Vercel が使う bun の版。DNS が行き渡るまでの時間。どれも自分の画面で確かめる。

## 作業手順（全体の地図）

1. push の前に、これまでの履歴に秘密の値がないかを調べる
2. `main` を 1-7 まで進める
3. GitHub に public のリポジトリを作り、`main` を push する
4. Vercel にリポジトリを取り込み、最初のデプロイをする
5. ビルドログで bun の版と警告を確かめる
6. 警告が出ているのに `og:image` の住所が正しい理由を確かめる（**この回の本題**）
7. `65banseki.dev` を Vercel につなぐ
8. `metadataBase` を足して、手元の警告を消す
9. ブランチを push して、プレビューの `og:image` を見る
10. `main` に取り込んで、本番に出す
11. SNS のカードの見え方を確かめる

## 確認事項

- [ ] **公開する場所。** 推奨案「Vercel の Hobby プラン」で作成。理由は`cacheComponents` などの新しい機能がそのまま動き、設定がいちばん少ないから。ただし、ドメインは Cloudflare、サイトは Vercel と、管理する画面が2つに分かれる。Hobby は個人の非商用に限られる。Cloudflare Workers に置く案は ADR に書いた
- [ ] **デプロイのやり方。** 推奨案「GitHub と連携し、`main` への push で本番に出す」で作成。理由はpush するだけで出せて、ブランチごとのプレビューも自動で作られるから。ただし、`main` に入れたものはすぐ公開される。書きかけの記事を `main` に入れないよう気をつける
- [x] **GitHub のリポジトリの公開範囲。** 推奨案は「private」だったが、本人の判断（2026-11-03）で「public」に変えて作成。理由は、学習の過程をコードごと見せられるようにしておきたいから。ただし、全コミットの作者欄の個人のメールアドレスも公開される。隠したくなったら、以後のコミットを GitHub の noreply アドレスで作る。公開済みの履歴は、書き換えてもすでに取得された写しからは消えない。
- [x] **`main` の進め方。** 推奨案「1-7 のブランチを `main` に早送り（`--ff-only`）で取り込む」で作成。理由は1-1 から 1-7 のブランチが一本の線でつながっていて、余計なコミットを作らずに済むから。ただし、プルリクエストを作らないので、GitHub に「何をなぜ入れたか」の記録は残らない（コミットのメッセージには残る）
- [ ] **主にするドメイン。** 推奨案「`65banseki.dev` を主にし、`www.65banseki.dev` はそこへ転送する」で作成。理由は短く、`metadataBase` に書く住所と同じになるから。ただし、Vercel のドキュメントは `www` を主にする形を勧めている。DNS の仕組み上、頭に何も付かない形はサービスを移すときに融通が利きにくい
- [ ] **Cloudflare のプロキシ。** 推奨案「使わない（DNS only）」で作成。理由はVercel がそう勧めていて、間に挟まる仕組みが1つ減るから。ただし、Cloudflare のキャッシュや防御の機能は使えない
- [ ] **`metadataBase` の書き方。** 推奨案「`app/layout.tsx` に `https://65banseki.dev` を直接書く」で作成。理由はVercel の上では無くても動くが、手元のビルドの警告が消え、置き場所を移しても住所が変わらないから。ただし、ドメインを変えたらここも直す必要がある。環境変数で渡す案もあるが、住所が1つしかないうちは直接書くほうが読みやすい
- [ ] **【標準ルールからの逸脱】TDD を適用しない。** 本人の判断（2026-11-03）による。この回はサービスの設定が中心で、テストを書く対象がほとんどない

## ハンズオン

手元で動かすコマンドの出力は、実際に動かして写したもの（2026-11-03、bun 1.4.4 / Next.js 16.4.1）。Vercel・GitHub・Cloudflare の画面の文言とそこに出る値は確かめていないので、画面に出たものを正とする。

---

### 準備：この回で何をするのか

手元のパソコンの中にしかなかったブログを、インターネットに出す。コードを GitHub に置き、Vercel がそれを取ってきてビルドして公開する。最後に、Cloudflare で買った `65banseki.dev` という住所を、Vercel で公開したサイトに結びつける。

#### 登場人物の関係

```
手元のパソコン
   │ git push
   ▼
GitHub（コードの倉庫）
   │ push されたら知らせる
   ▼
Vercel（ビルドして公開する）  ←──┐
                                    │ 「65banseki.dev はここ」
ブラウザ ──「65banseki.dev は？」──▶ Cloudflare の DNS（住所録）
```

この図から分かることは3つある。

- 手元から直接 Vercel に送るのではない。GitHub に push すると、Vercel が気づいて取りに行く
- ブラウザは最初に Cloudflare の住所録を引き、そこで教わった場所（Vercel）へ行く
- だから Cloudflare の住所録に「`65banseki.dev` は Vercel にある」と書く作業が要る（手順 7）

#### DNS は、ドメイン名を電話番号に引き直す電話帳

ブラウザは `65banseki.dev` という名前のままではサーバーにたどり着けない。インターネットの上の機械は`76.76.21.21` のような番号（IP アドレス）で相手を探す。名前から番号を引くための電話帳が DNS になる。

電話帳の1行をレコードと呼ぶ。この回で使うのは2種類だけだ。

| レコード | 書く中身        | 例え                                   |
| -------- | --------------- | -------------------------------------- |
| A        | 名前 → 番号     | 「65banseki.dev の番号は 76.76.21.21」 |
| CNAME    | 名前 → 別の名前 | 「www の番号は、あちらの名前で引いて」 |

#### 用意するもの

- 1-7 を完了してコミットした状態のリポジトリ
- GitHub のアカウント（`gh` コマンドでログイン済み）
- Vercel のアカウント（なければ手順 4 で GitHub のアカウントを使って作る）
- Cloudflare のアカウント（`65banseki.dev` を買ったもの）

---

### 手順 1：push の前に、これまでの履歴に秘密の値がないかを調べる

手順 1〜3 は、本人の依頼で 2026-11-03 に Claude が実行した。コマンドは読んで意味を確かめ、手順 3 の最後の確認だけ自分の目で行う。

```bash
cd ~/ghq/github.com/hi-lee-mon/65-blog-app
git log -p --all -- . ':!*.sum' ':!pnpm-lock.yaml' ':!bun.lock' \
  | grep -E '^\+' \
  | grep -nE '/Users/[a-z]|/home/[a-z]|(^|[^0-9])[0-9]{12}([^0-9]|$)|AKIA[0-9A-Z]{16}|postgres(ql)?://[^ ]*@|awsapps\.com|[a-z0-9]{20,}\.lambda-url\.|PRIVATE KEY|[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z.]{2,}'
```

```
7705:+@AGENTS.md
```

行番号は違ってもよい。出てくるのは `@AGENTS.md` の1行だけで、これは `CLAUDE.md` が `AGENTS.md` を読み込む書き方なので問題ない。

**なぜ** — コミットのたびに同じ検査をしてきたが、それは「今回足す行」だけを見ていた。push すると過去のコミットもまとめて GitHub に渡る。一度渡したものは、あとから消しても誰かの手元に残りうるので、渡す前に全部を一度見ておく。`bun.lock` を外しているのは、中のハッシュ値が12桁の数字の形に当たってしまうため。

**検査では見えないもの** — コミットの作者欄のメールアドレスは、差分の外にあるのでこの検査に出ない。public にすると、このメールアドレスも誰でも読めるようになる。

---

### 手順 2：`main` を 1-7 まで進める

```bash
git switch main
git merge --ff-only feat/1-7-og-image
git log --oneline -3
```

```
c8a873d feat: 記事ごとにタイトルと日付を載せたシェア用の画像をビルド時に作る
8819247 feat: 記事の見出しから目次を作り、押すとその見出しへ飛べるようにする
5bcebe0 feat: トップページと全ページのヘッダーに、記事一覧・タグ一覧への導線を置く
```

**なぜ** — Vercel は `main` を本番として公開する。いまの `main` には最初のコミット `init` しかないので、このまま公開すると何もないサイトが出る。

**`--ff-only` は何をするのか** — `main` の印（ブランチ）を、1-7 の最後のコミットまで前へずらすだけの取り込み方で、早送り（fast-forward）と呼ぶ。1-1 から 1-7 のブランチは一本の線でつながっているので、印をずらすだけで全部が入る。線が枝分かれしていて印をずらすだけでは済まないときは、取り込まずに止まってくれる。

---

### 手順 3：GitHub に public のリポジトリを作り、`main` を push する

```bash
gh repo create 65-blog-app --public --source=. --remote=origin
git remote -v
git push -u origin main
```

`git remote -v` に、次の2行が出ればよい（`ssh` か `https` かは設定で変わる）。

```
origin  git@github.com:hi-lee-mon/65-blog-app.git (fetch)
origin  git@github.com:hi-lee-mon/65-blog-app.git (push)
```

ブラウザで `https://github.com/hi-lee-mon/65-blog-app` を開き、`Public` の印が付いていること、ファイルが並んでいることを確かめる。

**なぜ `--source=.` なのか** — 空のリポジトリを GitHub に作り、いまいるフォルダの Git に `origin` という名前で結びつける指定だ。結びつけたあとで、`main` だけを push する。ほかの `feat/` のブランチは Vercel にプレビューを作らせたくなるまで手元に置いておく。

---

### 手順 4：Vercel にリポジトリを取り込み、最初のデプロイをする

1. https://vercel.com を開き、GitHub のアカウントでログインする（初めてなら Hobby プランで作る）
2. ダッシュボードで新しいプロジェクトを作る画面へ進み、GitHub のリポジトリを取り込む
3. GitHub のどのリポジトリを Vercel に見せるかを聞かれたら、`65-blog-app` だけを選ぶ
4. 取り込み画面で、フレームワークが Next.js と判定されていることを確かめる。ビルドとインストールのコマンドは変えない
5. デプロイを始める

数分でビルドが終わり、`https://<プロジェクト名>.vercel.app` のような住所が出る。開いてトップページが表示されれば成功。

**なぜ GitHub に見せるリポジトリを1つに絞るのか** — Vercel は GitHub の「アプリ」として、選んだリポジトリを読む権限を持つ。全部を選ぶと、ほかの private なリポジトリまで読める状態になる。使うものだけに絞っておく。

**ボタンや画面の名前がこの通りでないとき** — Vercel の画面はよく変わる。上の流れ（ログイン → 新しいプロジェクト → GitHub から取り込む → デプロイ）に沿って、近い名前のボタンを選べばよい。

---

### 手順 5：ビルドログで bun の版と警告を確かめる

Vercel のプロジェクトの画面で、いまのデプロイを開き、ビルドログ（Build Logs）を表示する。次の3点を探す。

1. `bun install` の行と、bun の版（`bun install v1.x.x` のような行）
2. `bun run build` が動き、`next typegen && tsrs --noEmit` が通っていること
3. 手元と同じ警告が出ていること

```
⚠ metadataBase property in metadata export is not set for resolving social open graph or twitter images, using "http://localhost:3000".
```

bun の版は、このチケットの受け入れ条件に書き写す欄がある。

**なぜ版を見るのか** — `bunfig.toml` に書いた `minimumReleaseAge`（公開から3日たたない版を入れない）と、セキュリティスキャナーは、bun 1.3 で入った機能だ。Vercel の bun がそれより古いと、この2つが黙って効いていない恐れがある。手元の bun は 1.4.4 だが、Vercel のビルド機は別の機械なので、同じとは限らない。

---

### 手順 6：警告が出ているのに `og:image` の住所が正しい理由を確かめる（この回の本題）

`<プロジェクト名>` を手順 4 の住所に置き換えて、記事ページの `og:image` を取り出す。

```bash
curl -s https://<プロジェクト名>.vercel.app/posts/hello | grep -o '<meta property="og:image" [^>]*>'
```

手元のビルドでは `http://localhost:3000/...` だった。ところが Vercel では、次の形になるはずだ（`?` のあとの文字列は変わる）。

```
<meta property="og:image" content="https://<プロジェクト名>.vercel.app/posts/hello/opengraph-image?..."/>
```

ビルドログには「`localhost:3000` を使う」と警告が出ていた。それなのに住所は正しい。Next.js の中を見る。

```bash
grep -n "VERCEL" node_modules/next/dist/lib/metadata/resolvers/resolve-url.js
```

```
51:    const origin = process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL;
55:    const origin = process.env.VERCEL_PROJECT_PRODUCTION_URL;
```

```bash
sed -n 58,69p node_modules/next/dist/lib/metadata/resolvers/resolve-url.js
```

```text
function getSocialImageMetadataBaseFallback(metadataBase) {
    const defaultMetadataBase = createLocalMetadataBase();
    const previewDeploymentUrl = getPreviewDeploymentUrl();
    const productionDeploymentUrl = getProductionDeploymentUrl();
    let fallbackMetadataBase;
    if (process.env.NODE_ENV === 'development') {
        fallbackMetadataBase = defaultMetadataBase;
    } else {
        fallbackMetadataBase = process.env.NODE_ENV === 'production' && previewDeploymentUrl && process.env.VERCEL_ENV === 'preview' ? previewDeploymentUrl : metadataBase || productionDeploymentUrl || defaultMetadataBase;
    }
    return fallbackMetadataBase;
}
```

**何をしているのか** — シェア用の画像の住所を決める順番が書いてある。読み下すとこうなる。

1. Vercel のプレビュー（`VERCEL_ENV` が `preview`）なら、そのプレビューの住所を使う
2. そうでなければ、`metadataBase` を使う
3. `metadataBase` がなければ、Vercel が入れた本番の住所（`VERCEL_PROJECT_PRODUCTION_URL`）を使う
4. それもなければ、`http://localhost:3000` を使う

手元には Vercel の環境変数がないので 4 に落ち、Vercel の上では 3 で拾われていた。警告は「`metadataBase` を書いていない」ことを知らせるだけで、3 で拾われるかどうかまでは見ていない。

手元で Vercel の環境変数を真似てビルドすると、この順番どおりに住所が変わる（実測）。

| ビルドした場所（真似た環境変数）                          | `metadataBase` | `og:image` の頭                               |
| --------------------------------------------------------- | -------------- | --------------------------------------------- |
| 手元（なし）                                              | なし           | `http://localhost:3000`                       |
| 本番（`VERCEL_PROJECT_PRODUCTION_URL`）                   | なし           | `https://65-blog-app.vercel.app`              |
| 手元（なし）                                              | あり           | `https://65banseki.dev`                       |
| プレビュー（`VERCEL_ENV=preview` と `VERCEL_BRANCH_URL`） | あり           | `https://65-blog-app-git-feat-1-8.vercel.app` |

**では、なぜ `metadataBase` を書くのか** — Vercel の上だけなら、書かなくても正しく動く。それでも書くのは、3 が Vercel の環境変数に頼った仕組みだからだ。手元のビルドや、Vercel 以外の場所では 4 に落ちる。このリポジトリは、原稿の読み込み処理を Next.js に依存させないなど、置き場所や道具を移せる形を選んできた。住所も同じで、Vercel が教えてくれなくても決まるように書いておく。

**この発見が今後どこに効くか** — フレームワークやホスティングには、「書かなくても、その場所でだけ動く」既定値がたくさんある。今回のように、警告や手元との違いに気づいたら、どの順番で値が決まっているかを中まで見にいく。これは sitemap や RSS で記事の絶対 URL を作るときにも、そのまま同じ問題として出てくる。

---

### 手順 7：`65banseki.dev` を Vercel につなぐ

#### 7-a：Vercel にドメインを登録する

1. Vercel のプロジェクトの Settings → Domains を開く
2. `65banseki.dev` を追加する
3. `www.65banseki.dev` も足すかを聞かれたら足し、`www.65banseki.dev` から `65banseki.dev` へ転送する形を選ぶ
4. 画面に、Cloudflare に書くべきレコードが出る。A レコードの値（数字の並び）と、CNAME レコードの値（`〜.vercel-dns〜.com` のような名前）を控える

#### 7-b：Cloudflare の DNS にレコードを書く

Cloudflare のダッシュボードで `65banseki.dev` を選び、DNS の Records の画面を開く。次の2行を足す。

| Type  | Name  | 値                              | Proxy status |
| ----- | ----- | ------------------------------- | ------------ |
| A     | `@`   | 7-a で控えた A レコードの値     | DNS only     |
| CNAME | `www` | 7-a で控えた CNAME レコードの値 | DNS only     |

Proxy status は雲のアイコンを押して灰色（DNS only）にする。オレンジのままにしない。

同じ名前（`@` や `www`）の A・AAAA・CNAME レコードがすでにあれば、Vercel の画面に「設定が正しくない」と出る原因になる。そのときは、古いほうを消す。

**`@` は何か** — ドメインそのもの（`65banseki.dev`）を指す書き方だ。`www` と書けば `www.65banseki.dev` を指す。

**なぜ DNS only にするのか** — オレンジの雲にすると、ブラウザと Vercel の間に Cloudflare の中継が挟まる。中継が増えると、Cloudflare 側に古いページが残る、Vercel のボット対策が効かなくなる、といった問題を考えることになる。Vercel もこの形を勧めている。

#### 7-c：住所録が書き換わったのを確かめる

```bash
dig +short 65banseki.dev
dig +short www.65banseki.dev
```

1行目は 7-a で控えた A レコードの値、2行目は CNAME の値（とその先の番号）が出ればよい。何も出ないときは、数分から数十分待ってやり直す。電話帳の写しは世界中に配られていて、全部が新しくなるまで時間がかかる。

Vercel の Domains の画面で、`65banseki.dev` が有効（Valid Configuration）になり、証明書が発行されるのを待つ。そのあと `https://65banseki.dev` を開き、手順 4 と同じトップページが出れば成功。

**`.dev` のドメインで知っておくこと** — `.dev` は、ブラウザが最初から「必ず https で開く」と決めているドメインだ。証明書ができる前に開くと、ページではなくブラウザのエラーが出る。証明書は Vercel が自動で作るので、待てば開ける。

---

### 手順 8：`metadataBase` を足して、手元の警告を消す

```bash
git switch -c feat/1-8-deploy
```

`app/layout.tsx` の `metadata` に1行足す。

```tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://65banseki.dev"),
  title: "Create Next App",
  description: "Generated by create next app",
};
```

手元でビルドして、警告と `og:image` を見る。

```bash
bun run build 2>&1 | grep -c metadataBase
grep -o '<meta property="og:image" [^>]*>' .next/server/app/posts/hello.html
```

```
0
<meta property="og:image" content="https://65banseki.dev/posts/hello/opengraph-image?0203e9bf893d0cb0"/>
```

1行目の `0` は、ビルドの出力に `metadataBase` という文字が1度も出なかった、つまり警告が消えたという意味だ。

**なぜ `layout.tsx` に書くのか** — `metadataBase` は書いたフォルダとその下のページすべてに効く。いちばん上の `app/layout.tsx` に書けば、サイトのどのページにも効く。

**なぜ `new URL(...)` で包むのか** — 文字列のままだと、`https:` が抜けているような書き間違いに気づけない。`new URL` は正しい URL でないとその場でエラーにするので、間違いがビルドの時点で見つかる。

コミットする。ADR とこのチケットも一緒に入れる。

```bash
bun run typecheck
bun run lint
git add app/layout.tsx docs/adr/20261103-2241-host-on-vercel.md tickets/1-8-deploy.md
git commit -m "feat: metadataBase に 65banseki.dev を書き、シェア用の画像の住所を決める"
```

---

### 手順 9：ブランチを push して、プレビューの `og:image` を見る

```bash
git push -u origin feat/1-8-deploy
```

Vercel のプロジェクトの画面に、`feat/1-8-deploy` のプレビューのデプロイが現れる。ビルドが終わったら、そのプレビューの住所をブラウザで開く。

プレビューは本番ではないので、Vercel のログインを求められる（Standard Protection）。ログインしたら、記事ページ（`/posts/hello`）を開き、ページのソースを表示して `og:image` を探す。

```
<meta property="og:image" content="https://65-blog-app-git-feat-1-8-deploy-....vercel.app/posts/hello/opengraph-image?..."/>
```

`metadataBase` に `65banseki.dev` と書いたのに、プレビューの住所になっている。手順 6 の順番の 1 番目が効いたためだ。プレビューで作った画像の住所を本番に向けてしまうと、まだ本番にない画像を指すことがある。Next.js はそれを避けて、プレビューではプレビュー自身の住所を使う。

**なぜ curl ではなくブラウザなのか** — プレビューは Vercel のログインで守られているので、ログインしていない curl ではログイン画面が返ってくる。

---

### 手順 10：`main` に取り込んで、本番に出す

```bash
git switch main
git merge --ff-only feat/1-8-deploy
git push
```

Vercel で本番のデプロイが終わるのを待ってから、本番の `og:image` を見る。

```bash
curl -s https://65banseki.dev/posts/hello | grep -o '<meta property="og:image" [^>]*>'
```

```
<meta property="og:image" content="https://65banseki.dev/posts/hello/opengraph-image?..."/>
```

画像そのものも開く。

```bash
curl -sI https://65banseki.dev/posts/hello/opengraph-image | head -5
```

1行目が `HTTP/2 200`、どこかに `content-type: image/png` があればよい。ブラウザで同じ URL を開くと、1-7 で作った画像が出る。

ビルドログに `metadataBase` の警告が出ていないことも確かめる。

---

### 手順 11：SNS のカードの見え方を確かめる

`https://65banseki.dev/posts/hello` を、次のどれかに貼る。

- 自分しかいない Slack や Discord のチャンネル
- X の投稿画面（投稿はしなくてよい。カードの下書きが出る）
- OGP の確認サービス（例: https://www.opengraph.xyz/ ）

タイトル「はじめての記事」と、1-7 で作った画像がカードに出れば完了。説明文に「Generated by create next app」が出るのは、今回は扱わないものとして想定どおり。

**カードが古いままのとき** — SNS は一度読んだカードをしばらく覚えている。URL の末尾に `?v=1` を付けて貼ると、別のページとして読み直させられる。

---

### うまくいかないとき

| 症状                                                      | 原因と対処                                                                                                               |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `fatal: Not possible to fast-forward, aborting.`          | `main` と作業ブランチの線が枝分かれしている。`git log --oneline --graph main feat/1-7-og-image` で形を見て、聞いてほしい |
| `gh repo create` で `Name already exists on this account` | 同じ名前のリポジトリが GitHub にもうある。中身を確かめ、使うなら `git remote add origin` で結びつける                    |
| Vercel のビルドで `tsrs` が見つからない、または動かない   | Linux 向けの tsrs が入っていない。ビルドログの `bun install` の部分を貼って聞いてほしい                                  |
| Vercel のビルドログの bun が 1.3 より古い                 | `minimumReleaseAge` とセキュリティスキャナーが効いていない恐れがある。版を貼って聞いてほしい                             |
| Vercel の Domains で `Invalid Configuration` のまま       | Cloudflare に同じ名前の古いレコードが残っているか、Proxy status がオレンジになっている。7-b を見直す                     |
| `https://65banseki.dev` を開くと証明書のエラーになる      | 証明書がまだできていない。Vercel の Domains の画面で状態を見て、待つ                                                     |
| `ERR_TOO_MANY_REDIRECTS`                                  | Cloudflare のプロキシが有効になっている。Proxy status を DNS only にする                                                 |
| プレビューを curl すると HTML が返らない                  | プレビューは Vercel のログインで守られている。ブラウザでログインして見る                                                 |

ここに載っていないエラーが出たら、そのまま貼って聞いてほしい。

---

## 受け入れ条件

- [ ] GitHub に `hi-lee-mon/65-blog-app` が public で作られ、`main` が `c8a873d` より先まで push されている（`git log origin/main --oneline -1` で見る）
- [ ] Vercel のビルドログで見た bun の版を、ここに書いた: `_____`
- [ ] 手順 6 で、`metadataBase` がないのに `og:image` が `https://<プロジェクト名>.vercel.app/...` になっていることを自分で確かめた
- [ ] `dig +short 65banseki.dev` が Vercel の画面に出た A レコードの値を返す
- [ ] Cloudflare の DNS の2行が、どちらも DNS only（灰色の雲）になっている
- [ ] 手元の `bun run build` で `metadataBase` の警告が出ない
- [ ] 手順 9 で、プレビューの `og:image` がプレビューの住所になっていることを自分で確かめた
- [ ] `curl -s https://65banseki.dev/posts/hello` の `og:image` が `https://65banseki.dev/posts/hello/opengraph-image?...` になっている
- [ ] SNS か確認サービスで、記事のタイトルと画像が載ったカードを自分の目で見た
- [ ] `bun run typecheck` と `bun run lint` がエラーなしで終わる

## この回で理解したこと

着手後に埋める。動いたか（受け入れ条件）とは別に、何が分かったかを残す。

- [ ] ブラウザが `65banseki.dev` を開くまでに、Cloudflare と Vercel がそれぞれ何をしているかを説明できる
- [ ] `metadataBase` がないとき、Next.js がシェア用の画像の住所をどの順番で決めているかを説明できる
- [ ] Vercel の上では書かなくても動く `metadataBase` を、それでも書いた理由を説明できる
- [ ] プレビューの `og:image` が `metadataBase` を無視してプレビューの住所になる理由を説明できる
- [ ] push の前に履歴全体を検査した理由と、その検査では見つからないものを説明できる

## 参考

- ADR: `docs/adr/20261103-2241-host-on-vercel.md`
- `metadataBase`: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`
- 住所を決める処理: `node_modules/next/dist/lib/metadata/resolvers/resolve-url.js`
- Vercel のパッケージマネージャーの扱い: https://vercel.com/docs/package-managers
- Vercel のドメインの追加: https://vercel.com/docs/domains/working-with-domains/add-a-domain
- Vercel の環境変数: https://vercel.com/docs/environment-variables/system-environment-variables
- Vercel のデプロイの保護: https://vercel.com/docs/deployment-protection
- Cloudflare を Vercel の前に置く場合: https://vercel.com/kb/guide/can-i-use-a-proxy-on-top-of-my-vercel-deployment
- 前の回: `tickets/1-7-og-image.md`
