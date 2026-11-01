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
  async function getPost(slug: string) {
    if (!SLUG_PATTERN.test(slug)) return null;
    try {
      const filePath = path.join(contentDir, `${slug}.mdx`);
      const file = new VFile({
        path: filePath,
        value: await readFile(path.join(contentDir, `${slug}.mdx`), "utf8"),
      });
      matter(file, { strip: true });
      const frontmatter = file.data.matter as MyFrontmatter;
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

  return { getPost, getAllSlugs };
}
