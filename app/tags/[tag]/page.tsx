import path from "node:path";
import { notFound } from "next/navigation";
import { createPostReader } from "../../../lib/createPostReader";
import { Metadata, ResolvingMetadata } from "next";
import { siteOpenGraph } from "../../../lib/siteMetadata";
import { css } from "../../../styled-system/css";
import { PostCard } from "../../_components/post-card";

const { getAllTags, getPostsByTag } = createPostReader(path.join(process.cwd(), "content"));

// 本体と generateMetadata が params を読む。
// 本体は <Suspense> に移せるが、generateMetadata は <head> に入るので移せず、警告が残る。
// ADR 20261115-0059-instant-false-for-dynamic-routes.md
export const instant = false;

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
      <ul className={css({ display: "flex", flexDirection: "column", gap: "16" })}>
        {posts.map(({ slug, frontmatter }) => (
          <li key={slug}>
            <PostCard slug={slug} title={frontmatter.title} date={frontmatter.date} />
          </li>
        ))}
      </ul>
    </main>
  );
}
