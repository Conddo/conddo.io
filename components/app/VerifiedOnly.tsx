"use client";

import { type ReactNode, cloneElement, isValidElement } from "react";
import { useVerified } from "@/hooks/useVerified";

/**
 * Wraps an action element (Button / Link) and disables it when the current
 * user's email isn't verified. Adds a title tooltip explaining why. Use for
 * publish, payment-processing, and automation-firing buttons — anywhere the
 * business owner would fire something that reaches the outside world.
 *
 * Non-blocking discovery: the wrapped element still renders, still shows its
 * label. It just can't fire. This matches the spec: "explore, configure —
 * publishing and payments unlock once you verify."
 */
export function VerifiedOnly({
  children,
  message = "Verify your email to enable this. Check your inbox for the link, or resend from the banner.",
}: {
  children: ReactNode;
  message?: string;
}) {
  const verified = useVerified();
  if (verified) return <>{children}</>;
  if (!isValidElement(children)) return <>{children}</>;
  const props = children.props as { disabled?: boolean; title?: string; className?: string };
  return cloneElement(children, {
    ...props,
    disabled: true,
    title: message,
    className: `${props.className ?? ""} cursor-not-allowed opacity-60`,
  } as Record<string, unknown>);
}
