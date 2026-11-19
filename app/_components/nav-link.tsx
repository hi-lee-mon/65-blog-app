"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { css } from "../../styled-system/css";
import { AppLink } from "./app-link";

type NavLinkProps = { href: string; children: ReactNode };

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isCurrent = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <AppLink
      href={href}
      aria-current={isCurrent ? "page" : undefined}
      className={css({
        _hover: { textDecoration: "underline" },
        _currentPage: { fontWeight: "bold", textDecoration: "underline" },
      })}
    >
      {children}
    </AppLink>
  );
}
