import path from "node:path";
import { buildRssFeed } from "./buildRssFeed";
import { createPostReader } from "../../lib/createPostReader";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../../lib/siteMetadata";

const FEED_ITEM_LIMIT = 20;
const postReader = createPostReader(path.join(process.cwd(), "content"));

async function getFeedXml() {
  "use cache";

  const posts = await postReader.getAllPosts();

  return buildRssFeed({
    title: SITE_NAME,
    siteUrl: SITE_URL,
    feedUrl: `${SITE_URL}/feed.xml`,
    description: SITE_DESCRIPTION,
    items: posts.slice(0, FEED_ITEM_LIMIT).map(({ slug, frontmatter }) => ({
      title: frontmatter.title,
      url: `${SITE_URL}/posts/${slug}`,
      date: frontmatter.date,
      tags: frontmatter.tags,
    })),
  });
}

export async function GET() {
  return new Response(await getFeedXml(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
