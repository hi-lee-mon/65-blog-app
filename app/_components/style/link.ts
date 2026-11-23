import { css } from "../../../styled-system/css";

// MDX の本文のリンクには className を渡せないので、`& a` に展開できる形も公開する
export const linkStyleRaw = css.raw({ color: "fg.link", textDecoration: "underline" });
export const linkStyle = css(linkStyleRaw);
