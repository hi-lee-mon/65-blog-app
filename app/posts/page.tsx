import path from "node:path";
import Link from "next/link";
import { createPostReader } from "../../lib/createPostReader";
import { Metadata } from "next";

const { getAllPosts } = createPostReader(path.join(process.cwd(), "content"));

export const metadata: Metadata = {
  title: "記事一覧",
};

export default async function Page() {
  "use cache";

  const posts = await getAllPosts();

  return (
    <main>
      <h1>記事一覧</h1>
      <ul>
        {posts.map(({ slug, frontmatter }) => (
          <li key={slug}>
            <time dateTime={frontmatter.date}>{frontmatter.date}</time>
            <Link href={`/posts/${slug}`}>{frontmatter.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
