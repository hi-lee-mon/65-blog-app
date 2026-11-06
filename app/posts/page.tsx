import path from "node:path";
import Link from "next/link";
import { createPostReader } from "../../lib/createPostReader";
import { Metadata, ResolvingMetadata } from "next";
import { siteOpenGraph } from "../../lib/siteMetadata";

const { getAllPosts } = createPostReader(path.join(process.cwd(), "content"));

export async function generateMetadata(
  _props: PageProps<"/posts">,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // openGraphを上書きすると親で指定したopengraph-imageを上書きしてしまうため、parentで参照
  const { openGraph } = await parent;
  return {
    title: "記事一覧",
    alternates: { canonical: "/posts" },
    openGraph: {
      ...siteOpenGraph,
      type: "website",
      url: "/posts",
      images: openGraph?.images,
    },
  };
}

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
