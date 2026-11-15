import Link from "next/link";
import { cva, type RecipeVariantProps } from "../../styled-system/css";

export const tagStyle = cva({
  base: {
    display: "inline-block",
    borderWidth: "1",
    borderColor: "border.default",
    borderRadius: "full",
    color: "fg.default",
    lineHeight: "150",
  },
  variants: {
    size: {
      sm: { fontSize: "14", paddingX: "8", paddingY: "4" },
      md: { fontSize: "16", paddingX: "16", paddingY: "4" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type TagProps = { tag: string; onClick?: () => void } & RecipeVariantProps<typeof tagStyle>;

export function Tag({ tag, size, onClick }: TagProps) {
  return (
    <Link href={`/tags/${tag}`} className={tagStyle({ size })} onClick={onClick}>
      {tag}
    </Link>
  );
}
