import path from "node:path";
import Link from "next/link";
import { createPostReader } from "../../lib/createPostReader";
import { Metadata } from "next";

const { getAllTags } = createPostReader(path.join(process.cwd(), "content"));

export const metadata: Metadata = {
  title: "タグ一覧",
};

export default async function Page() {
  "use cache";

  const tags = await getAllTags();

  return (
    <main>
      <h1>タグ一覧</h1>
      <ul>
        {tags.map((tag) => (
          <li key={tag}>
            <Link href={`/tags/${tag}`}>{tag}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
