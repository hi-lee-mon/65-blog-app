# npm 経由のサプライチェーン攻撃に備える

- 日付: 2026-11-03
- 状態: 採用

## 背景

npm のパッケージを乗っ取り、悪意ある版を公開する攻撃が続いている。2026年3月には axios の `1.14.1` と `0.30.4` が公開され、隠れた依存 `plain-crypto-js` の `postinstall` スクリプトが遠隔操作用のマルウェアを入れた（[Spring 2026 の事例のまとめ](https://dev.to/trknhr/lessons-from-the-spring-2026-oss-incidents-hardening-npm-pnpm-and-github-actions-against-1jnp)）。悪意ある版の多くは、公開から数時間〜数日で見つかって消される。

## 決めたこと

### このリポジトリ

| 対策                                        | 設定                                                                                      | 防ぐもの                                                       |
| ------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 公開から3日たっていない版を入れない         | `bunfig.toml` の `minimumReleaseAge = 259200`（秒）                                       | 乗っ取り直後の悪意ある版                                       |
| 版を固定する                                | `package.json` から `^` を外し、`bunfig.toml` の `exact = true` で `bun add` も固定させる | 意図しない更新                                                 |
| 依存パッケージのスクリプトを1つも動かさない | `package.json` の `trustedDependencies: []`                                               | `postinstall` などからの攻撃                                   |
| インストール前に既知のマルウェアを調べる    | `bunfig.toml` の `[install.security]` に Socket のスキャナー                              | 待機期間を過ぎても残っている悪意ある版、タイポスクワッティング |
| フックで npm から取ってこない               | `lefthook.yml` の `bunx` を `bun run` に替える                                            | 手元にないパッケージを、その場で落として実行すること           |

### このリポジトリの外（ホームディレクトリの設定）

ほかのプロジェクトや、その場で実行する `npx` にも効かせるため、待機日数を揃えた。

- `~/.bunfig.toml`: `minimumReleaseAge = 259200`、`exact = true`
- `~/.npmrc`: `min-release-age=3`（日）、`ignore-scripts=true`
- pnpm のグローバル設定: `minimumReleaseAge 4320`（分）。pnpm 12 は既定で依存のスクリプトを止めている

## 理由

### 待機日数を3日にした理由

Bun のドキュメントの例と同じ値。Supabase は7日を勧めている（[Securing npm installs](https://supabase.com/docs/guides/security/npm-security.md)）。7日のほうが防げる攻撃は増えるが、新しい版を試す学習用のリポジトリなので、待ち時間との釣り合いで3日にした。

### `trustedDependencies` を空にした理由

`trustedDependencies` を書かないと、Bun は人気のパッケージを集めた既定の一覧のスクリプトを動かす（[Lifecycle scripts](https://bun.sh/docs/install/lifecycle)）。これまで `sharp` と `unrs-resolver` を許していたが、sharp 0.35.5 にはインストール時のスクリプトがなく、unrs-resolver は ESLint と一緒に依存から消えていた。許す理由がなくなったので空にした。あわせて、Bun が読まない `ignoreScripts` キーを `package.json` から消した。

自分の `package.json` の `prepare`（`lefthook install`）は、外部のコードではないので動かしてよい。

### Socket のスキャナーを入れた理由

待機期間は「新しい版」しか防げない。スキャナーは、Socket が既知のマルウェアと判定した版を、公開時期に関係なく止める。API キーなしの無料モードで動き、送るのは `pkg:npm/名前@版` だけ（`dist/index.js` の `unauthenticated()` で確認した）。

## 確かめたこと

- `bun add next@canary --dry-run` で、3日以内に公開された `16.5.0-canary.35`〜`37` が飛ばされ、`canary.34` が選ばれた。npm と pnpm のグローバル設定でも同じ結果になった
- `bun install` でスキャナーが 515 個のパッケージを調べ、問題なしで通った
- `bun install --frozen-lockfile`、`bun run lint`、`bun run build`、lefthook のフックが通る

## 欠点と運用

- 緊急の脆弱性修正も3日待つことになる。待てないときは、その版だけを `minimumReleaseAgeExcludes` に `"next@16.4.2"` のように書くか、`--minimum-release-age-excludes` を付けて入れる
- `bun audit` で、markuplint が使う glob と minimatch に moderate が2件ある。開発用の依存で、markuplint 側の更新を待つ
- `bunx` に待機日数が効くかは確かめていない。CLI はなるべく `devDependencies` に入れて `bun run` で動かす

## 今は入れず、あとで入れるもの

- CI（GitHub Actions）を作るとき: `bun ci`（lockfile と食い違ったら失敗する）で入れる。Actions はタグではなくコミットハッシュで固定する（2026年3月の trivy-action では、タグが悪意あるコミットに付け替えられた）
- 依存の更新を自動化するとき: Renovate や Dependabot にも同じ待機日数を設定する
