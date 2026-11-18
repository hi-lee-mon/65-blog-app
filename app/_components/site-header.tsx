import Link from "next/link";
import { SITE_NAME } from "../../lib/siteMetadata";
import { css } from "../../styled-system/css";
import { NavLink } from "./nav-link";

const navItems = [
  { href: "/posts", label: "記事" },
  { href: "/tags", label: "タグ" },
];

export function SiteHeader() {
  return (
    <header className={css({ borderBottomWidth: "1", borderColor: "border.default" })}>
      <div
        className={css({
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "8",
          maxWidth: "640",
          marginX: "auto",
          paddingX: "16",
          paddingY: "16",
        })}
      >
        <Link href="/" className={css({ fontWeight: "bold" })}>
          {SITE_NAME}
        </Link>
        <nav aria-label="メインメニュー">
          <ul className={css({ display: "flex", gap: "16" })}>
            {navItems.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href}>{item.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
