import path from "node:path";
import { Metadata } from "next";
import { createPostReader } from "../lib/createPostReader";
import { feedAlternateTypes, SITE_NAME, siteOpenGraph } from "../lib/siteMetadata";
import { css } from "../styled-system/css";
import { AppLink } from "./_components/app-link";
import { linkStyle } from "./_components/style/link";
import { NoteCard } from "./_components/note-card";
import { PageContainer } from "./_components/page-container";
import { PostCard } from "./_components/post-card";
import Image from "next/image";
import avatar from "./_assets/avatar.png";

const LATEST_COUNT = 3;
const postReader = createPostReader(path.join(process.cwd(), "content"));
const noteReader = createPostReader(path.join(process.cwd(), "content", "notes"));

export const metadata: Metadata = {
  alternates: { canonical: "/", types: feedAlternateTypes },
  openGraph: { ...siteOpenGraph, type: "website", url: "/" },
};

export default async function Home() {
  "use cache";

  const posts = (await postReader.getAllPosts()).slice(0, LATEST_COUNT);
  const latestNotes = (await noteReader.getAllPosts()).slice(0, LATEST_COUNT);
  const notes = await Promise.all(
    latestNotes.map(async ({ slug }) => ({
      slug,
      note: await noteReader.getPost(slug),
    })),
  );

  return (
    <PageContainer>
      <header
        className={css({
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "16",
          marginBlockEnd: "48",
        })}
      >
        <Image
          src={avatar}
          // アバターは読み上げる必要ないのでaltはあえて空文字にする
          alt=""
          width={96}
          height={96}
          placeholder="blur"
          className={css({ borderRadius: "full" })}
        />
        <div>
          <h1 className={css({ textStyle: "heading.1" })}>{SITE_NAME}</h1>
          <p>自分の手で試した記録を残しています。</p>
        </div>
      </header>
      <section aria-labelledby="latest-posts" className={css({ marginBlockEnd: "48" })}>
        <h2 id="latest-posts" className={css({ textStyle: "heading.2", marginBlockEnd: "16" })}>
          最新の記事
        </h2>
        <ul
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: "16",
          })}
        >
          {posts.map(({ slug, frontmatter }) => (
            <li key={slug}>
              <PostCard
                slug={slug}
                title={frontmatter.title}
                date={frontmatter.date}
                headingLevel="h3"
              />
            </li>
          ))}
        </ul>
        <p className={css({ marginBlockStart: "16" })}>
          <AppLink href="/posts" className={linkStyle}>
            記事をすべて見る
          </AppLink>
        </p>
      </section>
      <section aria-labelledby="latest-notes">
        <h2 id="latest-notes" className={css({ textStyle: "heading.2", marginBlockEnd: "16" })}>
          最新のふせん
        </h2>
        <ul
          className={css({
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 16rem), 1fr))",
            gap: "16",
          })}
        >
          {notes.map(({ slug, note }) =>
            note ? (
              <li key={slug}>
                <NoteCard
                  slug={slug}
                  title={note.frontmatter.title}
                  date={note.frontmatter.date}
                  headingLevel="h3"
                >
                  <note.Content />
                </NoteCard>
              </li>
            ) : null,
          )}
        </ul>
        <p className={css({ marginBlockStart: "16" })}>
          <AppLink href="/notes" className={linkStyle}>
            ふせんをすべて見る
          </AppLink>
        </p>
      </section>
    </PageContainer>
  );
}
