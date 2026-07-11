"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Result } from "@/lib/api/types";

/**
 * Successor to {@code useApiQuery}. Uses React Query under the hood so:
 * <ul>
 *   <li>The same resource read from two components deduplicates to a single
 *       request (kills the N-fold refetch storm on any screen that mounts a
 *       list + a sidebar summary of the same endpoint).</li>
 *   <li>Cache survives tab hops and route transitions (see {@code staleTime}
 *       in {@code QueryProvider}), so "back to the list" is instant.</li>
 *   <li>Mutations elsewhere can invalidate the key and every consumer
 *       refetches in lockstep — no bespoke "resetX" globals like the old
 *       {@code resetManifests()} function.</li>
 * </ul>
 *
 * <p>Signature intentionally mirrors {@code useApiQuery}'s return shape
 * ({@code data / loading / error / refetch}) so a per-screen migration is a
 * two-line change: import from here instead of {@code useApiQuery}, add a
 * cache key. All the calling components' props flow untouched.
 *
 * <p>The {@code key} MUST include every input that varies the result — a
 * tenant slug, a filter, a page number. Cache keys are the deduplication
 * boundary; two different queries sharing a key silently corrupts data.
 */
export function useResource<T>(
  key: readonly unknown[],
  fetcher: () => Promise<Result<T>>,
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  raw: UseQueryResult<Result<T>>;
} {
  const query = useQuery<Result<T>>({
    queryKey: key,
    queryFn: fetcher,
  });

  return {
    data: query.data?.data ?? null,
    loading: query.isPending,
    error: (query.error as Error) ?? null,
    refetch: () => {
      void query.refetch();
    },
    raw: query,
  };
}
