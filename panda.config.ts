import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  presets: ["@pandacss/preset-base", "@pandacss/preset-panda"],
  preflight: true,
  include: ["./app/**/*.{ts,tsx}"],
  exclude: [],
  globalCss: {
    ":root": {
      colorScheme: "light dark",
      "--global-font-body": "var(--font-geist-sans)",
      "--global-font-mono": "var(--font-geist-mono)",
    },
    body: {
      background: { base: "#ffffff", _osDark: "#0a0a0a" },
      color: { base: "#171717", _osDark: "#ededed" },
      fontFamily: "Arial, Helvetica, sans-serif",
    },
  },
  theme: {
    extend: {},
  },
  outdir: "styled-system",
});
