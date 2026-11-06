import path from "node:path";
import Link from "next/link";
import { createPostReader } from "../../lib/createPostReader";
import { Metadata, ResolvingMetadata } from "next";
import { siteOpenGraph } from "../../lib/siteMetadata";

const { getAllTags } = createPostReader(path.join(process.cwd(), "content"));

export async function generateMetadata(
  _props: PageProps<"/tags">,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // openGraphを上書きすると親で指定したopengraph-imageを上書きしてしまうため、parentで参照
  const { openGraph } = await parent;
  return {
    title: "タグ一覧",
    alternates: { canonical: "/tags" },
    openGraph: {
      ...siteOpenGraph,
      type: "website",
      url: "/tags",
      images: openGraph?.images,
    },
  };
}

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
