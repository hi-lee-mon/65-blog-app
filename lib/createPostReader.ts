import { evaluate } from "@mdx-js/mdx";
import rehypeShiki from "@shikijs/rehype";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import * as runtime from "react/jsx-runtime";
import { VFile } from "vfile";
import { matter } from "vfile-matter";
import * as v from "valibot";

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const TAG_PATTERN = /^[a-z0-9]{1,18}$/;

const FrontmatterSchema = v.object({
  title: v.pipe(v.string(), v.nonEmpty()),
  date: v.pipe(v.string(), v.isoDate()),
  tags: v.pipe(v.array(v.pipe(v.string(), v.regex(TAG_PATTERN))), v.minLength(1), v.maxLength(5)),
});

function isFileNotFound(error: unknown) {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

export function createPostReader(contentDir: string) {
  async function readPostFile(slug: string) {
    const filePath = path.join(contentDir, `${slug}.mdx`);
    const file = new VFile({
      path: filePath,
      value: await readFile(filePath, "utf8"),
    });
    matter(file, { strip: true });
    const result = v.safeParse(FrontmatterSchema, file.data.matter);

    if (!result.success) {
      throw new Error(
        `${slug}.mdx の frontmatter が正しくありません\n${v.summarize(result.issues)}`,
      );
    }

    return { file, frontmatter: result.output };
  }

  async function getPost(slug: string) {
    if (!SLUG_PATTERN.test(slug)) return null;
    try {
      const { file, frontmatter } = await readPostFile(slug);

      const { default: Content } = await evaluate(file, {
        ...runtime,
        rehypePlugins: [
          [
            rehypeShiki,
            {
              themes: { light: "github-light", dark: "github-dark" },
              defaultColor: "light-dark()",
            },
          ],
        ],
      });

      return { frontmatter, Content };
    } catch (error) {
      if (isFileNotFound(error)) return null;
      throw error;
    }
  }

  async function getAllSlugs(): Promise<string[]> {
    const files = await readdir(contentDir);
    return files.filter((file) => file.endsWith(".mdx")).map((file) => file.replace(/\.mdx$/, ""));
  }

  async function getAllPosts() {
    const slugs = await getAllSlugs();
    const posts = await Promise.all(
      slugs.map(async (slug) => {
        const { frontmatter } = await readPostFile(slug);
        return { slug, frontmatter };
      }),
    );
    return posts.toSorted((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));
  }

  async function getAllTags() {
    const posts = await getAllPosts();
    const tags = posts.flatMap((post) => post.frontmatter.tags);
    return [...new Set(tags)].toSorted();
  }

  async function getPostsByTag(tag: string) {
    const posts = await getAllPosts();
    return posts.filter((post) => post.frontmatter.tags.includes(tag));
  }

  return { getPost, getAllSlugs, getAllPosts, getAllTags, getPostsByTag };
}
