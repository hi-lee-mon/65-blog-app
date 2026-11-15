import { definePreview } from "@storybook/nextjs-vite";
import addonDocs from "@storybook/addon-docs";
import addonA11y from "@storybook/addon-a11y";
import { Geist, Geist_Mono } from "next/font/google";
import "../app/globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// app/layout.tsx と同じく <html> に付けることでcss変数をstoryで読み込める
document.documentElement.classList.add(geistSans.variable, geistMono.variable);

export default definePreview({
  addons: [addonDocs(), addonA11y()],
  tags: ["autodocs"],
  parameters: {
    nextjs: { appDirectory: true },
    htmlLang: "ja",
  },
  initialGlobals: {
    viewport: { value: "mobile1", isRotated: false },
  },
});
