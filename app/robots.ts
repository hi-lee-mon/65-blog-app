import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/siteMetadata";

export default function robots(): MetadataRoute.Robots {
  return {
    // 全ユーザーエージェントは全てのページを閲覧することができる
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
