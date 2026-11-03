import path from "node:path";
import { createPostReader } from "../../../lib/createPostReader";
import { notFound } from "next/navigation";
import Link from "next/link";

const { getAllSlugs, getPost } = createPostReader(path.join(process.cwd(), "content"));

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
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
    <article>
      <h1>{frontmatter.title}</h1>
      <time>{frontmatter.date}</time>
      <ul>
        {frontmatter.tags.map((tag) => (
          <li key={tag}>
            <Link href={`/tags/${tag}`}>{tag}</Link>
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
      <Content />
    </article>
  );
}
