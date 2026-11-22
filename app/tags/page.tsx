import path from "node:path";
import { createPostReader } from "../../lib/createPostReader";
import { Metadata, ResolvingMetadata } from "next";
import { siteOpenGraph } from "../../lib/siteMetadata";
import { TagLink } from "./_components/tag-link";
import { css } from "../../styled-system/css";
import { PageContainer } from "../_components/page-container";
import { PageHeader } from "../_components/page-header";

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
    <PageContainer>
      <PageHeader parents={[{ href: "/", label: "ホーム" }]} title="タグ一覧" />
      <ul className={css({ display: "flex", flexWrap: "wrap", gap: "8" })}>
        {tags.map((tag) => (
          <li key={tag}>
            <TagLink tag={tag} />
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
