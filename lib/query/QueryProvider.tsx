"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ApiError } from "@/lib/api/client";

/**
 * Root React Query provider. Mount once at the top of the authed shell (or the
 * whole app if you also want it on marketing pages).
 *
 * <p>Defaults are tuned for a live SaaS dashboard, not a static blog:
 * <ul>
 *   <li><b>staleTime 30s</b> — most screens don't need to refetch on every
 *       mount; the previous {@code useApiQuery} refetched every time and
 *       caused visible flicker + wasted requests. A 30s cache eliminates the
 *       thundering herd when a user tab-hops between sidebar sections.</li>
 *   <li><b>gcTime 5 min</b> — data stays in memory long enough for the same
 *       screen to bounce back instantly after a nav.</li>
 *   <li><b>retry: never on 4xx</b> — a 401 (session expired) or a 403 (plan
 *       gate) is a definitive answer; retrying wastes credits and delays the
 *       login bounce. 5xx retries once (Render cold-start).</li>
 *   <li><b>refetchOnWindowFocus off</b> — the visible flash on tab-switch
 *       reads as "loading" and confuses ops staff; explicit invalidation is
 *       clearer than opaque background updates.</li>
 * </ul>
 *
 * <p>Instantiate the client in state so it survives Fast Refresh without
 * resetting cache mid-development. Do NOT hoist it to module scope — that
 * shares the cache across every browser tab of every user during a
 * server-render, which is a cross-user data leak in Next.js.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
                return false;
              }
              return failureCount < 1;
            },
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
