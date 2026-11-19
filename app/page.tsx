import { Metadata } from "next";
import { siteOpenGraph } from "../lib/siteMetadata";
import { AppLink } from "./_components/app-link";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...siteOpenGraph, type: "website", url: "/" },
};

const navs = [
  {
    href: "/posts",
    label: "記事一覧",
  },
  {
    href: "/tags",
    label: "タグ一覧",
  },
  {
    href: "/design-system",
    label: "デザインシステム",
  },
];

export default async function Home() {
  "use cache";

  return (
    <nav>
      <ul>
        {navs.map((item) => {
          return (
            <li key={item.href}>
              <AppLink href={item.href}>{item.label}</AppLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
