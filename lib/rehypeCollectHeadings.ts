import type { Root } from "hast";
import { toString } from "hast-util-to-string";
import type { VFile } from "vfile";

export type Heading = {
  id: string;
  text: string;
};

declare module "vfile" {
  interface DataMap {
    headings: Heading[];
  }
}

export function rehypeCollectHeadings() {
  return (tree: Root, file: VFile) => {
    const headings: Heading[] = [];

    for (const node of tree.children) {
      if (node.type !== "element" || node.tagName !== "h2") continue;

      const id = node.properties.id;
      if (typeof id !== "string") continue;

      headings.push({ id, text: toString(node) });
    }

    file.data.headings = headings;
  };
}
