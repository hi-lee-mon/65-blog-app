import { css } from "../../../styled-system/css";
import { linkStyleRaw } from "../../_components/style/link";

export const prose = css({
  textStyle: "body",
  "& h2": { textStyle: "heading.2", marginTop: "48", marginBottom: "16" },
  "& p": { marginBottom: "16" },
  "& a": linkStyleRaw,
  "& pre": { padding: "16", overflowX: "auto", marginBottom: "16" },
  "& code": { letterSpacing: "0" },
  "& table": { width: "full", borderCollapse: "collapse", marginBottom: "16" },
  "& th, & td": {
    borderWidth: "1",
    borderColor: "border.default",
    padding: "8",
    textAlign: "start",
  },
});
