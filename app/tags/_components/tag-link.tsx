"use client";

import { Tag } from "../../_components/tag";

export function TagLink({ tag }: { tag: string }) {
  return <Tag tag={tag} onClick={() => window.umami?.track("tag-click", { tag })} />;
}
