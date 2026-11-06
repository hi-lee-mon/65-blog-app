"use client";

import Link from "next/link";

export function TagLink({ tag }: { tag: string }) {
  return (
    <Link href={`/tags/${tag}`} onClick={() => window.umami?.track("tag-click", { tag })}>
      {tag}
    </Link>
  );
}
