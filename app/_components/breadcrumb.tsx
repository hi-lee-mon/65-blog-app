import Link from "next/link";
import { css } from "../../styled-system/css";

type BreadcrumbParent = { href: string; label: string };

type BreadcrumbProps = {
  parents: BreadcrumbParent[];
  current: string;
};

export function Breadcrumb({ parents, current }: BreadcrumbProps) {
  return (
    <nav aria-label="現在位置" className={css({ marginBlockEnd: "16" })}>
      <ol
        className={css({
          display: "flex",
          flexWrap: "wrap",
          columnGap: "8",
          fontSize: "14",
        })}
      >
        {parents.map((parent) => (
          <li key={parent.href} className={css({ display: "flex", columnGap: "8" })}>
            <Link
              href={parent.href}
              className={css({ color: "fg.link", textDecoration: "underline" })}
            >
              {parent.label}
            </Link>
            <span aria-hidden="true" className={css({ color: "fg.muted" })}>
              /
            </span>
          </li>
        ))}
        <li>
          <span aria-current="page">{current}</span>
        </li>
      </ol>
    </nav>
  );
}
