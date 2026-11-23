import path from "node:path";
import type { MetadataRoute } from "next";
import { createPostReader } from "../lib/createPostReader";
import { SITE_URL } from "../lib/siteMetadata";

const FIXED_PATHS = ["", "/posts", "/notes", "/tags", "/design-system"];
const postReader = createPostReader(path.join(process.cwd(), "content"));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";

  const [slugs, tags] = await Promise.all([postReader.getAllSlugs(), postReader.getAllTags()]);
  const paths = [
    ...FIXED_PATHS,
    ...slugs.map((slug) => `/posts/${slug}`),
    ...tags.map((tag) => `/tags/${tag}`),
  ];

  return paths.map((pathname) => ({ url: `${SITE_URL}${pathname}` }));
}
