import { defineConfig } from "@pandacss/dev";
import { tokens } from "./theme/tokens";
import { semanticTokens } from "./theme/semantic";
import { textStyles } from "./theme/text-styles";

export default defineConfig({
  presets: ["@pandacss/preset-base"],
  preflight: true,
  strictTokens: true, // themeにない値の指定を禁止する
  include: ["./app/**/*.{ts,tsx}"],
  exclude: [],
  conditions: {
    extend: {
      dark: "@media (prefers-color-scheme: dark)",
    },
  },
  globalCss: {
    ":root": {
      colorScheme: "light dark",
      "--global-font-body": "{fonts.sans}",
      "--global-font-mono": "{fonts.mono}",
    },
    body: {
      background: "bg.default",
      color: "fg.default",
      fontSize: "16",
      lineHeight: "170",
    },
  },
  theme: {
    // カスタムテーマ
    tokens,
    semanticTokens,
    textStyles,
  },
  outdir: "styled-system",
});
