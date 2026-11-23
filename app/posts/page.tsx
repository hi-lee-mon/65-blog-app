import path from "node:path";
import { createPostReader } from "../../lib/createPostReader";
import { Metadata, ResolvingMetadata } from "next";
import { feedAlternateTypes, siteOpenGraph } from "../../lib/siteMetadata";
import { css } from "../../styled-system/css";
import { PostCard } from "../_components/post-card";
import { PageContainer } from "../_components/page-container";
import { PageHeader } from "../_components/page-header";

const { getAllPosts } = createPostReader(path.join(process.cwd(), "content"));

export async function generateMetadata(
  _props: PageProps<"/posts">,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // openGraphを上書きすると親で指定したopengraph-imageを上書きしてしまうため、parentで参照
  const { openGraph } = await parent;
  return {
    title: "記事一覧",
    alternates: { canonical: "/posts", types: feedAlternateTypes },
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
    <PageContainer>
      <PageHeader parents={[{ href: "/", label: "ホーム" }]} title="記事一覧" />
      <ul className={css({ display: "flex", flexDirection: "column", gap: "16" })}>
        {posts.map(({ slug, frontmatter }) => (
          <li key={slug}>
            <PostCard slug={slug} title={frontmatter.title} date={frontmatter.date} />
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
