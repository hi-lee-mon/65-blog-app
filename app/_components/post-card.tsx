import { css, cx } from "../../styled-system/css";
import { AppLink } from "./app-link";
import { linkStyle } from "./style/link";

type PostCardProps = {
  slug: string;
  title: string;
  date: string;
  headingLevel?: "h2" | "h3";
};

export function PostCard({ slug, title, date, headingLevel = "h2" }: PostCardProps) {
  const Heading = headingLevel;

  return (
    <div
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
      <Heading>
        <AppLink href={`/posts/${slug}`} className={cx(linkStyle, css({ fontWeight: "bold" }))}>
          {title}
        </AppLink>
      </Heading>
    </div>
  );
}
