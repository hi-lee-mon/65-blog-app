import { css } from "../../styled-system/css";
import { AppLink } from "./app-link";

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
            <a href="https://x.com/65banseki">X</a>
          </li>
          <li>
            <a href="https://github.com/hi-lee-mon">GitHub</a>
          </li>
          <li>
            <AppLink href="/design-system">デザインシステム</AppLink>
          </li>
        </ul>
        <p>
          <small>© 2026 65banseki</small>
        </p>
      </div>
    </footer>
  );
}
