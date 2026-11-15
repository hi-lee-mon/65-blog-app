import { defineTextStyles } from "@pandacss/dev";

export const textStyles = defineTextStyles({
  heading: {
    1: {
      value: { fontSize: "32", fontWeight: "bold", lineHeight: "150", letterSpacing: "1" },
    },
    2: {
      value: { fontSize: "24", fontWeight: "bold", lineHeight: "150", letterSpacing: "2" },
    },
  },
  body: {
    value: { fontSize: "16", fontWeight: "normal", lineHeight: "170", letterSpacing: "2" },
  },
});
