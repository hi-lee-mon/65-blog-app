import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  feedAlternateTypes,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  siteOpenGraph,
} from "../lib/siteMetadata";
import Script from "next/script";
import { css } from "../styled-system/css";
import { SiteHeader } from "./_components/site-header";
import { SiteFooter } from "./_components/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL), // 全ページのメタデータで継承される以降相対パスで書くことができる（/postsはhttps://www.65banseki.dev/postsになる）
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { types: feedAlternateTypes },
  openGraph: {
    ...siteOpenGraph,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@65banseki",
    creator: "@65banseki",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} ${css({ height: "full", fontSmoothing: "antialiased" })}`}
    >
      <body
        className={css({
          minHeight: "full",
          display: "flex",
          flexDirection: "column",
        })}
      >
        <a href="#main" className={css({ srOnly: true, _focusVisible: { srOnly: false } })}>
          本文へスキップ
        </a>
        <SiteHeader />
        <main id="main" className={css({ flex: "1" })}>
          {children}
        </main>
        <SiteFooter />
        {process.env.CF_WEB_ANALYTICS_TOKEN && (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({
              token: process.env.CF_WEB_ANALYTICS_TOKEN,
            })}
          />
        )}
        {process.env.UMAMI_WEBSITE_ID && (
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id={process.env.UMAMI_WEBSITE_ID}
            data-domains="www.65banseki.dev" // このホスト名のときだけ動く
          />
        )}
      </body>
    </html>
  );
}
