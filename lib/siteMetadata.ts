export const SITE_NAME = "65banseki の技術ブログ";
export const SITE_URL = "https://www.65banseki.dev";
export const SITE_DESCRIPTION = "65banseki の技術ブログ。自分の手で試した記録を残しています。";

export const siteOpenGraph = {
  siteName: SITE_NAME,
  locale: "ja_JP",
};

// alternates は親から子へ渡るが子で丸ごと上書きされるので、canonical を持つ全ページで次の同じ値を渡す
export const feedAlternateTypes = {
  "application/rss+xml": [{ url: "/feed.xml", title: SITE_NAME }],
};
