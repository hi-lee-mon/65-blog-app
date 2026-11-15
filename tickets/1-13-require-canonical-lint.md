# 1-13: `canonical` と `og:url` の書き忘れを、自作の oxlint ルールでコミット前に止める

- 起票日: 2026-11-06（同日に確認事項を決め、TypeScript で書く形と `og:url` のルールを足した）
- 学習計画: まだない（設計の全体像は `docs/design/20260925-blog-design-proposal.md` の「`canonical` の書き忘れを、自作の lint ルールで見つける」）
- ステータス: 未着手

## 全体のどこか

「記事を表示する」段の13段目にあたる。1-11 で、`canonical`（このページの正式な住所）と `og:url`（SNS でシェアされたときの住所）をページごとに書く形にした。ただ、ページを足したときに書き忘れても、ビルドも型検査も通ってしまう。この回で、書き忘れを lint で見つけるルールを自分で作る。

| Step | 内容                                                             | 進捗         |
| ---- | ---------------------------------------------------------------- | ------------ |
| 1-1  | 記事1本を `/posts/[slug]` に表示する                             | ■■■ 完了     |
| 1-2  | `/posts` に記事の一覧を出す                                      | ■■■ 完了     |
| 1-3  | Shiki でコードブロックに色を付ける                               | ■■■ 完了     |
| 1-4  | Valibot で frontmatter の中身を検査し、`as` を取り除く           | ■■■ 完了     |
| 1-5  | タグを付け、`/tags` と `/tags/[tag]` を作る                      | ■■■ 完了     |
| 1-6  | 見出しから目次を作る                                             | ■■■ 完了     |
| 1-7  | 記事ごとにシェア用の画像を作る                                   | ■■■ 完了     |
| 1-8  | Vercel で公開し、ドメインをつなぐ                                | ■■□ 確認待ち |
| 1-9  | サイト全体の名札を整える                                         | ■■■ 完了     |
| 1-10 | アクセス解析を入れる                                             | ■■■ 完了     |
| 1-11 | 正式な住所を1つに決める                                          | ■■□ 確認待ち |
| 1-12 | Umami Cloud を足し、独自のイベントを数える                       | ■■□ 確認待ち |
| 1-13 | `canonical` と `og:url` の書き忘れを自作の lint ルールで見つける | □□□ ← つぎ   |
| 1-14 | Umami の数字を Grafana でグラフにする（後回しにした）            | □□□          |

作業ブランチは作らず、`dev` に直接コミットする。

## 作るもの

| 場所（リポジトリ直下から）                                      | 中身                                                                                                 |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `oxlint-plugins/nextjs-metadata.mts`（新規）                    | 自作の oxlint プラグイン。TypeScript で書き、ルール `require-canonical` と `require-og-url` を持つ   |
| `.oxlintrc.json`                                                | プラグインを読み込み、`app/**/page.tsx` にだけ2つのルールを効かせる                                  |
| `package.json`・`bun.lock`                                      | 型のためのパッケージ `@oxlint/plugins` を `devDependencies` に足す                                   |
| `docs/adr/20261106-1800-require-canonical-lint-rule.md`（新規） | 自作ルールで書き忘れを止めると決めた理由、JS プラグインがまだ試験段階（alpha）であること、足した依存 |

ページのコード（`app/**/page.tsx`）は変えない。今のページはすべて `canonical` と `og:url` を書いてあるので、ルールを足してもエラーは出ないはずだ。

今回は扱わないもの: ルールの自動テスト（`RuleTester`）、npm へのプラグインの公開、`layout.tsx` や `opengraph-image.tsx` の検査。

## なぜこれをやるか

`canonical` を書き忘れても、ページは普通に表示される。困るのは検索エンジンで、同じ記事が `www.65banseki.dev` と `65-blog-app.vercel.app` の2か所にあるように見えてしまう。1-11 で転送を入れたので実害は小さいが、Zenn・Qiita に同じ記事を配る予定（ADR `20260925-1714-cross-post-articles.md`）があり、正本がどれかを示す `canonical` はこのサイトでは大事な札になる。`og:url` を書き忘れると、シェアされたときの住所がページごとにそろわなくなる。

人の注意だけに頼ると、いつか忘れる。lint に覚えさせておけば、lefthook がコミットの前に止めてくれる。

もう1つの狙いは**lint の中身を知ること**にある。ここまで oxlint は「設定を書けば動く道具」だった。自分でルールを書くと、lint がコードを木の形に分解し、その枝を1本ずつ見て回っていることが分かる。この見方は Babel や unified（記事の読み込みで使っている）のプラグインにもそのまま通じる。

## 周辺知識

### oxlint の JS プラグイン（出典: https://oxc.rs/docs/guide/usage/linter/js-plugins.html 、https://oxc.rs/docs/guide/usage/linter/writing-js-plugins.html 、2026-11-06 に確認）

- 状態は alpha（試験段階）。「活発に開発中」と書かれている
- `.oxlintrc.json` の `jsPlugins` にファイルの場所を書き、`rules` で `"プラグイン名/ルール名": "error"` と有効にする。場所は設定ファイルから見た相対パス
- ルールの形は ESLint と同じで、`create(context)` が「見たい枝の種類 → 呼ばれる関数」の対応表を返す
- 見つけたら `context.report({ message, node })` で報告する
- ESLint と動きが違えば、それは oxlint のバグとして扱う方針
- できないこと: 型の情報を使うルール、Vue や Svelte のような独自のファイル形式
- ルールを試す道具 `RuleTester` が `oxlint/plugins-dev` にある（今回は使わない）

### `@oxlint/plugins`（npm と、入れたパッケージの中身で確認。2026-11-06）

- oxlint の JS プラグインを書くための型と関数のパッケージ。版番号は oxlint と同じものが出ている
- 1.90.0 の公開は 2026-10-27。依存パッケージなし、インストール時スクリプトなし、MIT
- `Plugin`・`Rule`・`ESTree`（木の枝の型）などの型を `export` している。`definePlugin` と `defineRule` という関数もあるが、型を付けるためだけの、何もしない関数
- この回では `import type` で型だけを読む。実行時には消えるので、oxlint がこのパッケージを読み込むことはない

### 実測したこと

2026-11-06、macOS / Node v26.13.0 / bun 1.4.4 / oxlint 1.90.0 / `@oxlint/plugins` 1.90.0 で、`dev` の `605f15c` を一時ディレクトリに複製して確かめた。

- oxlint の実行ファイルは `#!/usr/bin/env node` で、プラグインは Node が読み込む
- プラグインを `.ts` で書いても動く。Node が型を外して実行する（type stripping）。ただし `.ts` と `.js` では毎回 `[MODULE_TYPELESS_PACKAGE_JSON] Warning` が出る。`.mts` にすると出ない
- `.mts` のプラグインは `tsconfig.json` の `include`（`**/*.mts`）に入っていて、`bun run typecheck` で型検査される
- `node.id.name` を `node.id.nmae` と打ち間違えると、型検査が `Property 'nmae' does not exist on type 'BindingIdentifier'.` で止まる
- `property.key.name` は、`property.key.type === "Identifier"` で確かめる前に書くと型エラーになる
- 型エラーがあっても `bun run oxlint` は動く。型検査と lint は別の検査になっている
- `overrides` の `files: ["app/**/page.tsx"]` で、ルールを `page.tsx` だけに効かせられる。`app/page.tsx`（直下）にも当たる
- プラグイン名にハイフンが入っていても（`nextjs-metadata`）動く
- 完成形では、今の5つの `page.tsx` でエラーが出ない
- `canonical` を消す、`og:url` を消す、`metadata` のないページを足す、のどれでもエラーになる
- `export const metadata = { ... } satisfies Metadata` と書くと、`canonical` と `og:url` があってもエラーになる（ルールの限界。手順 9 で扱う）
- `/* oxlint-disable ルール名, ルール名 -- 理由 */` をファイルの先頭に書くと、そのページだけ止められる
- `bun run oxlint app/page.tsx` のようにファイルを指定しても（lefthook と同じ渡し方）、ルールが効く
- 完成形で `bun run lint`・`bun run typecheck`・`oxfmt --check` が通る
- oxlint の出力の見た目は、端末によって変わる。この回の出力例は1行ずつ出る形で写している

**未確認**: lefthook がコミットを実際に止める場面（一時ディレクトリでは lefthook を入れていない）。oxc の Playground の画面の項目名。

### 現時点のバージョン（2026-11-06 確認）

| パッケージ        | リポジトリの版 | npm の最新 |
| ----------------- | -------------- | ---------- |
| oxlint            | 1.90.0         | 1.91.0     |
| `@oxlint/plugins` | （新しく足す） | 1.91.0     |

oxlint はこの回では上げない。`@oxlint/plugins` は oxlint にそろえて 1.90.0 を入れる。

## 作業手順（全体の地図）

1. `dev` を最新にする
2. 型のためのパッケージ `@oxlint/plugins` を入れる
3. Playground でコードの木（AST）を眺める
4. 全ファイルに「見ました」と報告するだけのルールを作り、`page.tsx` に絞る
5. `export const metadata` の中の `canonical` を調べる（**この回の本題**）
6. `generateMetadata` が返すものの中の `canonical` を調べる
7. どちらもないページを見つける
8. 同じ作りで `og:url` のルールを足す
9. わざと壊して、ルールの限界を見る
10. 例外の付け方を知る
11. ADR を書く
12. コミットして、lefthook が通るのを見る

## 確認事項

- [x] **プラグインの置き場所とファイル形式。** 本人の希望で「`oxlint-plugins/nextjs-metadata.mts` に TypeScript で書き、型のために `@oxlint/plugins` を `devDependencies` に足す」に決めた。理由は書き間違いを型検査で見つけられるから。`.mts` にしたのは、`.ts` だと Node が毎回警告を出すため（実測）。ただし、依存が1つ増える。また、Node が型を外して実行する機能（v22.18 以降は標準で有効）に頼るので、それより古い Node では動かない
- [x] **プラグイン名とルール名。** 本人の希望で「`nextjs-metadata/require-canonical`」に決めた。理由は Next.js の `metadata` を検査するプラグインだと名前から分かり、`require-og-url` を足しても自然だから。ESLint の世界では「〜を必ず書く」ルールに `require-` を付ける慣習がある。ただし名前が長く、oxlint に最初からある `nextjs` プラグインと紛らわしい
- [x] **ルールを効かせる範囲の決め方。** 推奨案「`.oxlintrc.json` の `overrides` で `app/**/page.tsx` に絞る」に決めた。理由はどこに効くかが設定ファイルを見れば分かるから。ただし、ルールのファイルだけを読んでも範囲は分からない。`page.tsx` を `app/` の外に置く構成（`src/app/`）に変えたら、ここも直す必要がある
- [x] **`generateMetadata` をどう判定するか。** 推奨案「`return` のどれか1つが必要な項目を含めばよい」に決めた。理由は `/posts/[slug]` に記事が見つからないときの `return {};` があり、すべての `return` に求めるとエラーになるから。ただし、分かれ道が増えて、ある道だけ書き忘れた場合は見逃す
- [x] **`metadata` も `generateMetadata` もないページ。** 推奨案「エラーにする」に決めた。理由は新しいページを足したときに一番起きやすいのが「名札ごと書き忘れる」ことだから。ただし、展示室（`/lab`）などで、わざと書かないページには、そのたびに無効にするコメントが要る。2つのルールがそれぞれ報告するので、1ページで2行のエラーになる
- [x] **`og:url` も見るか。** 本人の希望で「この回で `require-og-url` も作る」に決めた。`canonical` のルールを、項目の名前を差し替えられる形に作り直して使い回す（手順 8）。ただし、そのぶん回が長くなる
- [x] **対応しない書き方。** 推奨案「`satisfies Metadata`、アロー関数の `generateMetadata`、ほかのファイルからの `export { metadata }` には対応しない」に決めた。理由は今のリポジトリにどれもなく、対応するとルールが長くなって本題が見えにくくなるから。ただし、書き方を変えると、項目があってもエラーになる（`satisfies` は実測）
- [x] **重さ。** 推奨案「`error`」に決めた。理由は lefthook の oxlint がエラーで止まり、書き忘れたままコミットできなくなるから。ただし、oxlint を上げたときに alpha の JS プラグインが壊れると、関係ないコミットまで止まる。そのときは一時的に `warn` に下げる
- [x] **alpha の機能を使うか。** 推奨案「使う」に決めた。理由は学習のためのリポジトリで、壊れても影響が自分にしかないから。依存は版を固定しているので、勝手に壊れることはない。ただし、oxlint を上げるたびに、このルールが動くかを確かめる手間が増える
- [x] **【標準ルールからの逸脱】TDD を適用せず、ルールの自動テストも書かない。** 本人の判断（2026-11-03）による。lint のルールは本来 `RuleTester` でテストしやすい部類だが、テストランナーがまだ入っていない。この回はページをわざと壊して `bun run oxlint` の出力を見ることで確かめる。Vitest を入れる回で、`RuleTester` を試す題材にできる

## ハンズオン

ここに出てくるコマンドの出力は、一時ディレクトリに複製したリポジトリで実際に動かして写したもの（2026-11-06、Node v26.13.0 / bun 1.4.4 / oxlint 1.90.0 / `@oxlint/plugins` 1.90.0）。lefthook の動きと Playground の画面は確かめていない。

---

### 準備：この回で何をするのか

oxlint に「`page.tsx` を見たら、`canonical` が書いてあるか確かめて」と教える。教え方は小さな TypeScript のファイル（プラグイン）を1つ書いて、`.oxlintrc.json` から読み込ませるだけだ。最初は「ファイルを見ました」と言うだけのルールから始め、`metadata` の形、`generateMetadata` の形、どちらもない形、と1つずつ見分けられるようにしていく。最後に、同じ作りを使い回して `og:url` のルールも足す。

#### AST は「文の図解」

国語の授業で、文を「主語」「述語」「修飾語」に分けて線でつないだことがあると思う。lint も同じことをコードに対してする。`export const metadata = { alternates: { canonical: "/" } }` を、「書き出し（export）の中に、変数の宣言があり、その中に名前 `metadata` と中身のオブジェクトがあり……」と木の形に分解する。この木を AST（抽象構文木）と呼ぶ。

ルールはこの木の枝を1本ずつ見て回る係だ。「変数の宣言の枝に来たら教えて」と頼んでおくと、その枝に来るたびに呼ばれる。

#### 用意するもの

- 1-12 までをコミットした状態のリポジトリ（`dev`）
- ブラウザ（手順 3 で Playground を開く）

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

### 手順 2：型のためのパッケージ `@oxlint/plugins` を入れる

```bash
bun add -d --exact @oxlint/plugins@1.90.0
```

```
installed @oxlint/plugins@1.90.0

1 package installed [789.00ms]
```

かかった時間の数字は毎回変わる。

```bash
grep oxlint package.json
```

```
    "lint": "oxlint && bun run lint:markup",
    "@oxlint/plugins": "1.90.0",
    "oxlint": "1.90.0",
```

1行目は `scripts` の行で、`oxlint` という文字に当たっただけだ。2行目に `^` の付かない `"1.90.0"` があればよい。

**なぜ版を指定するのか** — このリポジトリでは依存の版を固定する決まりがある（ADR `20261103-1657-supply-chain-hardening.md`）。`--exact` を付けると、`package.json` に `^` が付かない。版を oxlint と同じ 1.90.0 にそろえるのは、型が oxlint の実際の動きと食い違わないようにするためだ。

**このパッケージは何をするのか** — プラグインを書くための「型の辞書」だ。木の枝にどんな種類があり、それぞれにどんな項目があるかが書いてある。この辞書があると、`node.id.name` のような書き間違いを型検査が見つけてくれる。実際に oxlint を動かすときには使わない。

---

### 手順 3：Playground でコードの木（AST）を眺める

1. https://playground.oxc.rs を開く
2. 左の入力欄に、次の3行を貼る

   ```tsx
   export const metadata = {
     alternates: { canonical: "/" },
   };
   ```

3. AST を表示する切り替え（AST や ESTree と書かれたもの）を選ぶ

画面の項目名は確かめていない。見当たらなければ、表示の切り替えを順に試す。

木の中に、次の名前が上から入れ子で並んでいるのを探す。

```
ExportNamedDeclaration        ← export の枝
└ VariableDeclaration         ← const の枝
  └ VariableDeclarator        ← 「metadata = { ... }」の枝
    ├ id: Identifier          ← name: "metadata"
    └ init: ObjectExpression  ← { ... } の中身
      └ Property              ← key は Identifier、name: "alternates"
        └ value: ObjectExpression
          └ Property          ← key は Identifier、name: "canonical"
```

**なぜ先に眺めるのか** — ルールの中で書く `"VariableDeclarator"` や `node.id.name` は、すべてこの木の名前だ。先に木を見ておけば、手順 5 のコードが「この枝に来たら、この名前を見る」と読めるようになる。分からなくなったら、ここに戻って木を見る。

---

### 手順 4：全ファイルに「見ました」と報告するだけのルールを作り、`page.tsx` に絞る

#### 4-a：最小のプラグインを作る

`oxlint-plugins/nextjs-metadata.mts` を新しく作る。

```ts
import type { Plugin, Rule } from "@oxlint/plugins";

const requireCanonical: Rule = {
  create(context) {
    return {
      Program(node) {
        context.report({ message: `見ているファイル: ${context.filename}`, node });
      },
    };
  },
};

export default {
  meta: { name: "nextjs-metadata" },
  rules: { "require-canonical": requireCanonical },
} satisfies Plugin;
```

`.oxlintrc.json` に、プラグインの場所と、ルールを有効にする1行を足す。

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "unicorn", "oxc", "react", "nextjs", "jsx-a11y", "import"],
  "categories": {
    "correctness": "error"
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "nextjs-metadata/require-canonical": "error"
  },
  "ignorePatterns": [".next/**", "out/**", "build/**", "next-env.d.ts"],
  "jsPlugins": ["./oxlint-plugins/nextjs-metadata.mts"]
}
```

動かす。

```bash
bun run oxlint
```

```
postcss.config.mjs:1:1: error nextjs-metadata(require-canonical): 見ているファイル: ~/ghq/github.com/hi-lee-mon/65-blog-app/postcss.config.mjs
app/_types/umami.d.ts:1:1: error nextjs-metadata(require-canonical): 見ているファイル: ~/ghq/github.com/hi-lee-mon/65-blog-app/app/_types/umami.d.ts
lib/siteMetadata.ts:1:1: error nextjs-metadata(require-canonical): 見ているファイル: ~/ghq/github.com/hi-lee-mon/65-blog-app/lib/siteMetadata.ts
oxlint-plugins/nextjs-metadata.mts:1:1: error nextjs-metadata(require-canonical): 見ているファイル: ~/ghq/github.com/hi-lee-mon/65-blog-app/oxlint-plugins/nextjs-metadata.mts
（略。全部で16ファイル）
error: "oxlint" exited with code 1
```

実際の出力では `~` のところに自分のホームディレクトリの絶対パスが出る。並び順は実行のたびに変わる。

**何が起きたのか** — `create` が返したのは「`Program` の枝に来たら、この関数を呼んで」という対応表だ。`Program` は木のいちばん根元で、1ファイルに1つある。だから、oxlint が見るすべてのファイルで1回ずつ報告された。自分の書いたプラグインのファイルまで見ているのが分かる。

**`import type` と `satisfies Plugin` は何をしているのか** — `import type` は「型だけを借りる」という書き方で、実行するときには行ごと消える。`satisfies Plugin` は「この形が `Plugin` の決まりに合っているか確かめて」と型検査に頼む書き方だ。`meta` を書き忘れたり、`rules` の中身がルールの形でなかったりすると、`bun run typecheck` が教えてくれる。

**なぜ `.mts` なのか** — oxlint は、プラグインを Node に読み込ませる。最近の Node は、TypeScript のファイルから型の部分を外して、そのまま実行できる。ただ、このリポジトリの `package.json` には `"type": "module"` がないので、`.ts` に `import` を書くと、Node は「古い形式（CommonJS）かと思ったら新しい形式（ES Modules）だった」と読み直し、毎回警告を出す。`.mts` は「このファイルは新しい形式」と拡張子で宣言する書き方で、警告が出なくなる。

#### 4-b：`page.tsx` だけに絞る

`.oxlintrc.json` の `rules` から `"nextjs-metadata/require-canonical": "error"` を消し、代わりに `overrides` を足す。

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "unicorn", "oxc", "react", "nextjs", "jsx-a11y", "import"],
  "categories": {
    "correctness": "error"
  },
  "rules": {
    "react/rules-of-hooks": "error"
  },
  "ignorePatterns": [".next/**", "out/**", "build/**", "next-env.d.ts"],
  "jsPlugins": ["./oxlint-plugins/nextjs-metadata.mts"],
  "overrides": [
    {
      "files": ["app/**/page.tsx"],
      "rules": {
        "nextjs-metadata/require-canonical": "error"
      }
    }
  ]
}
```

```bash
bun run oxlint
```

```
app/posts/page.tsx:1:1: error nextjs-metadata(require-canonical): 見ているファイル: ~/ghq/github.com/hi-lee-mon/65-blog-app/app/posts/page.tsx
app/tags/page.tsx:1:1: error nextjs-metadata(require-canonical): 見ているファイル: ~/ghq/github.com/hi-lee-mon/65-blog-app/app/tags/page.tsx
app/page.tsx:1:1: error nextjs-metadata(require-canonical): 見ているファイル: ~/ghq/github.com/hi-lee-mon/65-blog-app/app/page.tsx
app/tags/[tag]/page.tsx:1:1: error nextjs-metadata(require-canonical): 見ているファイル: ~/ghq/github.com/hi-lee-mon/65-blog-app/app/tags/[tag]/page.tsx
app/posts/[slug]/page.tsx:1:1: error nextjs-metadata(require-canonical): 見ているファイル: ~/ghq/github.com/hi-lee-mon/65-blog-app/app/posts/[slug]/page.tsx
error: "oxlint" exited with code 1
```

**5ファイルに減った。** `overrides` は「このファイルたちにだけ、この設定を上乗せする」という書き方だ。`app/**/page.tsx` の `**` は「間に何階層あってもよい」という意味で、直下の `app/page.tsx` にも当たる。

**なぜルールの中で絞らないのか** — `context.filename` を見て `page.tsx` で終わるかを調べることもできる。設定で絞っておくと、どのファイルに効くかが `.oxlintrc.json` を見るだけで分かる。ルールは「`canonical` があるか」だけに集中できる。

---

### 手順 5：`export const metadata` の中の `canonical` を調べる（この回の本題）

#### 5-a：木をたどるコードを書き、型検査に止められる

`oxlint-plugins/nextjs-metadata.mts` を書き換える。手順 3 で見た木を、上からたどるコードになる。

```ts
import type { ESTree, Plugin, Rule } from "@oxlint/plugins";

// オブジェクトの中に `alternates: { canonical: ... }` があるかを調べる
function hasCanonical(objectNode: ESTree.ObjectExpression): boolean {
  return objectNode.properties.some(
    (property) =>
      property.type === "Property" &&
      property.key.name === "alternates" &&
      property.value.type === "ObjectExpression" &&
      property.value.properties.some(
        (inner) => inner.type === "Property" && inner.key.name === "canonical",
      ),
  );
}

const requireCanonical: Rule = {
  create(context) {
    return {
      // export const metadata = { ... }
      "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator"(
        node: ESTree.VariableDeclarator,
      ) {
        if (node.id.type !== "Identifier" || node.id.name !== "metadata") return;
        if (node.init?.type === "ObjectExpression" && hasCanonical(node.init)) return;
        context.report({ message: "metadata に alternates.canonical がありません", node });
      },
    };
  },
};

export default {
  meta: { name: "nextjs-metadata" },
  rules: { "require-canonical": requireCanonical },
} satisfies Plugin;
```

型検査をする。

```bash
bun run typecheck
```

```
oxlint-plugins/nextjs-metadata.mts(8,20): error TS2339: Property 'name' does not exist on type 'PropertyKey$1'.
  Property 'name' does not exist on type 'ArrayExpression'.
oxlint-plugins/nextjs-metadata.mts(11,59): error TS2339: Property 'name' does not exist on type 'PropertyKey$1'.
  Property 'name' does not exist on type 'ArrayExpression'.
```

**なぜ止められたのか** — オブジェクトの項目の名前（キー）は、いつも `alternates` のような素の名前とは限らない。`{ "alternates": ... }` と文字列で書くこともできるし、`{ [someKey]: ... }` と式で書くこともできる。型の辞書には「キーは名前かもしれないし、文字列かもしれないし、式かもしれない」と書いてある。式の枝（`ArrayExpression` など）には `name` がないので、「`name` があるとは限らない」と止められた。

ここで、型エラーがあるまま lint を動かしてみる。

```bash
bun run oxlint
echo $?
```

```
0
```

**lint は動いてしまう。** Node は型を外して実行するだけで、型が正しいかどうかは見ない。型の誤りを見つけるのは `bun run typecheck` の仕事で、lint とは別の検査だ。lefthook が両方を走らせているのは、このためでもある。

#### 5-b：キーが名前であることを先に確かめる

`hasCanonical` を書き換える（ほかはそのまま）。

```ts
// オブジェクトの中に `alternates: { canonical: ... }` があるかを調べる
function hasCanonical(objectNode: ESTree.ObjectExpression): boolean {
  return objectNode.properties.some(
    (property) =>
      property.type === "Property" &&
      property.key.type === "Identifier" &&
      property.key.name === "alternates" &&
      property.value.type === "ObjectExpression" &&
      property.value.properties.some(
        (inner) =>
          inner.type === "Property" &&
          inner.key.type === "Identifier" &&
          inner.key.name === "canonical",
      ),
  );
}
```

```bash
bun run typecheck
bun run oxlint
echo $?
```

```
$ next typegen && tsrs --noEmit
Generating route types...
✓ Types generated successfully
0
```

型検査が通り、lint も何も出さずに終了コード（0 なら成功、それ以外なら失敗を表す数字）`0` で終わる。今のページはすべて `canonical` を書いてあるからだ。

**`key.type === "Identifier"` で何が変わったのか** — 「キーが素の名前のときだけ」と先に確かめたので、TypeScript はその先で `key` を名前の枝として扱う。名前の枝には必ず `name` があるので、エラーが消えた。`node.id.type !== "Identifier"` も同じ理由で書いている。`const { a } = ...` のように、変数の宣言でも左側が名前とは限らない。

#### 5-c：わざと書き忘れる

`app/page.tsx` の `alternates: { canonical: "/" },` の行を消して保存し、もう一度動かす。

```bash
bun run oxlint
```

```
app/page.tsx:5:14: error nextjs-metadata(require-canonical): metadata に alternates.canonical がありません
error: "oxlint" exited with code 1
```

**`5:14` は5行目の14文字目**で、`metadata = { ... }` の始まりを指している。報告するときに `node` を渡したので、その枝の場所が出る。

確かめたら元に戻す。

```bash
git restore app/page.tsx
```

**`"A > B > C"` は何か** — 「A の直下の B の直下の C」という指定で、CSS の子セレクタと同じ書き方だ。`VariableDeclarator` だけを指定すると、関数の中の `const x = 1` のような、書き出していない変数にも反応してしまう。`export` の直下に限ることで、Next.js が読みに来る `metadata` だけを見られる。

**`hasCanonical` がしていること** — 手順 3 の木の下半分をそのままたどっている。オブジェクトの項目（`properties`）の中から、名前が `alternates` で中身もオブジェクトのものを探し、さらにその中に `canonical` があるかを見る。`some` は「1つでも当てはまれば `true`」を返す配列の関数だ。

**ここで分かったこと** — lint のルールは、コードを文字として読んでいるのではない。木の枝の種類と名前を見ている。この見方は次の場面でも同じように使える。

- 記事の読み込みで使っている unified のプラグイン（`rehype-slug` など）も、記事を木にして枝を見て回っている
- Babel や React Compiler がコードを書き換えるときも、同じように木をたどっている
- 「コードの中の〇〇を全部探したい」とき、文字の検索（grep）ではなく木で探す道具（ast-grep など）を選べるようになる

---

### 手順 6：`generateMetadata` が返すものの中の `canonical` を調べる

`/posts` や `/tags/[tag]` は、`export const metadata` ではなく `export async function generateMetadata()` で名札を作っている。今のルールはこれを見ていない。試しに `app/tags/page.tsx` の `alternates: { canonical: "/tags" },` の行を消して動かすと、何も出ない（終了コードも `0`）。確かめたら `git restore app/tags/page.tsx` で戻す。

`requireCanonical` を書き換える（`hasCanonical` と `export default` はそのまま）。

```ts
const requireCanonical: Rule = {
  create(context) {
    // generateMetadata の中にいる間だけ true
    let insideGenerateMetadata = false;
    let canonicalReturned = false;

    return {
      // export const metadata = { ... }
      "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator"(
        node: ESTree.VariableDeclarator,
      ) {
        if (node.id.type !== "Identifier" || node.id.name !== "metadata") return;
        if (node.init?.type === "ObjectExpression" && hasCanonical(node.init)) return;
        context.report({ message: "metadata に alternates.canonical がありません", node });
      },

      // export async function generateMetadata() { return { ... } }
      "ExportNamedDeclaration > FunctionDeclaration"(node: ESTree.Function) {
        if (node.id?.name !== "generateMetadata") return;
        insideGenerateMetadata = true;
        canonicalReturned = false;
      },

      ReturnStatement(node) {
        if (!insideGenerateMetadata) return;
        if (node.argument?.type === "ObjectExpression" && hasCanonical(node.argument)) {
          canonicalReturned = true;
        }
      },

      "ExportNamedDeclaration > FunctionDeclaration:exit"(node: ESTree.Function) {
        if (node.id?.name !== "generateMetadata") return;
        insideGenerateMetadata = false;
        if (canonicalReturned) return;
        context.report({
          message: "generateMetadata が alternates.canonical を返していません",
          node: node.id,
        });
      },
    };
  },
};
```

もう一度 `app/tags/page.tsx` の `canonical` の行を消して動かす。

```bash
bun run oxlint
```

```
app/tags/page.tsx:9:23: error nextjs-metadata(require-canonical): generateMetadata が alternates.canonical を返していません
error: "oxlint" exited with code 1
```

`9:23` は関数名 `generateMetadata` の位置だ。`node: node.id` と、関数全体ではなく名前の枝を渡したので、名前のところを指す。確かめたら `git restore app/tags/page.tsx` で戻す。

**`:exit` は何か** — oxlint は木を上から下へたどり、枝の先まで行ったら戻ってくる。`:exit` を付けると「その枝から戻ってくるとき」に呼ばれる。部屋に入るときに「ここは `generateMetadata` の部屋」と札を立て（`insideGenerateMetadata = true`）、中で `return` を見つけるたびに調べ、部屋を出るときに「`canonical` を返す `return` はあったか」をまとめて判定する。中を全部見終わってからでないと「1つもなかった」とは言えないので、出るときに判定する。

**なぜ「どれか1つの `return`」なのか** — `app/posts/[slug]/page.tsx` の `generateMetadata` には、記事が見つからないときの `if (!post) return {};` がある。すべての `return` に `canonical` を求めると、ここでエラーになる。確認事項に書いたとおり、ある分かれ道だけ書き忘れた場合は見逃す。

---

### 手順 7：どちらもないページを見つける

新しいページを足して、名札そのものを書き忘れた場合を試す。

```bash
mkdir -p app/about
```

`app/about/page.tsx` を作る。

```tsx
export default function Page() {
  return <main>about</main>;
}
```

```bash
bun run oxlint
echo $?
```

```
0
```

**見逃した。** 今のルールは「`metadata` があったら中を調べる」だけで、`metadata` がないときは何も言わない。

`requireCanonical` を書き換える。`metadataFound` を足し、`metadata` か `generateMetadata` を見つけたら `true` にする。ファイルを見終わったとき（`Program:exit`）に `false` のままなら報告する。

```ts
const requireCanonical: Rule = {
  create(context) {
    let metadataFound = false;
    // generateMetadata の中にいる間だけ true
    let insideGenerateMetadata = false;
    let canonicalReturned = false;

    return {
      // export const metadata = { ... }
      "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator"(
        node: ESTree.VariableDeclarator,
      ) {
        if (node.id.type !== "Identifier" || node.id.name !== "metadata") return;
        metadataFound = true;
        if (node.init?.type === "ObjectExpression" && hasCanonical(node.init)) return;
        context.report({ message: "metadata に alternates.canonical がありません", node });
      },

      // export async function generateMetadata() { return { ... } }
      "ExportNamedDeclaration > FunctionDeclaration"(node: ESTree.Function) {
        if (node.id?.name !== "generateMetadata") return;
        metadataFound = true;
        insideGenerateMetadata = true;
        canonicalReturned = false;
      },

      ReturnStatement(node) {
        if (!insideGenerateMetadata) return;
        if (node.argument?.type === "ObjectExpression" && hasCanonical(node.argument)) {
          canonicalReturned = true;
        }
      },

      "ExportNamedDeclaration > FunctionDeclaration:exit"(node: ESTree.Function) {
        if (node.id?.name !== "generateMetadata") return;
        insideGenerateMetadata = false;
        if (canonicalReturned) return;
        context.report({
          message: "generateMetadata が alternates.canonical を返していません",
          node: node.id,
        });
      },

      "Program:exit"(node) {
        if (metadataFound) return;
        context.report({ message: "metadata も generateMetadata もありません", node });
      },
    };
  },
};
```

```bash
bun run oxlint
```

```
app/about/page.tsx:1:1: error nextjs-metadata(require-canonical): metadata も generateMetadata もありません
error: "oxlint" exited with code 1
```

**なぜ `create` の中に変数を置くのか** — `create` は1ファイルごとに1回呼ばれる。中に置いた `metadataFound` はファイルごとに新しく `false` から始まる。`create` の外に置くと、前のファイルで見つけた `true` が次のファイルに持ち越され、見逃しが起きる。

確かめたら、`app/about` は手順 10 で使うので、まだ消さない。

---

### 手順 8：同じ作りで `og:url` のルールを足す

`og:url` は、`metadata` の中では `openGraph: { url: ... }` と書く。調べ方は `canonical` とまったく同じで、違うのは項目の名前だけだ。そこで、名前を引数で受け取ってルールを作る関数に作り直す。

#### 完成形

`oxlint-plugins/nextjs-metadata.mts` の全文。途中で迷ったら、これに置き換える。

```ts
import type { ESTree, Plugin, Rule } from "@oxlint/plugins";

// オブジェクトの中に `outer: { inner: ... }` があるかを調べる
function hasNestedKey(objectNode: ESTree.ObjectExpression, outer: string, inner: string): boolean {
  return objectNode.properties.some(
    (property) =>
      property.type === "Property" &&
      property.key.type === "Identifier" &&
      property.key.name === outer &&
      property.value.type === "ObjectExpression" &&
      property.value.properties.some(
        (child) =>
          child.type === "Property" && child.key.type === "Identifier" && child.key.name === inner,
      ),
  );
}

// metadata か generateMetadata に `outer.inner` を書いているかを確かめるルールを作る
function createRequireRule(outer: string, inner: string): Rule {
  const keyPath = `${outer}.${inner}`;

  return {
    create(context) {
      let metadataFound = false;
      // generateMetadata の中にいる間だけ true
      let insideGenerateMetadata = false;
      let keyReturned = false;

      return {
        // export const metadata = { ... }
        "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator"(
          node: ESTree.VariableDeclarator,
        ) {
          if (node.id.type !== "Identifier" || node.id.name !== "metadata") return;
          metadataFound = true;
          if (node.init?.type === "ObjectExpression" && hasNestedKey(node.init, outer, inner)) {
            return;
          }
          context.report({ message: `metadata に ${keyPath} がありません`, node });
        },

        // export async function generateMetadata() { return { ... } }
        "ExportNamedDeclaration > FunctionDeclaration"(node: ESTree.Function) {
          if (node.id?.name !== "generateMetadata") return;
          metadataFound = true;
          insideGenerateMetadata = true;
          keyReturned = false;
        },

        ReturnStatement(node) {
          if (!insideGenerateMetadata) return;
          if (
            node.argument?.type === "ObjectExpression" &&
            hasNestedKey(node.argument, outer, inner)
          ) {
            keyReturned = true;
          }
        },

        "ExportNamedDeclaration > FunctionDeclaration:exit"(node: ESTree.Function) {
          if (node.id?.name !== "generateMetadata") return;
          insideGenerateMetadata = false;
          if (keyReturned) return;
          context.report({
            message: `generateMetadata が ${keyPath} を返していません`,
            node: node.id,
          });
        },

        "Program:exit"(node) {
          if (metadataFound) return;
          context.report({
            message: `metadata も generateMetadata もないので、${keyPath} を確かめられません`,
            node,
          });
        },
      };
    },
  };
}

export default {
  meta: { name: "nextjs-metadata" },
  rules: {
    "require-canonical": createRequireRule("alternates", "canonical"),
    "require-og-url": createRequireRule("openGraph", "url"),
  },
} satisfies Plugin;
```

`.oxlintrc.json` の `overrides` に、2つ目のルールを足す。

```json
  "overrides": [
    {
      "files": ["app/**/page.tsx"],
      "rules": {
        "nextjs-metadata/require-canonical": "error",
        "nextjs-metadata/require-og-url": "error"
      }
    }
  ]
```

まず、`app/about/page.tsx` が残った状態で動かす。

```bash
bun run oxlint
```

```
app/about/page.tsx:1:1: error nextjs-metadata(require-canonical): metadata も generateMetadata もないので、alternates.canonical を確かめられません
app/about/page.tsx:1:1: error nextjs-metadata(require-og-url): metadata も generateMetadata もないので、openGraph.url を確かめられません
error: "oxlint" exited with code 1
```

2つのルールが、それぞれ報告する。次に、`app/tags/page.tsx` の `url: "/tags",` の行だけを消して動かす。

```bash
bun run oxlint
```

```
app/about/page.tsx:1:1: error nextjs-metadata(require-canonical): metadata も generateMetadata もないので、alternates.canonical を確かめられません
app/about/page.tsx:1:1: error nextjs-metadata(require-og-url): metadata も generateMetadata もないので、openGraph.url を確かめられません
app/tags/page.tsx:9:23: error nextjs-metadata(require-og-url): generateMetadata が openGraph.url を返していません
error: "oxlint" exited with code 1
```

`canonical` は残しているので、`require-og-url` だけが反応した。確かめたら `git restore app/tags/page.tsx` で戻す。

**何を作り直したのか** — `hasCanonical` は `"alternates"` と `"canonical"` を中に書き込んでいた。`hasNestedKey` は、その2つを引数 `outer` と `inner` で受け取る。`createRequireRule` も同じで、ルールそのものではなく「ルールを作る関数」になった。`createRequireRule("alternates", "canonical")` と呼ぶと `canonical` のルールが、`createRequireRule("openGraph", "url")` と呼ぶと `og:url` のルールができる。

**`openGraph` の中の `...siteOpenGraph` は邪魔にならないのか** — ならない。`...` の項目は木の上では `SpreadElement` という別の種類の枝で、`child.type === "Property"` の確かめで飛ばされる。`url` を直接書いた項目だけを見ている。

---

### 手順 9：わざと壊して、ルールの限界を見る

`app/page.tsx` の `metadata` を、`satisfies` を使う書き方に変える。型の付け方が違うだけで、中身は同じだ。

```tsx
export const metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...siteOpenGraph, type: "website", url: "/" },
} satisfies Metadata;
```

```bash
bun run oxlint
```

```
app/about/page.tsx:1:1: error nextjs-metadata(require-canonical): metadata も generateMetadata もないので、alternates.canonical を確かめられません
app/about/page.tsx:1:1: error nextjs-metadata(require-og-url): metadata も generateMetadata もないので、openGraph.url を確かめられません
app/page.tsx:5:14: error nextjs-metadata(require-canonical): metadata に alternates.canonical がありません
app/page.tsx:5:14: error nextjs-metadata(require-og-url): metadata に openGraph.url がありません
error: "oxlint" exited with code 1
```

**`canonical` も `url` もあるのにエラーになった。** Playground にこの形を貼ると、`init` の種類が `ObjectExpression` ではなく `TSSatisfiesExpression` になっているのが見えるはずだ。ルールは「`init` がオブジェクトなら中を見る」と書いたので、オブジェクトの外側に `satisfies` の枝が1枚かぶさると、中を見に行かない。

**ここから分かること** — 自作のルールは、自分が想定した書き方しか知らない。lint が通ったことは「想定した書き方で書かれていて、項目がある」ことしか意味しない。対応する書き方を増やすほどルールは長くなるので、どこまで対応するかは確認事項で決めた。

確かめたら元に戻す。

```bash
git restore app/page.tsx
```

---

### 手順 10：例外の付け方を知る

展示室（`/lab`）のページのように、わざと `canonical` を書かないページが将来出てくるかもしれない。そのときは、ページの先頭にコメントを書いて、ルールを止める。

`app/about/page.tsx` を書き換える。

```tsx
/* oxlint-disable nextjs-metadata/require-canonical, nextjs-metadata/require-og-url -- 例外の付け方を試すためのページ */
export default function Page() {
  return <main>about</main>;
}
```

```bash
bun run oxlint
echo $?
```

```
0
```

**なぜ理由を書くのか** — `--` のあとは止めた理由のメモだ。oxlint は読まないが、あとで読んだ人（未来の自分）が「なぜここだけ止めたのか」を辿れる。

確かめたら、試しに作ったページを片付ける。

```bash
mkdir -p ~/.claude/delete/20261106-1800
mv app/about ~/.claude/delete/20261106-1800/
git status --short
```

```
 M .oxlintrc.json
 M bun.lock
 M package.json
?? oxlint-plugins/
```

`app/about` が一覧に出ていなければよい。日時の部分（`20261106-1800`）は、作業した日時に置き換える。

---

### 手順 11：ADR を書く

`docs/adr/20261106-1800-require-canonical-lint-rule.md` を作る。時刻の部分は書いた時刻に置き換えてよい。ほかの ADR と同じ形で、次の4つを入れる。

- **何を決めたか**: `page.tsx` の `canonical` と `og:url` の書き忘れを、oxlint の JS プラグインで自作したルール `nextjs-metadata/require-canonical` と `nextjs-metadata/require-og-url` で止める。プラグインは TypeScript（`.mts`）で書き、型のために `@oxlint/plugins` を `devDependencies` に足す
- **なぜか**: 書き忘れてもビルドも型検査も通り、気づく手段がない。lefthook の oxlint に乗せれば、コミットの前に止まる。TypeScript で書くのは、木の項目の書き間違いを型検査で見つけるため
- **採らなかった案**: レビューで目で見る（忘れる）、テストで HTML を検査する（テストランナーがまだない）、`canonical` を `layout.tsx` で一括して付ける（ページごとに住所が違うので書けない）、プラグインを JavaScript で書く（書き間違いに動かすまで気づけない）
- **気をつけること**: JS プラグインは alpha。oxlint を上げたら、このルールが動くかを確かめ、`@oxlint/plugins` も同じ版に上げる。`satisfies` などの書き方には対応していない。Node が型を外して実行する機能（v22.18 以降は標準で有効）に頼っている

**なぜ ADR を書くのか** — alpha の機能を使うと決めたことは、半年後の自分には見えなくなる。oxlint を上げてルールが壊れたとき、「なぜこんなものがあるのか」「消してよいのか」を判断する材料になる。依存を足した理由を残すのも、このリポジトリの決まり（ADR `20261103-1657-supply-chain-hardening.md`）に沿っている。

---

### 手順 12：コミットして、lefthook が通るのを見る

最後に、全体の lint・型検査・整形を確かめる。

```bash
bun run lint
bun run typecheck
bun run format:check
```

どれもエラーが出なければよい。`format:check` で引っかかったら、`bun run format` で直す。

```bash
git add .oxlintrc.json oxlint-plugins/nextjs-metadata.mts package.json bun.lock docs/adr/
git commit -m "feat: page.tsx に canonical と og:url を書き忘れたら、コミットの前に oxlint で止める"
```

コミットの前に lefthook が format・oxlint・markuplint・typecheck を走らせる。`oxlint` の行に印が付いて通ればよい（この場面は確かめていないので、表示の形は違うかもしれない）。

```bash
git push
```

**余力があれば** — `app/page.tsx` の `canonical` を消して `git add app/page.tsx` し、`git commit` してみる。lefthook の oxlint で止まり、コミットされないはずだ。確かめたら `git restore --staged app/page.tsx` と `git restore app/page.tsx` で戻す。

---

### うまくいかないとき

| 症状                                                                                         | 原因と対処                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `x Failed to load JS plugin: ./oxlint-plugins/blogg.mjs` と `Cannot find module`             | `jsPlugins` に書いた場所とファイル名が合っていない。`.oxlintrc.json` から見た相対パスで書く（エラー文のファイル名は、わざと打ち間違えたときのもの）                                  |
| `x Rule 'require-og-url' not found in plugin 'nextjs-metadata'`                              | `.oxlintrc.json` のルール名が、プラグインの `rules` にない。手順 8 より前に `require-og-url` を設定に書いたときも出る                                                                |
| `[MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///... is not specified`        | プラグインの拡張子が `.ts` か `.js` になっている。`.mts` に変え、`jsPlugins` の場所も直す                                                                                            |
| `error TS2339: Property 'name' does not exist on type 'PropertyKey$1'.`                      | キーが名前の枝かを確かめる前に `key.name` を読んでいる。手順 5-b のように `key.type === "Identifier"` を先に書く                                                                     |
| `error TS2307: Cannot find module '@oxlint/plugins' or its corresponding type declarations.` | 手順 2 のパッケージが入っていない。`bun install` するか、手順 2 をやり直す。続けて `Parameter 'context' implicitly has an 'any' type.` も出るが、原因は同じ                          |
| ルールを足したのに、何も出ない                                                               | `overrides` の `files` が合っていないか、ルールを `rules` と `overrides` のどちらにも書いていない。手順 4-a の「見ているファイル」を出す形に戻すと、どのファイルを見ているかが分かる |
| 項目を書いてあるのにエラーになる                                                             | `satisfies`、アロー関数、別のファイルからの書き出しなど、ルールが知らない書き方になっている。手順 9 を参照。Playground で木の形を見比べる                                            |
| すべての `page.tsx` で「metadata も generateMetadata もない」と出る                          | 変数 `metadataFound` を `create` の外に置いていないか、`true` にする行を書き忘れていないかを見る                                                                                     |

ここに載っていないエラーが出たら、そのまま貼って聞いてほしい。

---

## 受け入れ条件

- [ ] `oxlint-plugins/nextjs-metadata.mts` があり、`.oxlintrc.json` の `jsPlugins` と `overrides` から読み込まれている
- [ ] `package.json` の `devDependencies` に `"@oxlint/plugins": "1.90.0"` がある（`^` なし）
- [ ] 何も変えていない状態で `bun run oxlint` の終了コードが `0` になる
- [ ] `app/page.tsx` の `canonical` を消すと、`metadata に alternates.canonical がありません` が出る（確かめたら戻す）
- [ ] `app/tags/page.tsx` の `canonical` を消すと、`generateMetadata が alternates.canonical を返していません` が出る（確かめたら戻す）
- [ ] `app/tags/page.tsx` の `url` を消すと、`generateMetadata が openGraph.url を返していません` が出る（確かめたら戻す）
- [ ] `metadata` のない `page.tsx` を足すと、2つのルールがそれぞれ「metadata も generateMetadata もない」と報告する（確かめたら消す）
- [ ] `bun run lint`・`bun run format:check`・`bun run typecheck` が通る
- [ ] `docs/adr/` に、この回の ADR がある
- [ ] lefthook を通ってコミットし、`origin/dev` に push してある

## この回で理解したこと

着手後に埋める。受け入れ条件とは別に、何が分かったかを残す。

- [ ] lint がコードを「文字」ではなく「木（AST）」として見ていることを、自分の言葉で説明できる
- [ ] `create` が返す対応表と、`:exit` が呼ばれるタイミングを説明できる
- [ ] 型エラーがあっても oxlint が動く理由と、型検査と lint の役割の違いを説明できる
- [ ] 自作のルールが通っても「項目が必ずある」とは言い切れない理由を、手順 9 を例に説明できる
- [ ] `overrides` で範囲を絞ることと、ルールの中で絞ることの違いを説明できる

## 参考

- oxlint の JS プラグイン: https://oxc.rs/docs/guide/usage/linter/js-plugins.html
- JS プラグインの書き方: https://oxc.rs/docs/guide/usage/linter/writing-js-plugins.html
- oxc の Playground（AST を見る）: https://playground.oxc.rs
- ESLint のセレクタの書き方（`>` や `:exit`）: https://eslint.org/docs/latest/extend/selectors
- Node の TypeScript 実行（type stripping）: https://nodejs.org/api/typescript.html
- 1-11 のチケット: `tickets/1-11-canonical.md`
