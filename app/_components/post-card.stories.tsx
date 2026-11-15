import preview from "../../.storybook/preview";
import { PostCard } from "./post-card";

const meta = preview.meta({
  component: PostCard,
  args: {
    slug: "blog",
    title: "ブログを作り始めた",
    date: "2026-09-25",
  },
});

export const Default = meta.story({});

export const LongTitle = Default.extend({
  args: {
    title: "とても長い題名がスマートフォンの幅でどう折り返されるかを確かめるための記事",
  },
});
