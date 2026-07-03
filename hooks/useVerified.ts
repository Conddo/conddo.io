import { useApiQuery } from "./useApiQuery";
import { meQuery, type Me } from "@/lib/api/account";

/**
 * Whether the signed-in user has verified their email. Reads from the same
 * /me query the shell uses, so no extra request. Returns `true` while loading
 * to avoid flashing gates on refresh — the banner is what surfaces the
 * unverified state; individual buttons should not judge until we know.
 */
export function useVerified(): boolean {
  const { data } = useApiQuery<Me>(meQuery);
  if (!data) return true;
  return data.user.emailVerified;
}
