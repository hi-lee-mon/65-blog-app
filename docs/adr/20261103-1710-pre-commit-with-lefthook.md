# コミット前の検査に lefthook を使う

- 日付: 2026-11-03
- 状態: 採用

## 決めたこと

lefthook で、コミットの直前に次の4つを並列に実行する。設定は `lefthook.yml`。

| 名前       | 内容                                                      | 対象                                              |
| ---------- | --------------------------------------------------------- | ------------------------------------------------- |
| format     | oxfmt で整形し、整形した結果をステージし直す              | ステージ済みのファイル                            |
| oxlint     | oxlint で検査する                                         | ステージ済みの JS・TS                             |
| markuplint | markuplint で検査する                                     | ステージ済みの `app/**/*.tsx`・`content/**/*.mdx` |
| typecheck  | `bun run typecheck`（`next typegen` と tsrs）で型検査する | TS を1つでもステージしたら、プロジェクト全体      |

フックは `bun install` のときに `prepare` スクリプト（`lefthook install`）が `.git/hooks/` に入れる。

あわせて、`next-env.d.ts` を Git の追跡から外し、`.gitignore` に入れた。

## 理由

### lefthook を選んだ理由

2026年11月時点の候補を比べた。

| ツール              | 長所                                                                        | このリポジトリで採らない理由                                                         |
| ------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| lefthook 2.2        | npm で入る。YAML で書ける。並列実行とステージ済みファイルへの絞り込みが標準 | （採用）                                                                             |
| hk 2.10             | Rust 製で速いと作者は言う                                                   | 設定が Pkl。npm になく、mise か Homebrew で別に入れる。4コマンドでは速さの差が出ない |
| prek 0.5            | Rust 製の pre-commit 互換                                                   | 外部リポジトリのフックを取り込む pre-commit の流儀が前提                             |
| husky + lint-staged | Node.js で広く使われている                                                  | ツールが2つ要る。並列実行できない                                                    |

参考:

- [hk のベンチマーク（作者による）](https://hk.jdx.dev/benchmarks.html)
- [hk と lefthook の速度比較（第三者による反論）](https://t.holmium.no/dia/hk-vs-lefthook/)
- [husky vs lefthook vs lint-staged 2026](https://www.pkgpulse.com/guides/husky-vs-lefthook-vs-lint-staged-git-hooks-nodejs-2026)

### 型検査だけプロジェクト全体を見る理由

型の誤りは、変更したファイルではなく、それを使う側のファイルに出ることがある。ステージ済みのファイルだけを tsrs に渡すと見逃す。tsrs は今のプロジェクト全体を 0.2 秒ほどで検査できるので、毎回全体を見ても待たされない。

### `next-env.d.ts` を追跡から外す理由

typecheck で動く `next typegen` が、`next-env.d.ts` を書き換える。中身は `next dev` と `next build` でも変わるので、追跡していると、コミットのたびに作業ツリーに差分が残る。Next.js の TypeScript ガイド（`node_modules/next/dist/docs/01-app/03-api-reference/05-config/02-typescript.md`）も、`.gitignore` に入れて Git から外すよう指示している。

## 欠点

- format はステージし直すので、同じファイルの一部だけをステージしていた場合、残りの変更もコミットに入るおそれがある
- `git commit --no-verify` で検査を飛ばせる。CI（GitHub Actions）での検査はまだない
