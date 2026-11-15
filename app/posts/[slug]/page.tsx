import path from "node:path";
import { createPostReader } from "../../../lib/createPostReader";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { siteOpenGraph } from "../../../lib/siteMetadata";
import { css } from "../../../styled-system/css";
import { prose } from "./prose";
import { Tag } from "../../_components/tag";

const { getAllSlugs, getPost } = createPostReader(path.join(process.cwd(), "content"));

// 本体・generateMetadata・opengraph-image.tsx のすべてが params を読む。
// 本体は <Suspense> に移せるが、メタデータの2つは <head> に入るので移せず、警告が残る。
// ADR 20261115-0059-instant-false-for-dynamic-routes.md
export const instant = false;

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/posts/[slug]">): Promise<Metadata> {
  "use cache";

  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: post.frontmatter.title,
    alternates: { canonical: `/posts/${slug}` },
    openGraph: {
      ...siteOpenGraph,
      type: "article",
      publishedTime: post.frontmatter.date,
      url: `/posts/${slug}`,
    },
  };
}

export default async function Page({ params }: PageProps<"/posts/[slug]">) {
  "use cache";

  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const { frontmatter, Content, headings } = post;

  return (
    <article
      className={css({
        width: "full",
        maxWidth: "640",
        marginX: "auto",
        paddingX: "16",
        paddingY: "48",
      })}
    >
      <h1 className={css({ textStyle: "heading.1" })}>{frontmatter.title}</h1>
      <time className={css({ color: "fg.muted" })}>{frontmatter.date}</time>
      <ul className={css({ display: "flex", flexWrap: "wrap", gap: "8" })}>
        {frontmatter.tags.map((tag) => (
          <li key={tag}>
            <Tag tag={tag} size="sm" />
          </li>
        ))}
      </ul>
      {headings.length > 0 && (
        <nav aria-label="目次">
          <ol>
            {headings.map(({ id, text }) => (
              <li key={id}>
                <a href={`#${id}`}>{text}</a>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <hr />
      <div className={prose}>
        <Content />
      </div>
    </article>
  );
}
