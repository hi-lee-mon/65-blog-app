import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPostReader } from "../../../lib/createPostReader";
import { Metadata, ResolvingMetadata } from "next";
import { siteOpenGraph } from "../../../lib/siteMetadata";

const { getAllTags, getPostsByTag } = createPostReader(path.join(process.cwd(), "content"));

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata(
  { params }: PageProps<"/tags/[tag]">,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // paramsはこのファイルの上部にあるgenerateStaticParams によってstaticになっているのでcache不要
  const { tag } = await params;
  const { openGraph } = await parent;
  return {
    title: `タグ: ${tag}`,
    alternates: { canonical: `/tags/${tag}` },
    openGraph: {
      ...siteOpenGraph,
      type: "website",
      url: `/tags/${tag}`,
      images: openGraph?.images,
    },
  };
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
