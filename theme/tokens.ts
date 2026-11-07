import { defineTokens } from "@pandacss/dev";

export const tokens = defineTokens({
  colors: {
    white: { value: "#ffffff" },
    black: { value: "#000000" },
    gray: {
      50: { value: "#f2f2f2" },
      100: { value: "#e6e6e6" },
      200: { value: "#cccccc" },
      300: { value: "#b3b3b3" },
      400: { value: "#999999" },
      500: { value: "#7f7f7f" },
      600: { value: "#666666" },
      700: { value: "#4d4d4d" },
      800: { value: "#333333" },
      900: { value: "#1a1a1a" },
    },
    blue: {
      50: { value: "#e8f1fe" },
      100: { value: "#d9e6ff" },
      200: { value: "#c5d7fb" },
      300: { value: "#9db7f9" },
      400: { value: "#7096f8" },
      500: { value: "#4979f5" },
      600: { value: "#3460fb" },
      700: { value: "#264af4" },
      800: { value: "#0031d8" },
      900: { value: "#0017c1" },
      1000: { value: "#00118f" },
      1100: { value: "#000071" },
      1200: { value: "#000060" },
    },
  },
  fonts: {
    sans: {
      value:
        // 英数字はgeist.geistに日本語は含まれないので次点のHiragino Sansが採用
        // Hiragino SansはmacOSとiOSに同梱されており、なければNoto Sans JPが使われる
        'var(--font-geist-sans), "Hiragino Sans", "Noto Sans JP", sans-serif',
    },
    mono: { value: "var(--font-geist-mono), monospace" },
  },
  fontSizes: {
    14: { value: "0.875rem" },
    16: { value: "1rem" },
    18: { value: "1.125rem" },
    20: { value: "1.25rem" },
    24: { value: "1.5rem" },
    28: { value: "1.75rem" },
    32: { value: "2rem" },
    36: { value: "2.25rem" },
  },
  fontWeights: {
    normal: { value: "400" },
    bold: { value: "700" },
  },
  lineHeights: {
    100: { value: "1" },
    140: { value: "1.4" },
    150: { value: "1.5" },
    170: { value: "1.7" },
  },
  spacing: {
    // pandaは自動で0を除いたマイナスの方向も作ってくれるのでcodegenすると計17のトークンを生成してくれる
    0: { value: "0" },
    4: { value: "0.25rem" },
    8: { value: "0.5rem" },
    16: { value: "1rem" },
    24: { value: "1.5rem" },
    32: { value: "2rem" },
    40: { value: "2.5rem" },
    48: { value: "3rem" },
    64: { value: "4rem" },
  },
  sizes: {
    full: { value: "100%" },
    640: { value: "40rem" },
  },
  letterSpacings: {
    0: { value: "0" },
    1: { value: "0.01em" },
    2: { value: "0.02em" },
  },
});
