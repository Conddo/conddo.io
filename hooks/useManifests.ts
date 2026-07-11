"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { decodeJwt } from "@/lib/jwt";
import type { UIManifest } from "@/lib/manifest/types";

// Module-level cache so the manifests are fetched once per session, not per hook use.
let cache: UIManifest[] | null = null;
const listeners = new Set<() => void>();

/** Clear the cached manifests. Call on logout, or after a Settings > Modules
 *  toggle — the sidebar re-fetches so the change lands without re-login. */
export function resetManifests(): void {
  cache = null;
  for (const l of listeners) l();
}

/**
 * Fetches the tenant's UI manifests (Architecture v1.0 §16). Source order:
 *   1. Live effective set via {@code GET /tenant/modules/active} — the tenant's
 *      current vertical/plan preset ∪ opt-ins − opt-outs, computed server-side.
 *      Preferred because opt-in/out changes take effect immediately without
 *      waiting for the JWT to expire.
 *   2. JWT {@code activeModules} claim — same set as at last login. Fallback
 *      for when {@code /tenant/modules/active} is unreachable (network blip,
 *      pre-Phase-B backend). Never stale by more than one session.
 * Returns null when neither source yields modules — caller renders the minimal
 * (Home + Settings) skeleton, not a universal "everything" list.
 */
export function useManifests(): { manifests: UIManifest[] | null; loading: boolean } {
  const [manifests, setManifests] = useState<UIManifest[] | null>(cache);
  const [loading, setLoading] = useState(cache === null);

  useEffect(() => {
    if (cache) return;
    let active = true;
    const listener = () => {
      if (!active) return;
      setManifests(null);
      setLoading(true);
      fetchManifests().then((next) => {
        if (!active) return;
        setManifests(next);
        setLoading(false);
      });
    };
    listeners.add(listener);
    fetchManifests().then((next) => {
      if (!active) return;
      setManifests(next);
      setLoading(false);
    });
    return () => {
      active = false;
      listeners.delete(listener);
    };
  }, []);

  return { manifests, loading };
}

async function fetchManifests(): Promise<UIManifest[] | null> {
  let modules = await liveModules();
  if (!modules) {
    modules = decodeJwt(getAccessToken())?.activeModules ?? null;
  }
  if (!modules || modules.length === 0) {
    return null;
  }
  try {
    const res = await api.get<UIManifest[]>(
      `/registry/manifests?modules=${encodeURIComponent(modules.join(","))}`,
    );
    cache = res.data;
    return res.data;
  } catch {
    return null;
  }
}

async function liveModules(): Promise<string[] | null> {
  try {
    const res = await api.get<string[]>("/tenant/modules/active");
    return res.data ?? null;
  } catch {
    return null;
  }
}
