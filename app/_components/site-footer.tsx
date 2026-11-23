import { css } from "../../styled-system/css";
import { AppLink } from "./app-link";

const footerLink = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "24",
  minHeight: "24",
});

export function SiteFooter() {
  return (
    <footer className={css({ borderTopWidth: "1", borderColor: "border.default" })}>
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: "8",
          maxWidth: "640",
          marginX: "auto",
          paddingX: "16",
          paddingY: "16",
          fontSize: "14",
          color: "fg.muted",
        })}
      >
        <ul className={css({ display: "flex", flexWrap: "wrap", gap: "16" })}>
          <li>
            <a href="https://x.com/65banseki" className={footerLink}>
              X
            </a>
          </li>
          <li>
            <a href="https://github.com/hi-lee-mon" className={footerLink}>
              GitHub
            </a>
          </li>
          <li>
            <AppLink href="/design-system" className={footerLink}>
              デザインシステム
            </AppLink>
          </li>
          <li>
            {/* oxlint-disable-next-line next/no-html-link-for-pages -- XML は画面ではないので、Linkコンポーネントを使った画面遷移は不要 */}
            <a href="/feed.xml" className={footerLink}>
              RSS フィード
            </a>
          </li>
        </ul>
        <p>
          <small>© 2026 65banseki</small>
        </p>
      </div>
    </footer>
  );
}
