import { Metadata, ResolvingMetadata } from "next";
import { feedAlternateTypes, siteOpenGraph } from "../../lib/siteMetadata";
import { css } from "../../styled-system/css";
import { Tag } from "../_components/tag";
import { PostCard } from "../_components/post-card";

export async function generateMetadata(
  _props: PageProps<"/design-system">,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // openGraphを上書きすると親で指定したopengraph-imageを上書きしてしまうため、parentで参照
  const { openGraph } = await parent;
  return {
    title: "デザインシステム",
    alternates: { canonical: "/design-system", types: feedAlternateTypes },
    openGraph: {
      ...siteOpenGraph,
      type: "website",
      url: "/design-system",
      images: openGraph?.images,
    },
  };
}

const section = css({
  display: "flex",
  flexDirection: "column",
  gap: "16",
  marginTop: "48",
});

export default function Page() {
  return (
    <div
      className={css({
        width: "full",
        maxWidth: "640",
        marginX: "auto",
        paddingX: "16",
        paddingY: "48",
      })}
    >
      <h1 className={css({ textStyle: "heading.1" })}>デザインシステム</h1>

      <section className={section}>
        <h2 className={css({ textStyle: "heading.2" })}>Tag</h2>
        <div
          className={css({
            display: "flex",
            flexWrap: "wrap",
            gap: "8",
            alignItems: "center",
          })}
        >
          <Tag tag="blog" size="sm" />
          <Tag tag="css" size="md" />
        </div>
      </section>

      <section className={section}>
        <h2 className={css({ textStyle: "heading.2" })}>PostCard</h2>
        <PostCard
          slug="blog"
          title="65banseki.devを作ってみた"
          date="2026-11-06"
          headingLevel="h3"
        />
      </section>
    </div>
  );
}
