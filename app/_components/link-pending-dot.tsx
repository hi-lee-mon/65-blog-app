"use client";

import { useLinkStatus } from "next/link";
import { css } from "../../styled-system/css";

export function LinkPendingDot() {
  const { pending } = useLinkStatus();

  return (
    // inline-block の幅 0 の入れ物にしないのは、atomic inline になって直前の文字との間で改行が起き、点だけ次の行の先頭に出ることがあるため
    // 出し入れ（外側）と点滅（内側）を分けたのは、同じ要素の opacity を animation と transition で取り合うと、点滅が始まった瞬間に 100ms の遅れが無効になるため
    <span
      aria-hidden
      className={css({
        position: "relative",
        opacity: pending ? "1" : "0",
        // prefers-reduced-motion で止めないのは、不透明度の変化は WCAG 2.3.3 の「動きのアニメーション」に当たらないため
        transition: "opacity",
        transitionDelay: pending ? "[100ms]" : "[0ms]",
      })}
    >
      <span
        className={css({
          position: "absolute",
          insetInlineStart: "4",
          insetBlock: "0",
          marginBlock: "auto",
          width: "8",
          height: "8",
          borderRadius: "full",
          bg: "currentColor",
          pointerEvents: "none",
          // 無限に繰り返さないのは、5 秒を超える自動の点滅に停止手段を求める WCAG 2.2.2 に収めるため（1.6 秒 × 3 回 = 4.8 秒）
          ...(pending && {
            animationName: "linkPendingPulse",
            animationDuration: "[1.6s]",
            animationTimingFunction: "[ease-in-out]",
            animationIterationCount: "3", // 1.6 秒 × 3 回 = 4.8 秒
          }),
        })}
      />
    </span>
  );
}
