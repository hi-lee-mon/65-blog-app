type FeedItem = { title: string; url: string; date: string; tags: string[] };

type FeedInput = {
  title: string;
  siteUrl: string;
  feedUrl: string;
  description: string;
  items: FeedItem[];
};

// & を最後に置換すると、先に作った &lt; の & まで &amp; に変わってしまう
function escapeXml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function toItemXml({ title, url, date, tags }: FeedItem) {
  const escapedUrl = escapeXml(url);
  const categories = tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("");

  return `
<item>
  <title>${escapeXml(title)}</title>
  <link>${escapedUrl}</link>
  <guid isPermaLink="true">${escapedUrl}</guid>
  <pubDate>${new Date(date).toUTCString()}</pubDate>
  ${categories}
</item>`;
}

export function buildRssFeed({ title, siteUrl, feedUrl, description, items }: FeedInput) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${escapeXml(title)}</title>
<link>${escapeXml(siteUrl)}</link>
<description>${escapeXml(description)}</description>
<language>ja</language>
<atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>
${items.map(toItemXml).join("\n")}
</channel>
</rss>
`;
}
