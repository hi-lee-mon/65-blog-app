import { evaluate } from "@mdx-js/mdx";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import * as runtime from "react/jsx-runtime";
import { VFile } from "vfile";
import { matter } from "vfile-matter";

const SLUG_PATTERN = /^[a-z0-9-]+$/;

type MyFrontmatter = {
  title: string;
  date: string;
};

export function createPostReader(contentDir: string) {
  async function readPostFile(slug: string) {
    const filePath = path.join(contentDir, `${slug}.mdx`);
    const file = new VFile({
      path: filePath,
      value: await readFile(filePath, "utf8"),
    });
    matter(file, { strip: true });
    const frontmatter = file.data.matter as MyFrontmatter;
    return { file, frontmatter };
  }

  async function getPost(slug: string) {
    if (!SLUG_PATTERN.test(slug)) return null;
    try {
      const { file, frontmatter } = await readPostFile(slug);
      const { default: Content } = await evaluate(file, runtime);
      return { frontmatter, Content };
    } catch {
      return null;
    }
  }

  async function getAllSlugs(): Promise<string[]> {
    const files = await readdir(contentDir);
    return files
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => file.replace(/\.mdx$/, ""));
  }

  async function getAllPosts() {
    const slugs = await getAllSlugs();
    const posts = await Promise.all(
      slugs.map(async (slug) => {
        const { frontmatter } = await readPostFile(slug);
        return { slug, frontmatter };
      }),
    );
    return posts.toSorted((a, b) =>
      b.frontmatter.date.localeCompare(a.frontmatter.date),
    );
  }

  return { getPost, getAllSlugs, getAllPosts };
}
