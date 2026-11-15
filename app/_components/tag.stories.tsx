import preview from "../../.storybook/preview";
import { Tag } from "./tag";

const meta = preview.meta({
  component: Tag,
  args: { tag: "react" },
});

export const Medium = meta.story({});

export const Small = Medium.extend({
  args: { size: "sm" },
});
