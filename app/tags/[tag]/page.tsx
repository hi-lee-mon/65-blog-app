import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPostReader } from "../../../lib/createPostReader";

const { getAllTags, getPostsByTag } = createPostReader(path.join(process.cwd(), "content"));

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag }));
}

export default async function Page({ params }: PageProps<"/tags/[tag]">) {
  "use cache";

  const { tag } = await params;
  const posts = await getPostsByTag(tag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <main>
      <h1>タグ: {tag}</h1>
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
