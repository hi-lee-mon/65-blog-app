import type { Metadata } from "next";
import { css } from "../styled-system/css";
import { AppLink } from "./_components/app-link";
import { linkStyle } from "./_components/style/link";
import { PageContainer } from "./_components/page-container";

export const metadata: Metadata = {
  title: "ページが見つかりません",
};

export default function NotFound() {
  return (
    <PageContainer>
      <h1 className={css({ textStyle: "heading.1", marginBlockEnd: "16" })}>
        ページが見つかりません
      </h1>
      <p className={css({ marginBlockEnd: "24" })}>
        URL が間違っているか、ページが移動または削除された可能性があります。
      </p>
      <ul className={css({ display: "flex", flexDirection: "column", gap: "8" })}>
        <li>
          <AppLink href="/" className={linkStyle}>
            トップページへ戻る
          </AppLink>
        </li>
        <li>
          <AppLink href="/posts" className={linkStyle}>
            記事一覧を見る
          </AppLink>
        </li>
        <li>
          <AppLink href="/tags" className={linkStyle}>
            タグ一覧を見る
          </AppLink>
        </li>
      </ul>
    </PageContainer>
  );
}
