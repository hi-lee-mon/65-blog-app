# markuplint が MDX のコードブロックで誤検知する件と、コミット時に markuplint が動いていなかった件を直す

- 日付: 2026-11-03
- 状態: 採用
- 関連: `20261103-1640-markuplint-with-typescript6.md`、`20261103-1710-pre-commit-with-lefthook.md`（markuplint の行の「対象」を、この ADR で置き換える）

## 何が起きていたか

1-3 で `content/hello.mdx` にコードブロックを足したあと、`bun run lint` が次のエラーで落ちるようになった。それなのに、コミットは lefthook の検査を通っていた。

```
<markuplint> error: The "class" attribute is disallowed. Did you mean "className"? (no-unknown-attr) content/hello.mdx:18:1
```

調べると、原因は3つあった（2026-11-03、markuplint 5.4.0 / lefthook 2.2.2 で、リポジトリの複製を使って再現した）。

1. **markuplint の誤検知。** `@markuplint/markdown-parser` は、コードブロックを `<pre><code>` に組み立てるときに、HTML の属性名で `class="language-ts"` を付ける（`lib/markdown-aware-parser.js` の189行目）。一方、MDX と組み合わせている `@markuplint/react-spec` は、React の属性名 `className` を正しい名前とみなす。この食い違いで、言語名を書いたコードブロックがすべてエラーになる。5.4.0 が最新で、同じ報告の issue は見つからなかった
2. **lefthook の glob が直下のファイルに一致しない。** lefthook の glob は、既定では gobwas という方式で読まれる。この方式の `**` は「0階層以上」として働かず、`content/**/*.mdx` は `content/hello.mdx` に、`app/**/*.tsx` は `app/page.tsx` に一致しない。そのため、これらのファイルだけをステージしたコミットでは、markuplint が `(skip) no files for inspection` になっていた
3. **markuplint が `[slug]` を含むパスを黙って飛ばす。** markuplint は、引数のパスもパターンとして読む。`app/posts/[slug]/page.tsx` を渡すと、`[slug]` を「s・l・u・g のどれか1文字」と読んで一致するファイルなしとなり、何も検査せずに終了コード 0 で終わる。lefthook の `{staged_files}` でファイルを渡していたので、動的ルートのページは、glob に一致しても検査されていなかった

## 決めたこと

| ファイル             | 変更                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `.markuplintrc.json` | `nodeRules` で、`class` が `language-` で始まる `<code>` だけ `no-unknown-attr` を外す                                |
| `package.json`       | markuplint の検査範囲を `lint:markup` スクリプトに切り出し、`lint` からはそれを呼ぶ                                   |
| `lefthook.yml`       | markuplint の glob を `app/*.tsx` と `content/*.mdx` にする。ファイルを渡さず、`bun run lint:markup` で全体を検査する |

変更後、lefthook の検査で8本（TSX 6本、MDX 2本）すべてが検査されて通ることと、MDX のほかの要素に書いた `class` は引き続きエラーになることを確かめた。

## 理由と、採らなかった案

### 1. 誤検知を設定で避ける

| 案                                                 | 採らない理由                                                                                  |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `nodeRules` で `code[class^='language-']` だけ外す | （採用）外す範囲が、markuplint 自身が組み立てたコードブロックにほぼ限られる                   |
| `overrides` で MDX のときだけ外す                  | 試したところ、`overrides` を書くと MDX 用の読み込み部品が外れ、MDX の検査そのものが飛ばされた |
| MDX の仕様を `react-spec` から HTML の仕様に変える | MDX の中に書く JSX は `className` を使うので、今度はそちらがエラーになる                      |
| MDX を markuplint の対象から外す                   | 原稿の中の JSX のアクセシビリティを検査できなくなる                                           |

採用した案の欠点: `nodeRules` は TSX にも効く。TSX に `<code className="language-ts">` ではなく `<code class="language-ts">` と書いても見逃される。markuplint 側が直ったら、この設定を消す。

### 2. glob の方式は変えない

lefthook には `glob_matcher: doublestar`（一般的な `**` の動き）に切り替える設定がある。試したところ、`doublestar` では `*` が `/` をまたがなくなり、format・oxlint・typecheck の `*.{ts,...}` が `lib/createPostReader.ts` に一致しなくなった（3つとも skip になった）。これらを `**/*.{ts,...}` に書き直すより、markuplint の2行を gobwas の書き方に合わせるほうが変更が小さい。

欠点: lefthook の glob だけ、ほかの道具（markuplint の CLI や `tsconfig.json`）と `*` の意味が違う。`lefthook.yml` にコメントで残した。

### 3. ステージしたファイルではなく全体を検査する

`{staged_files}` のまま `[` と `]` をエスケープする方法も試したが、markuplint は `\[slug\]` でも一致しなかった。全体の検査は8本で0.5秒ほどなので、typecheck と同じく、対象のファイルを1つでもステージしたら全体を見る形にした。

欠点: 記事が数百本に増えると、コミットのたびの検査が遅くなる。そのときは、パスの `[` を `[[]` に置き換えて渡すなどの方法を改めて試す。

## markuplint 側が直ったら

`nodeRules` を消し、`bun run lint` が通ることを確かめる。不具合の報告は、まだ出していない。
