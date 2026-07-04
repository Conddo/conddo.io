"use client";

import { useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useToast } from "@/components/ui/Toast";
import {
  managedSiteQuery,
  publishManagedSite,
  liveUrlFor,
  type ManagedSiteOwner,
} from "@/lib/api/managed-site-owner";

/**
 * The AI-generated managed website panel. Sits at the top of the /website
 * page for tenants who came through Onboarding v2 — signup seeded the
 * draft; here they review + publish it live.
 *
 * <p>Three states:
 * <ul>
 *   <li><b>Not managed</b> — this tenant predates Path A or their listener
 *       failed to seed a site. Panel hides; the legacy website UI below is
 *       what they see.</li>
 *   <li><b>Draft, unpublished</b> — a "Publish" button is the primary CTA.</li>
 *   <li><b>Published</b> — live URL + "Publish updates" button when the draft
 *       has diverged.</li>
 * </ul>
 */
export function ManagedSitePanel() {
  const toast = useToast();
  const { data, loading, refetch } = useApiQuery<ManagedSiteOwner | null>(managedSiteQuery);
  const [publishing, setPublishing] = useState(false);

  if (loading) return <PanelSkeleton />;
  if (!data) return null;

  const isPublished = !!data.publishedAt;
  const url = liveUrlFor(data);

  const onPublish = async () => {
    setPublishing(true);
    try {
      await publishManagedSite();
      toast.success(isPublished ? "Updates published" : "Your site is live!");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't publish. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-primary/[0.06] via-cinema-elev to-cinema-elev p-5">
      <div
        aria-hidden
        className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/[0.10] blur-2xl"
      />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/[0.15] text-primary-light">
            <Sparkles size={18} strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-primary-light/80">
                Your website
              </p>
              {isPublished ? (
                <Chip tone="success">● Live</Chip>
              ) : (
                <Chip tone="warning">Draft</Chip>
              )}
            </div>
            <h2 className="mt-1 text-[18px] font-medium leading-snug tracking-tight text-white md:text-[19px]">
              {isPublished ? "Your site is live" : "Review your AI-generated site"}
            </h2>
            <p className="mt-1 text-[13.5px] text-white/65">
              {isPublished
                ? "Publish updates any time from here — changes go live in a few seconds."
                : "We drafted a starter site from your onboarding vibe. Publish when it feels right."}
            </p>
            {isPublished && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary-light hover:text-primary-light/85"
              >
                {url.replace(/^https?:\/\//, "")}
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isPublished ? (
            <Button
              onClick={onPublish}
              variant="primary"
              size="md"
              disabled={publishing}
            >
              {publishing ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
              {publishing ? "Publishing…" : "Publish live"}
            </Button>
          ) : (
            <>
              <Button
                onClick={onPublish}
                variant="secondary"
                size="md"
                disabled={publishing}
              >
                {publishing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                {publishing ? "Publishing…" : "Publish updates"}
              </Button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-3.5 text-[13.5px] font-medium text-white/85 hover:bg-white/[0.06]"
              >
                Visit site <ExternalLink size={13} />
              </a>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function PanelSkeleton() {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-cinema-elev p-5">
      <div className="h-4 w-24 animate-pulse rounded bg-white/[0.06]" />
      <div className="mt-3 h-6 w-56 animate-pulse rounded bg-white/[0.06]" />
      <div className="mt-2 h-3 w-72 animate-pulse rounded bg-white/[0.04]" />
    </section>
  );
}
