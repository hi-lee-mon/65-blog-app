import Link from "next/link";
import type { ComponentProps } from "react";
import { LinkPendingDot } from "./link-pending-dot";

type AppLinkProps = ComponentProps<typeof Link>;

export function AppLink({ children, ...props }: AppLinkProps) {
  return (
    <Link {...props}>
      {children}
      <LinkPendingDot />
    </Link>
  );
}
