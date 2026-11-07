import { defineConfig } from "@pandacss/dev";
import { tokens } from "./theme/tokens";

export default defineConfig({
  presets: ["@pandacss/preset-base"],
  preflight: true,
  strictTokens: true, // themeにない値の指定を禁止する
  include: ["./app/**/*.{ts,tsx}"],
  exclude: [],
  globalCss: {
    ":root": {
      colorScheme: "light dark",
      "--global-font-body": "{fonts.sans}",
      "--global-font-mono": "{fonts.mono}",
    },
    body: {
      background: { base: "white", _osDark: "black" },
      color: { base: "gray.900", _osDark: "gray.50" },
      fontSize: "16",
      lineHeight: "170",
    },
  },

  theme: {
    tokens, // カスタムテーマ
  },
  outdir: "styled-system",
});
