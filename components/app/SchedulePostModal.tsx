"use client";

import { useRef, useState } from "react";
import { ImagePlus, X, Loader2, Film, Image as ImageIcon } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, TextArea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { marketingApi, type MarketingPost } from "@/lib/api/marketing";
import { mediaApi, type UploadedMedia } from "@/lib/api/media";
import { ApiError } from "@/lib/api/client";

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
];

const MAX_FILES = 5;
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB per file — Ayrshare's IG video limit

type AttachedMedia = UploadedMedia & {
  /** Local object-URL for preview while/after upload. Revoked on remove. */
  previewUrl: string;
  /** Original filename, surfaced under the thumb. */
  filename: string;
  /** image | video — from File.type. */
  kind: "image" | "video";
};

/** Schedule a social post across one or more platforms (POST /marketing/posts).
 *  Upload images / videos that get attached as `mediaIds` on the post. */
export function SchedulePostModal({
  open,
  onClose,
  defaultDate,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  defaultDate?: string; // YYYY-MM-DD
  onCreated?: (p: MarketingPost) => void;
}) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["instagram"]);
  const [scheduledAt, setScheduledAt] = useState(defaultDate ? `${defaultDate}T09:00` : "");
  const [media, setMedia] = useState<AttachedMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  function reset() {
    setTitle(""); setContent(""); setPlatforms(["instagram"]);
    setScheduledAt(defaultDate ? `${defaultDate}T09:00` : "");
    media.forEach((m) => URL.revokeObjectURL(m.previewUrl));
    setMedia([]);
    setError(undefined);
  }

  function close() {
    if (saving || uploading) return;
    reset();
    onClose();
  }

  function togglePlatform(p: string) {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  async function pickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    // Always clear the input so the same file can be re-picked after removal.
    if (fileRef.current) fileRef.current.value = "";

    const remaining = MAX_FILES - media.length;
    if (remaining <= 0) {
      toast.error(`Up to ${MAX_FILES} files per post`);
      return;
    }
    const accepted = files.slice(0, remaining).filter((f) => {
      if (f.size > MAX_BYTES) {
        toast.error("File too large", `${f.name} is over 25 MB.`);
        return false;
      }
      if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) {
        toast.error("Unsupported file", "Only images and video files.");
        return false;
      }
      return true;
    });
    if (accepted.length === 0) return;

    setUploading(true);
    try {
      for (const f of accepted) {
        const previewUrl = URL.createObjectURL(f);
        const kind: "image" | "video" = f.type.startsWith("video/") ? "video" : "image";
        try {
          const { data } = await mediaApi.upload(f, "social");
          setMedia((prev) => [
            ...prev,
            { ...data, previewUrl, filename: f.name, kind },
          ]);
        } catch (err) {
          URL.revokeObjectURL(previewUrl);
          const msg = err instanceof ApiError ? err.message : "Try again in a moment.";
          toast.error("Couldn't upload " + f.name, msg);
        }
      }
    } finally {
      setUploading(false);
    }
  }

  function removeMedia(i: number) {
    setMedia((prev) => {
      const next = [...prev];
      const [removed] = next.splice(i, 1);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() && !content.trim() && media.length === 0) {
      setError("Add a title, some content, or at least one image / video.");
      return;
    }
    if (platforms.length === 0) {
      setError("Pick at least one platform.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await marketingApi.createPost({
        title: title.trim() || undefined,
        content: content.trim() || undefined,
        platforms,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        mediaIds: media.map((m) => m.id).filter((id): id is string => Boolean(id)),
      });
      toast.success("Post scheduled", title.trim() || "Draft saved");
      close();
      onCreated?.(data);
    } catch (err) {
      toast.error("Couldn't schedule post", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={close}
        title="Schedule post"
        description="Compose once, publish to the channels you choose."
        footer={
          <>
            <Button variant="secondary" size="md" onClick={close} disabled={saving}>Cancel</Button>
            <Button variant="primary" size="md" type="submit" form="schedule-post-form" disabled={saving || uploading}>
              {saving ? "Scheduling…" : "Schedule post"}
            </Button>
          </>
        }
      >
        <form id="schedule-post-form" onSubmit={submit} className="space-y-4">
          <Field label="Title" htmlFor="sp-title" error={error}>
            <TextInput id="sp-title" value={title} error={error} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. New collection launch" autoFocus />
          </Field>

          <Field label="Content" htmlFor="sp-content">
            <TextArea id="sp-content" value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="Caption / body…" />
          </Field>

          {/* Media */}
          <Field label="Media" hint={`Up to ${MAX_FILES} images or videos · max 25 MB each.`}>
            <div className="space-y-3">
              {media.length > 0 && (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {media.map((m, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02]">
                      {m.kind === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.previewUrl} alt={m.filename} className="aspect-square w-full object-cover" />
                      ) : (
                        <div className="flex aspect-square items-center justify-center bg-ink/5 text-white/65">
                          <Film size={28} />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeMedia(i)}
                        aria-label={`Remove ${m.filename}`}
                        className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-white opacity-90 transition-opacity hover:opacity-100"
                      >
                        <X size={12} />
                      </button>
                      <p className="truncate px-2 py-1 text-[10px] text-white/45">{m.filename}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={pickFiles}
                  className="hidden"
                  disabled={uploading || media.length >= MAX_FILES}
                />
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading || media.length >= MAX_FILES}
                >
                  {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
                  {uploading ? "Uploading…" : media.length === 0 ? "Add media" : "Add more"}
                </Button>
              </div>
              {media.length === 0 && !uploading && (
                <p className="flex items-center gap-1 text-[11px] text-white/45">
                  <ImageIcon size={12} /> Posts with at least one image perform ~2× better.
                </p>
              )}
            </div>
          </Field>

          <Field label="Platforms">
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => {
                const on = platforms.includes(p.value);
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => togglePlatform(p.value)}
                    className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${on ? "border-primary bg-primary/[0.08] font-medium text-primary" : "border-white/[0.06] text-white/65 hover:bg-white/[0.02]"}`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Schedule for" htmlFor="sp-when" hint="Leave blank to save as a draft.">
            <TextInput id="sp-when" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          </Field>
        </form>
      </Modal>
    </>
  );
}
