import { css } from "../../../styled-system/css";
import { linkStyleRaw } from "../../_components/style/link";

export const prose = css({
  textStyle: "body",
  "& h2": { textStyle: "heading.2", marginTop: "48", marginBottom: "16" },
  "& p": { marginBottom: "16" },
  "& a": linkStyleRaw,
  "& pre": { padding: "16", overflowX: "auto", marginBottom: "16" },
  "& code": { letterSpacing: "0" },
});
