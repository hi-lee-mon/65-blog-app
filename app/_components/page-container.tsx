import type { ReactNode } from "react";
import { css } from "../../styled-system/css";

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div
      className={css({
        width: "full",
        maxWidth: "640",
        marginX: "auto",
        paddingX: "16",
        paddingY: "48",
      })}
    >
      {children}
    </div>
  );
}
