import Link from "next/link";
import { css } from "../../styled-system/css";

type PostCardProps = { slug: string; title: string; date: string };

export function PostCard({ slug, title, date }: PostCardProps) {
  return (
    <article
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "4",
        padding: "16",
        borderWidth: "1",
        borderColor: "border.default",
        borderRadius: "8",
      })}
    >
      <time dateTime={date} className={css({ color: "fg.muted", fontSize: "14" })}>
        {date}
      </time>
      <Link
        href={`/posts/${slug}`}
        className={css({
          color: "fg.link",
          textDecoration: "underline",
          fontWeight: "bold",
        })}
      >
        {title}
      </Link>
    </article>
  );
}
