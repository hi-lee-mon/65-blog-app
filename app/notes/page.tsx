import path from "node:path";
import { Metadata, ResolvingMetadata } from "next";
import { createPostReader } from "../../lib/createPostReader";
import { siteOpenGraph } from "../../lib/siteMetadata";
import { css } from "../../styled-system/css";
import { Breadcrumb } from "../_components/breadcrumb";
import { NoteCard } from "../_components/note-card";

const { getAllPosts, getPost } = createPostReader(path.join(process.cwd(), "content", "notes"));

export async function generateMetadata(
  _props: PageProps<"/notes">,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { openGraph } = await parent;
  return {
    title: "付箋",
    alternates: { canonical: "/notes" },
    openGraph: {
      ...siteOpenGraph,
      type: "website",
      url: "/notes",
      images: openGraph?.images,
    },
  };
}

export default async function Page() {
  "use cache";

  const list = await getAllPosts();
  const notes = await Promise.all(
    list.map(async ({ slug }) => ({ slug, note: await getPost(slug) })),
  );

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
      <Breadcrumb parents={[{ href: "/", label: "ホーム" }]} current="付箋" />
      <h1>付箋</h1>
      <p>記事になる前の、書きかけの短いメモです。</p>
      <ul
        className={css({
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 16rem), 1fr))",
          gap: "16",
          "@supports (display: grid-lanes)": {
            display: "grid-lanes",
          },
        })}
      >
        {notes.map(({ slug, note }) =>
          note ? (
            <li key={slug}>
              <NoteCard slug={slug} title={note.frontmatter.title} date={note.frontmatter.date}>
                <note.Content />
              </NoteCard>
            </li>
          ) : null,
        )}
      </ul>
    </div>
  );
}
