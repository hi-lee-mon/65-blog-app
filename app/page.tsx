import path from "node:path";
import Link from "next/link";
import { createPostReader } from "../lib/createPostReader";

const { getAllSlugs } = createPostReader(path.join(process.cwd(), "content"));

export default async function Home() {
  "use cache";

  const slugs = await getAllSlugs();

  return (
    <nav>
      <ul>
        {slugs.map((s) => {
          return (
            <li key={s}>
              <Link href={`/posts/${s}`}>{s}</Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
