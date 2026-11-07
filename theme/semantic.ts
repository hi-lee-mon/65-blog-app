import { defineSemanticTokens } from "@pandacss/dev";

export const semanticTokens = defineSemanticTokens({
  colors: {
    bg: {
      default: { value: { base: "{colors.white}", _dark: "{colors.black}" } },
    },
    // foreground(背景の上に載っている文字のこと)
    fg: {
      default: {
        value: { base: "{colors.gray.900}", _dark: "{colors.gray.50}" },
      },
      muted: {
        value: { base: "{colors.gray.600}", _dark: "{colors.gray.400}" },
      },
    },
  },
});
