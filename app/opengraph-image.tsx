import { ImageResponse } from "next/og";
import { SITE_NAME } from "../lib/siteMetadata";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "サイト名を載せた画像";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "white",
        fontSize: 80,
      }}
    >
      {SITE_NAME}
    </div>,
    { ...size },
  );
}
