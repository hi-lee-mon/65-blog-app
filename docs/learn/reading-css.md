# CSS の読み方：`styled-system/check.css` を上から読めるようになる

Panda が書き出した `styled-system/check.css`（2-3 の手順 2-b で作るファイル）を、1行ずつ意味が分かる状態にするための解説。React と TypeScript は書けるが、CSS の細かい決まりは忘れている、という読み手を想定している。

1〜6章は CSS の決まりの説明で、上から順に読む。7章で、それを使って `check.css` を区画ごとに読む。8章は 2-3 で出た「`dark` クラスの中なら効くのか」という疑問への答え。分からない語は末尾の用語集から引ける。

- 作成: 2026-11-07
- 対象のファイル: `styled-system/check.css`（238行。2-3 の手順 2-b の時点のもの）

---

## 1. CSS は「どれに・何を・どうする」を並べたもの

CSS の1つ1つの決まりを**ルール**と呼ぶ。ルールは次の形をしている。

```css
body {
  color: var(--colors-fg-default);
  font-size: var(--font-sizes-16);
}
```

```
body          {   color      :   var(--colors-fg-default)   ;   }
└─セレクタ─┘      └プロパティ┘     └────────値────────┘
 （どれに）        （何を）            （どうする）
```

- **セレクタ**: どの要素に当てるか。`body` なら `<body>` タグ
- **プロパティ**: 何を変えるか。`color` は文字の色
- **値**: どう変えるか
- `{ }` の中の「プロパティ: 値;」の1行を**宣言**と呼ぶ

セレクタはカンマで並べられる。`img, video { ... }` は「`<img>` と `<video>` の両方に」という意味になる。

---

## 2. セレクタは「名札」「タグ名」「状態」で要素を選ぶ

`check.css` に出てくるセレクタを、種類ごとにまとめる。

| 書き方                    | 意味                                                                               | `check.css` の例    |
| ------------------------- | ---------------------------------------------------------------------------------- | ------------------- |
| `body`                    | タグの名前。そのタグの要素すべて                                                   | `body`、`img`、`h1` |
| `.dark`                   | 先頭が `.` ならクラス。`class="dark"` が付いた要素                                 | `.dark`、`.d_flex`  |
| `*`                       | すべての要素                                                                       | 16行目              |
| `[hidden]`                | 角かっこは属性。`hidden` 属性を持つ要素                                            | 135行目             |
| `[type='button']`         | 属性とその値。`type="button"` の要素                                               | 55行目              |
| `:root`                   | コロン1つは**疑似クラス**（要素の状態や位置）。`:root` はページの一番外の `<html>` | 145行目             |
| `::before`、`::selection` | コロン2つは**疑似要素**（タグとしては存在しない部分）                              | 16行目、71行目      |

疑似要素は HTML には書かれていないが、ブラウザが画面に描いている部分を指す。`check.css` に出てくるものは次のとおり。

- `::before`、`::after`: 要素の中身の前と後ろに、CSS から差し込む飾り
- `::placeholder`: 入力欄の中に薄く出る説明の文字
- `::selection`: マウスでなぞって選んだ範囲
- `::backdrop`: ダイアログを開いたとき、後ろに敷かれる幕
- `::file-selector-button`: ファイルを選ぶ入力欄の「ファイルを選択」ボタン

疑似クラスのうち、かっこを取るものが3つある。

- `:not(X)`: X ではないもの
- `:where(X, Y)`: X か Y のどちらか。5章で見るとおり、「優先度を上げない」という特別な働きがある
- `:host`: Web Components の部品の外枠。このサイトでは使っていないので、`:root, :host` は実質 `:root`（`<html>`）だと思ってよい

組み合わせると、次のようにも書ける。

```css
[hidden]:where(:not([hidden="until-found"])) {
  display: none !important;
}
```

「`hidden` 属性を持ち、かつ `hidden="until-found"` ではない要素」を隠す、という意味になる。

---

## 3. 親の値は、子に受け継がれるものと受け継がれないものがある

HTML の要素は、親の中に子が入る木の形をしている。

```
html
└─ body
   ├─ a（ホーム）
   └─ main
      ├─ h1
      └─ ul
         └─ li
            ├─ time
            └─ a
```

`body` に `color` を当てると、中の `h1` や `time` も同じ色になる。これを**継承**（受け継ぎ）と呼ぶ。

ただし、すべてのプロパティが受け継がれるわけではない。

| 受け継がれる                                                      | 受け継がれない                                                   |
| ----------------------------------------------------------------- | ---------------------------------------------------------------- |
| `color`、`font-family`、`font-size`、`line-height`、`font-weight` | `background`、`margin`、`padding`、`border`、`height`、`display` |
| CSS 変数（`--` で始まるもの。4章）                                |                                                                  |

覚え方は「文字に関するものは受け継がれ、箱に関するものは受け継がれない」。背景を受け継がないのに子の背景が親と同じ色に見えるのは、子の背景が透明で、後ろの親の背景が透けているからだ。

値に `inherit` と書くと、本来は受け継がないプロパティでも「親と同じにする」と指定できる。`check.css` の reset の区画には、これが多い。

```css
h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit; /* 見出しを大きくするブラウザの既定をやめ、親と同じ大きさにする */
  font-weight: inherit; /* 見出しを太くする既定もやめる */
}
```

2-0 で「見出しも本文も同じ 16px」だったのは、この行のせいだ。

---

## 4. CSS 変数は「名前を付けた箱」で、読んだ場所で中身が決まる

ここが 2-3 の意味トークンを理解するための中心になる。

### 4-1. 書き方

`--` で始まるプロパティは、**CSS 変数**（正式にはカスタムプロパティ）になる。好きな名前で値をしまっておける。

```css
:where(:root, :host) {
  --colors-gray-900: #1a1a1a; /* 箱に値を入れる */
  --colors-fg-default: var(--colors-gray-900); /* 別の箱を指すこともできる */
}
body {
  color: var(--colors-fg-default); /* 箱の中身を使う */
}
```

- `--名前: 値;` で箱に値を入れる
- `var(--名前)` で箱の中身を取り出す
- `var(--名前, 予備の値)` と書くと、箱が空のときに予備の値を使う。13行目の `var(--global-font-body, var(--font-fallback))` は「`--global-font-body` が空なら `--font-fallback` を使う」という意味

### 4-2. 箱は受け継がれ、中身は使った場所で読まれる

CSS 変数は、3章の表のとおり子に受け継がれる。`<html>` に入れた箱はページのどの要素からでも開けられる。

`var()` は、**それを書いた要素の場所で**箱を開ける。ここが大事な点だ。

```
html   … --colors-fg-default は gray-900（箱の中身）
└─ body … color: var(--colors-fg-default)
          → body の場所で箱を開ける → gray-900 → 文字色が #1a1a1a に決まる
   └─ p … color は書いていない
          → 箱は開けない。body で決まった「#1a1a1a」という色を受け継ぐ
```

`p` が受け継ぐのは「箱」ではなく、`body` で開けたあとの「色」だ。この違いが 8章の答えになる。

### 4-3. 同じ名前の箱を、場所によって入れ替えられる

```css
:where(:root, :host) {
  --colors-bg-default: var(--colors-white);
}
.dark {
  --colors-bg-default: var(--colors-black);
}
```

`<html>` では箱の中身が白、`class="dark"` の要素の中では黒になる。箱を使う側（`body` の `background: var(--colors-bg-default)`）は1文字も変えずに、置かれた場所によって色が変わる。2-3 の意味トークンはこの仕組みでできている。

---

## 5. ルールが重なったら、決まった順番で勝ち負けが決まる

同じ要素の同じプロパティに、2つ以上のルールが当たることがある。そのとき、どれが勝つかを決める仕組みを**カスケード**と呼ぶ。上から順に比べ、差がついたところで決まる。

```
① !important が付いているか
② どの @layer に入っているか（後に宣言したレイヤーが勝つ）
③ セレクタの強さ（詳細度）
④ 後に書かれたほうが勝つ
```

### 5-1. `@layer`：区画ごとの順位

`check.css` の1行目は、区画（レイヤー）の順位を最初に宣言している。

```css
@layer reset, base, tokens, recipes, utilities;
```

```
弱い ◀──────────────────────────────────▶ 強い
reset  <  base  <  tokens  <  recipes  <  utilities
```

後に並んだレイヤーほど強い。だから、`utilities`（`css()` から作られる部分）は、`base`（`globalCss` から作られる部分）にいつも勝つ。`globalCss` で `body` の色を決めても、`css()` で書いた色のほうが優先される。

セレクタがどれだけ強くても、弱いレイヤーにあるルールは、強いレイヤーのルールに負ける。②が③より先に比べられるからだ。

### 5-2. 詳細度：セレクタの強さ

同じレイヤーの中ではセレクタの強さを比べる。

```
弱い ◀──────────────────────────▶ 強い
*      <   body、::before   <   .dark、[hidden]、:root   <   #id
（0）       （タグ・疑似要素）      （クラス・属性・疑似クラス）    （ID）
```

`:where(...)` は特別で、中に何を書いても強さが 0 になる。161行目の `:where(:root, :host)` は「`<html>` に当てたいが、強さは持たせたくない」という書き方だ。こうしておくと、あとから `.dark` のようなクラスのルールで、確実に上書きできる。

### 5-3. `!important`

宣言の最後に `!important` を付けると、①の段階で勝つ。強すぎて上書きが難しくなるので、ふつうは使わない。`check.css` では、135行目の `hidden` 属性のときだけ使っている。「隠すと書いたものは、何があっても隠す」ためだ。

---

## 6. `@` で始まるものは、条件や区画を作る

`@` で始まる書き方を **@ルール** と呼ぶ。`check.css` には3種類出てくる。

| @ルール     | 意味                                           | `check.css` の場所  |
| ----------- | ---------------------------------------------- | ------------------- |
| `@layer`    | 区画を作る、または区画の順位を宣言する（5-1）  | 1〜4行目ほか        |
| `@supports` | ブラウザがその機能に対応しているときだけ当てる | 138行目             |
| `@media`    | 画面や利用者の設定が条件に合うときだけ当てる   | 2-3 の手順 3 で出る |

`@media (prefers-color-scheme: dark) { ... }` は「利用者が OS をダークモードにしているときだけ」という意味になる。2-3 の手順 3 で、216行目の `.dark {` がこれに替わる。

2〜3行目の `@layer recipes { @layer base, slots, ... }` は、`recipes` の区画の中を、さらに小さな区画に分ける宣言だ。部品の見た目の型（recipes）は 2-5 で使う。今は中身が空なので、読み飛ばしてよい。

138行目の `@supports (not (-webkit-appearance: -apple-pay-button)) or (contain-intrinsic-size: 1px)` は、入力欄の説明の文字の色を `color-mix()` で作れるブラウザだけを選ぶための判定だ。Tailwind CSS のリセットと同じ書き方で、古い Safari を外す目的とされる。読み手が覚える必要はない。

---

## 7. `check.css` を区画ごとに読む

1〜6章の知識で、ファイル全体を読む。

```
1〜3行目     レイヤーの順位の宣言
4〜143行目   @layer reset      ブラウザの既定の見た目を消す（preflight）
144〜159行目 @layer base       panda.config.ts の globalCss
160〜220行目 @layer tokens     theme/tokens.ts と theme/semantic.ts（CSS 変数）
221〜237行目 @layer utilities  app/ の中の css()
```

### 7-1. reset（4〜143行目）：ブラウザの既定をそろえる

ブラウザは何も CSS を書かなくても、見出しを大きく太くし、段落の上下に余白を空け、リストに黒丸を付ける。ブラウザによって少しずつ違うこの既定を、いったん消してそろえる区画だ。`panda.config.ts` の `preflight: true` がこれを出している。

主な行だけ挙げる。

| 行       | 書いてあること                                                    | 何のためか                                                                 |
| -------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 6        | `html` の `line-height: 1.5`                                      | 行の高さの出発点。`body` で 1.7 に上書きしている                           |
| 13       | `font-family: var(--global-font-body, var(--font-fallback))`      | `globalCss` の `--global-font-body` があればそれを、なければ予備のフォント |
| 17〜19   | すべての要素の `margin`・`padding` を 0、`box-sizing: border-box` | 余白をなくし、幅の計算に枠線と内側の余白を含める                           |
| 44〜47   | 見出しの `font-size`・`font-weight` を `inherit`                  | 見出しを大きく太くする既定を消す（3章）                                    |
| 52〜54   | `ol`、`ul` の `list-style: none`                                  | リストの黒丸と番号を消す                                                   |
| 103〜106 | `a` の `color: inherit`、`text-decoration: inherit`               | リンクの青と下線を消す。2-0 でリンクが本文と同じ色だったのはこのため       |

`-webkit-` や `-moz-` で始まるプロパティ（8〜11行目など）は、特定のブラウザだけが分かる書き方だ。`-webkit-` は Chrome と Safari、`-moz-` は Firefox を指す。

### 7-2. base（144〜159行目）：`globalCss` から来た部分

```css
:root {
  --global-font-body: var(--fonts-sans); /* globalCss の "{fonts.sans}" が変数の参照になった */
  --global-font-mono: var(--fonts-mono);
  color-scheme: light dark; /* このページは明るい表示と暗い表示の両方に対応している、とブラウザに伝える */
}
body {
  background: var(--colors-bg-default); /* globalCss の "bg.default" */
  color: var(--colors-fg-default); /* globalCss の "fg.default" */
  font-size: var(--font-sizes-16);
  line-height: var(--line-heights-170);
}
```

`color-scheme: light dark` があると、OS がダークのとき、スクロールバーや入力欄のようなブラウザが描く部品も暗くなる。

146行目の `--made-with-panda: '🐼';` は Panda が入れている目印で、何にも使われていない。

### 7-3. tokens（160〜220行目）：トークンが CSS 変数になった部分

`theme/tokens.ts` と `theme/semantic.ts` に書いた値が、1つずつ CSS 変数になって並んでいる。

```
theme/tokens.ts の colors.gray.900    →  --colors-gray-900: #1a1a1a;
theme/tokens.ts の fontSizes.16       →  --font-sizes-16: 1rem;
theme/semantic.ts の fg.default (base) →  --colors-fg-default: var(--colors-gray-900);
theme/semantic.ts の fg.default (_dark) → .dark の中の --colors-fg-default: var(--colors-gray-50);
```

値の単位も確かめておく。

| 書き方               | 意味                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------ |
| `#1a1a1a`            | 色。赤・緑・青の強さを、2桁ずつの16進数で書いたもの                                  |
| `1rem`               | ブラウザの文字の大きさの設定を1とした長さ。ふつうは 16px（`content/rem.mdx` を参照） |
| `100%`               | 親の大きさに対する割合                                                               |
| `1.7`                | `line-height` に単位なしで書くと、その要素の文字の大きさの 1.7 倍。16px なら 27.2px  |
| `rgba(0, 0, 0, 0.5)` | 赤・緑・青を 0〜255 で、最後の数で透け具合（0 が透明、1 が不透明）を書いた色         |
| `currentcolor`       | その要素の `color` の値と同じ色                                                      |

`line-height` を単位なしで書くのには理由がある。子が受け継ぐのは「1.7 倍」という倍率で、子の文字が大きければ行の高さも一緒に大きくなる。`27.2px` と書くと、子は「27.2px」を受け継ぎ、文字が大きい見出しでは行が詰まってしまう。

### 7-4. utilities（221〜237行目）：`css()` から来た部分

`app/layout.tsx` の `css()` が、ここに1プロパティ1クラスの形で出ている。

```tsx
css({ height: "full", fontSmoothing: "antialiased" });
css({ minHeight: "full", display: "flex", flexDirection: "column" });
```

```css
.d_flex {
  display: flex;
}
.flex-d_column {
  flex-direction: column;
}
.fsmt_antialiased {
  -webkit-font-smoothing: antialiased;
}
.h_full {
  height: var(--sizes-full);
}
.min-h_full {
  min-height: var(--sizes-full);
}
```

`css()` は、渡したオブジェクトを `"h_full fsmt_antialiased"` のようなクラス名の文字列にして返す。CSS の本体はここにまとめて1回だけ書かれる。同じ `display: flex` をほかの場所で使っても `.d_flex` を使い回すので、CSS が増えにくい。

---

## 8. 「`dark` クラスの中なら効くのか」への答え

216〜219行目を、もう一度見る。

```css
.dark {
  --colors-bg-default: var(--colors-black);
  --colors-fg-default: var(--colors-gray-50);
}
```

このルールが変えるのは、**`.dark` の要素の中での箱の中身**だけで、色そのものを変えてはいない（4-3）。色が変わるのは、`.dark` の中で `var()` を使って箱を開けている要素だけだ（4-2）。

### 8-1. `<html>` に付けた場合：ページ全体が暗くなる

```
html.dark … 箱の中身が black / gray-50 に入れ替わる
└─ body   … background: var(--colors-bg-default)
            → .dark の中で箱を開ける → black
            → color も同じく gray-50
   └─ p   … body で決まった gray-50 を受け継ぐ
```

`body` が `.dark` の中にあるので、`body` が開ける箱は黒の中身になる。2-3 の手順 2-c はこの形だ。

### 8-2. 途中の `<div>` に付けた場合：その中は暗くならない

```
html      … 箱の中身は white / gray-900
└─ body   … background: var(--colors-bg-default) → white
            color: var(--colors-fg-default) → gray-900（ここで色が決まる）
   └─ div.dark … 箱の中身が black / gray-50 に入れ替わる
                  でも、この div は var() を使っていない
      └─ p     … var() を使っていない。body で決まった gray-900 を受け継ぐ
```

`div` の中の箱は黒の中身になっているが、それを開ける要素が1つもない。`p` が受け継いでいるのは、`body` の場所で開けたあとの `gray-900` という色だ。

`div` の中も暗くしたければ、`div` 自身が箱を開ける必要がある。

```tsx
<div className={`dark ${css({ background: "bg.default", color: "fg.default" })}`}>
```

こうすると `div` は `.dark` の中で箱を開けるので、黒の背景と `gray-50` の文字になる。

### 8-3. まとめ

- `.dark` は箱の中身を入れ替えるだけ
- 色が変わるのは、`.dark` の中で `var()` を書いている要素
- ページ全体を切り替えたいなら、一番外の `<html>` に付ける。2-6 の切り替えボタンも `<html>` に付け外しする形になる

---

## 9. 自分の目で確かめる

ブラウザの DevTools の Elements パネルで要素を選ぶと、Styles の欄に、その要素に当たっているルールが強い順に並ぶ。負けた宣言には取り消し線が引かれる。Computed の欄では、最終的に決まった値（`rgb(26, 26, 26)` など）が見られる。

Console で確かめるなら、次の2つが使える。

```js
// その要素で最終的に決まった値
getComputedStyle(document.body).color;

// その要素の場所での CSS 変数の中身
getComputedStyle(document.body).getPropertyValue("--colors-fg-default");
```

8-2 の形を自分で作り、`div` の中の `p` の `color` と、`div` の場所の `--colors-fg-default` を比べると、「箱の中身は黒なのに、色は明るいまま」になっていることが確かめられる。

---

## 用語集

| 用語                   | 意味                                                                          | 章   |
| ---------------------- | ----------------------------------------------------------------------------- | ---- |
| ルール                 | セレクタと `{ }` の中の宣言をひとまとまりにしたもの                           | 1    |
| セレクタ               | ルールを当てる要素を選ぶ書き方                                                | 1・2 |
| 宣言                   | 「プロパティ: 値;」の1行                                                      | 1    |
| 疑似クラス             | `:root` や `:not()` のように、要素の状態や位置で選ぶもの。コロン1つ           | 2    |
| 疑似要素               | `::before` や `::placeholder` のように、タグにない部分を選ぶもの。コロン2つ   | 2    |
| 継承                   | 親の値が子に受け継がれること。文字に関するプロパティと CSS 変数が受け継がれる | 3    |
| `inherit`              | 「親と同じ値にする」という値                                                  | 3    |
| CSS 変数               | `--` で始まる、名前を付けた箱。`var()` で中身を取り出す                       | 4    |
| カスケード             | ルールが重なったときに勝ち負けを決める仕組み                                  | 5    |
| レイヤー（`@layer`）   | ルールの区画。後に宣言した区画ほど強い                                        | 5    |
| 詳細度                 | セレクタの強さ。ID > クラス・属性・疑似クラス > タグ・疑似要素                | 5    |
| `:where()`             | 中のセレクタの強さを 0 にする疑似クラス                                       | 5    |
| @ルール                | `@layer`・`@media`・`@supports` のように、`@` で始まり条件や区画を作るもの    | 6    |
| preflight              | ブラウザの既定の見た目を消してそろえる CSS。Panda では reset のレイヤーに入る | 7    |
| ベンダープレフィックス | `-webkit-`・`-moz-` のような、特定のブラウザ向けの頭文字                      | 7    |

## 参考

- MDN カスケードレイヤー（`@layer`）: https://developer.mozilla.org/ja/docs/Web/CSS/@layer
- MDN `var()`: https://developer.mozilla.org/ja/docs/Web/CSS/var
- MDN 詳細度: https://developer.mozilla.org/ja/docs/Web/CSS/Specificity
- MDN `:where()`: https://developer.mozilla.org/ja/docs/Web/CSS/:where
- MDN 継承: https://developer.mozilla.org/ja/docs/Web/CSS/Inheritance
