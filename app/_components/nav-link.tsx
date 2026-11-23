"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { css } from "../../styled-system/css";
import { AppLink } from "./app-link";

type NavLinkProps = { href: string; children: ReactNode };

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isCurrentPage = pathname === href;
  const isInSection = pathname.startsWith(`${href}/`);

  return (
    <AppLink
      href={href}
      // 詳細ページのときはaria-currentをtrueに設定することで一覧と詳細を別として判定する
      aria-current={isCurrentPage ? "page" : isInSection ? "true" : undefined}
      className={css({
        display: "inline-flex",
        alignItems: "center",
        minHeight: "24",
        _hover: { textDecoration: "underline" },
        "&[aria-current]": { fontWeight: "bold", textDecoration: "underline" },
      })}
    >
      {children}
    </AppLink>
  );
}
