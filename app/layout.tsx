import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { SITE_NAME, siteOpenGraph } from "../lib/siteMetadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.65banseki.dev"),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "65banseki の技術ブログ。自分の手で試した記録を残しています。",
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
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Link href="/">ホーム</Link>
        {children}
      </body>
    </html>
  );
}
