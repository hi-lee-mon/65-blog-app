"use client";

import { startTransition, useId, useState, ViewTransition, type ReactNode } from "react";
import { css, cx } from "../../styled-system/css";
import { linkStyleRaw } from "./style/link";

type NoteCardProps = {
  slug: string;
  title: string;
  date: string;
  children: ReactNode;
  headingLevel?: "h2" | "h3";
};

const bodyStyle = css({
  "& > * + *": { marginTop: "8" },
  "& ul": { listStyleType: "disc", paddingInlineStart: "24" },
  "& a": linkStyleRaw,
  "& pre": { padding: "16", overflowX: "auto" },
});

const surfaceStyle = css({
  position: "absolute",
  inset: "0",
  // 枠を文字の後ろに回す。トークンにしないのは、重なり順を指定するのがここ1か所だけのため
  zIndex: "[-1]",
  borderWidth: "1",
  borderColor: "border.default",
  borderRadius: "8",
  bg: "bg.default",
});

export function NoteCard({ slug, title, date, children, headingLevel = "h2" }: NoteCardProps) {
  const Heading = headingLevel;
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const name = `note-${slug}`;

  const openDialog = () => startTransition(() => setOpen(true));
  const closeDialog = () => startTransition(() => setOpen(false));

  return (
    <div
      className={css({
        position: "relative",
        isolation: "isolate",
        display: "flex",
        flexDirection: "column",
        gap: "8",
        padding: "16",
      })}
    >
      {open ? (
        <div className={surfaceStyle} />
      ) : (
        <ViewTransition name={name} share="auto" default="none">
          <div className={surfaceStyle} />
        </ViewTransition>
      )}
      <Heading className={css({ fontSize: "18", fontWeight: "bold" })}>
        <button
          type="button"
          onClick={openDialog}
          className={css({
            textAlign: "start",
            cursor: "pointer",
            _after: { content: '""', position: "absolute", inset: "0" },
          })}
        >
          {title}
        </button>
      </Heading>
      <time dateTime={date} className={css({ color: "fg.muted", fontSize: "14" })}>
        {date}
      </time>
      <div
        inert
        className={cx(
          bodyStyle,
          css({
            maxHeight: "192",
            overflow: "hidden",
            maskImage:
              "linear-gradient(to bottom, black calc({sizes.192} - {spacing.48}), transparent {sizes.192})",
          }),
        )}
      >
        {children}
      </div>
      {open && (
        <ViewTransition name={name} share="auto" default="none">
          <dialog
            closedby="any"
            ref={(el) => {
              el?.showModal();
              return () => el?.close();
            }}
            aria-labelledby={titleId}
            onCancel={(event) => {
              event.preventDefault();
              closeDialog();
            }}
            onClose={(event) => {
              // 無条件に閉じない。開発時は React が ref を付け直すため、開き直したあとに古い close が届く
              if (!event.currentTarget.open) setOpen(false);
            }}
            className={css({
              width: "full",
              // 狭い画面でも左右に 16 ずつ余白を残す。角かっこの中はトークンと割合だけで、新しい値は足していない
              maxWidth: "[min({sizes.640}, 100% - {spacing.32})]",
              margin: "auto",
              padding: "24",
              borderWidth: "1",
              borderColor: "border.default",
              borderRadius: "8",
              bg: "bg.default",
              color: "fg.default",
              "& > * + *": { marginTop: "8" },
            })}
          >
            <button type="button" onClick={closeDialog}>
              閉じる
            </button>
            <Heading id={titleId} className={css({ fontSize: "18", fontWeight: "bold" })}>
              {title}
            </Heading>
            <time dateTime={date} className={css({ color: "fg.muted", fontSize: "14" })}>
              {date}
            </time>
            <div className={bodyStyle}>{children}</div>
          </dialog>
        </ViewTransition>
      )}
    </div>
  );
}
