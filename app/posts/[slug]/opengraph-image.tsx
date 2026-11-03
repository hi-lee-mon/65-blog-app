import path from "node:path";
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { createPostReader } from "../../../lib/createPostReader";

const { getAllSlugs, getPost } = createPostReader(path.join(process.cwd(), "content"));

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "記事のタイトルと公開日を載せた画像";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

async function getFrontmatter(slug: string) {
  "use cache";
  // use cacheが記録できるのはオブジェクトや文字列、数、配列のような中身がデータのものだけ
  // Imageの戻り値は記録できない。
  const post = await getPost(slug);
  return post?.frontmatter ?? null;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const frontmatter = await getFrontmatter(slug);
  if (frontmatter === null) notFound();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "white",
      }}
    >
      <div style={{ fontSize: 72 }}>{frontmatter.title}</div>
      <div style={{ fontSize: 32, color: "#555" }}>{frontmatter.date}</div>
    </div>,
    { ...size },
  );
}
