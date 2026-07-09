"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2, Star, Trash2, GripVertical, AlertCircle } from "lucide-react";
import { mediaApi } from "@/lib/api/media";
import { ApiError } from "@/lib/api/client";

/**
 * Reusable multi-image gallery editor. Works for property listings, website
 * hero galleries, marketing campaign assets — any surface that needs a set
 * of Cloudinary-hosted image URLs the tenant can arrange.
 *
 * <p><b>Behavior:</b> uploads happen inline via {@code mediaApi.upload}
 * (which streams to Cloudinary and returns a CDN URL). Uploaded URLs are
 * appended to {@code value} and the parent is notified via {@code onChange}.
 * The first URL is treated as the "primary" (hero) image; the "Set primary"
 * action swaps it to the front. Drag-to-reorder uses native HTML5 DnD, no
 * library dependency.
 *
 * <p><b>Storage contract:</b> we only ever hand the parent an array of
 * URLs. The parent decides where to persist them (properties.images,
 * tenant_sites.draft_sections.hero.imageUrl, etc.).
 */
export function MediaGalleryEditor({
  value,
  onChange,
  purpose,
  max = 12,
  emptyLabel = "Add photos",
  emptyHint = "Drop images here or click to upload. First image is the hero.",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  /** Passed to the BE so uploads are categorized in the media library. */
  purpose?: string;
  max?: number;
  emptyLabel?: string;
  emptyHint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const remaining = Math.max(0, max - value.length);

  const uploadMany = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      const take = files.slice(0, remaining);
      if (take.length === 0) {
        setError(`You've reached the limit of ${max} photos. Remove one first.`);
        return;
      }
      setUploading(true);
      setError(null);
      const next: string[] = [...value];
      for (const file of take) {
        try {
          const uploaded = await mediaApi.upload(file, purpose);
          if (uploaded?.data?.url) next.push(uploaded.data.url);
        } catch (err) {
          setError(err instanceof ApiError ? err.message : `Couldn't upload ${file.name}`);
          break;
        }
      }
      onChange(next);
      setUploading(false);
    },
    [max, onChange, purpose, remaining, value],
  );

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    uploadMany(files);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    uploadMany(files);
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const setPrimary = (index: number) => {
    if (index === 0) return;
    const next = [...value];
    const [chosen] = next.splice(index, 1);
    next.unshift(chosen);
    onChange(next);
  };

  const reorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    if (fromIndex >= value.length || toIndex >= value.length) return;
    const next = [...value];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onChange(next);
  };

  return (
    <div>
      {/* Existing photos grid. */}
      {value.length > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, i) => (
            <GalleryTile
              key={`${url}-${i}`}
              url={url}
              index={i}
              primary={i === 0}
              onRemove={() => removeAt(i)}
              onSetPrimary={() => setPrimary(i)}
              onReorder={reorder}
            />
          ))}
        </div>
      )}

      {/* Drop zone / picker. */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          dragOver
            ? "border-primary-light/60 bg-primary/[0.05]"
            : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-white/70">
          {uploading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <ImagePlus size={18} />
          )}
        </div>
        <p className="text-[14px] font-medium text-white">
          {uploading ? "Uploading…" : emptyLabel}
        </p>
        <p className="mt-1 text-[12.5px] text-white/50">
          {value.length > 0
            ? `${value.length}/${max} — ${remaining} more`
            : emptyHint}
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={onFileInput}
          className="sr-only"
        />
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1 text-[13px] text-rose-200">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ----- Tile -----------------------------------------------------------------

function GalleryTile({
  url,
  index,
  primary,
  onRemove,
  onSetPrimary,
  onReorder,
}: {
  url: string;
  index: number;
  primary: boolean;
  onRemove: () => void;
  onSetPrimary: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}) {
  const [dropTarget, setDropTarget] = useState(false);
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/x-media-index", String(index));
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDropTarget(true);
      }}
      onDragLeave={() => setDropTarget(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDropTarget(false);
        const src = e.dataTransfer.getData("application/x-media-index");
        if (src) onReorder(Number(src), index);
      }}
      className={`group relative overflow-hidden rounded-lg border transition-colors ${
        dropTarget ? "border-primary-light" : primary ? "border-primary/45" : "border-white/[0.08]"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="aspect-square w-full object-cover" />

      {primary && (
        <div className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-primary/85 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-white">
          <Star size={10} strokeWidth={2.5} />
          Hero
        </div>
      )}

      {/* Actions — visible on hover on desktop, always on mobile. */}
      <div className="absolute inset-0 flex items-end justify-between gap-1 bg-gradient-to-t from-black/60 via-transparent to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-0">
        <button
          type="button"
          onClick={onSetPrimary}
          disabled={primary}
          title={primary ? "Already the hero" : "Set as hero"}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-black/50 text-white hover:bg-black/70 disabled:opacity-40"
        >
          <Star size={13} strokeWidth={2.25} />
        </button>
        <div className="flex items-center gap-1">
          <span
            className="inline-flex h-7 w-7 cursor-grab items-center justify-center rounded-md bg-black/50 text-white active:cursor-grabbing"
            title="Drag to reorder"
          >
            <GripVertical size={13} strokeWidth={2.25} />
          </span>
          <button
            type="button"
            onClick={onRemove}
            title="Remove"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-black/50 text-rose-200 hover:bg-rose-900/70 hover:text-white"
          >
            <Trash2 size={13} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}
