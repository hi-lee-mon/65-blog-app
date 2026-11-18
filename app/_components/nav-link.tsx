"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { css } from "../../styled-system/css";

type NavLinkProps = { href: string; children: ReactNode };

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isCurrent = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isCurrent ? "page" : undefined}
      className={css({
        _hover: { textDecoration: "underline" },
        // [aria-current=page]の付いたときにスタイルが適用されるpandaの機能
        _currentPage: { fontWeight: "bold", textDecoration: "underline" },
      })}
    >
      {children}
    </Link>
  );
}
