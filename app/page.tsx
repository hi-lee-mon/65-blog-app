import Link from "next/link";

const navs = [
  {
    href: "/posts",
    label: "記事一覧",
  },
  {
    href: "/tags",
    label: "タグ一覧",
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
              <Link href={item.href}>{item.label}</Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
