import type { ComponentProps } from "react";
import { css } from "../../styled-system/css";
import { Breadcrumb } from "./breadcrumb";

type PageHeaderProps = {
  parents: ComponentProps<typeof Breadcrumb>["parents"];
  title: string;
  // パンくずの文言が見出しと違うページだけ渡す
  current?: string;
  description?: string;
};

export function PageHeader({ parents, title, current = title, description }: PageHeaderProps) {
  return (
    <header className={css({ marginBlockEnd: "24" })}>
      <Breadcrumb parents={parents} current={current} />
      <h1 className={css({ textStyle: "heading.1" })}>{title}</h1>
      {description && <p className={css({ color: "fg.muted" })}>{description}</p>}
    </header>
  );
}
