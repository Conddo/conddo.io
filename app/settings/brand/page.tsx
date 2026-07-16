"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Check, Loader2, Palette, Type, Upload } from "lucide-react";
import { SettingsShell } from "@/components/app/SettingsShell";
import { WebsiteRenderer } from "@/components/website/WebsiteRenderer";
import { brandApi, type BrandPatch } from "@/lib/api/brand";
import { mediaApi } from "@/lib/api/media";
import { ApiError } from "@/lib/api/client";
import type { TenantBrand, WebsiteConfig, FontPairing } from "@/conddo-templates/types";

/** /settings/brand — the owner controls their brand and sees the change
 *  reflected in a live preview on the right. Fields debounce a PATCH to
 *  /api/v1/brand; the preview updates instantly on every keystroke by
 *  binding to the local staged state, not the persisted state. */
export default function BrandSettingsPage() {
  return (
    <SettingsShell
      active="brand"
      title="Brand"
      description="Your logo, colours, and font. Every section of your Conddo site uses these."
    >
      <BrandBody />
    </SettingsShell>
  );
}

const DEFAULT_BRAND: TenantBrand = {
  logoUrl: null,
  primaryColor: "#785DCD",
  secondaryColor: "#111111",
  fontPairing: "inter",
};

function BrandBody() {
  const [brand, setBrand] = useState<TenantBrand>(DEFAULT_BRAND);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<keyof BrandPatch | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    let alive = true;
    brandApi
      .get()
      .then((res) => {
        if (!alive) return;
        setBrand(res.data);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof ApiError ? err.message : "Couldn't load brand");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  function change<K extends keyof TenantBrand>(field: K, value: TenantBrand[K]) {
    setBrand((prev) => ({ ...prev, [field]: value }));
    // Debounce: color pickers fire many events per drag; wait until the
    // user pauses before sending. Each field has its own timer so text
    // input on one doesn't cancel a pending color save on another.
    const existing = debounceRef.current[field];
    if (existing) clearTimeout(existing);
    debounceRef.current[field] = setTimeout(() => {
      void save({ [field]: value } as BrandPatch, field as keyof BrandPatch);
    }, 500);
  }

  async function save(patch: BrandPatch, field: keyof BrandPatch) {
    setSavingField(field);
    setError(null);
    try {
      const res = await brandApi.patch(patch);
      // Trust the BE — it may have normalised the hex string or the
      // font name. Overwrite local with the returned canonical values.
      setBrand(res.data);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1200);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save");
    } finally {
      setSavingField(null);
    }
  }

  async function onLogoFile(file: File) {
    setSavingField("logoUrl");
    setError(null);
    try {
      const uploaded = await mediaApi.upload(file, "logo");
      const url = uploaded?.data?.url ?? null;
      if (!url) throw new ApiError("upload_failed", "Upload returned no URL");
      setBrand((prev) => ({ ...prev, logoUrl: url }));
      await save({ logoUrl: url }, "logoUrl");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logo upload failed");
    } finally {
      setSavingField(null);
    }
  }

  const previewConfig: WebsiteConfig = useMemo(() => samplePreviewConfig(), []);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-white/[0.06] bg-cinema-elev p-12 text-white/55">
        <Loader2 size={20} className="mr-2 animate-spin" /> Loading brand…
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      {/* ---- Controls ---------------------------------------------------- */}
      <div className="space-y-5">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-400/25 bg-rose-500/[0.06] p-3 text-[13.5px] text-rose-200">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}
        {savedFlash && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/[0.06] p-3 text-[13px] text-emerald-200">
            <Check size={14} /> Saved
          </div>
        )}

        <section className="rounded-2xl border border-white/[0.06] bg-cinema-elev p-5">
          <SectionHead icon={Upload} label="Logo" />
          <LogoUpload
            currentUrl={brand.logoUrl}
            busy={savingField === "logoUrl"}
            onFile={onLogoFile}
            onClear={() => save({ logoUrl: null }, "logoUrl")}
          />
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-cinema-elev p-5">
          <SectionHead icon={Palette} label="Colours" />
          <div className="grid grid-cols-2 gap-4">
            <ColorField
              label="Primary"
              value={brand.primaryColor}
              busy={savingField === "primaryColor"}
              onChange={(v) => change("primaryColor", v)}
            />
            <ColorField
              label="Secondary"
              value={brand.secondaryColor}
              busy={savingField === "secondaryColor"}
              onChange={(v) => change("secondaryColor", v)}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-cinema-elev p-5">
          <SectionHead icon={Type} label="Font" />
          <FontPicker
            value={brand.fontPairing}
            busy={savingField === "fontPairing"}
            onChange={(v) => change("fontPairing", v)}
          />
        </section>
      </div>

      {/* ---- Live preview ----------------------------------------------- */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-white/45">
            Live preview
          </p>
          <p className="font-mono text-[10.5px] text-white/40">
            hero + contact · uses your brand
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white">
          <div className="max-h-[720px] overflow-y-auto">
            <WebsiteRenderer config={previewConfig} brand={brand} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- */
/* Sub-components                                                          */
/* --------------------------------------------------------------------- */

function SectionHead({ icon: Icon, label }: { icon: typeof Palette; label: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-white/70">
      <Icon size={14} />
      <span className="text-[12px] font-medium uppercase tracking-wide">{label}</span>
    </div>
  );
}

function LogoUpload({
  currentUrl,
  busy,
  onFile,
  onClear,
}: {
  currentUrl: string | null;
  busy: boolean;
  onFile: (file: File) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-black/40">
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentUrl} alt="Logo" className="h-full w-full object-contain" />
        ) : (
          <span className="text-[10px] text-white/40">No logo</span>
        )}
      </div>
      <div className="flex-1">
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-white/80 hover:bg-white/[0.06]">
          {busy ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          {currentUrl ? "Replace" : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
            disabled={busy}
          />
        </label>
        {currentUrl && (
          <button
            onClick={onClear}
            className="ml-2 text-[12px] text-white/50 hover:text-white/80"
            disabled={busy}
          >
            Remove
          </button>
        )}
        <p className="mt-2 text-[11px] text-white/45">PNG or SVG. Transparent background looks best.</p>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  busy,
  onChange,
}: {
  label: string;
  value: string;
  busy: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-white/70">
        {label}
        {busy && <Loader2 size={10} className="animate-spin text-white/50" />}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={normaliseHex(value)}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 shrink-0 cursor-pointer rounded-lg border border-white/10 bg-black/30 p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-[12.5px] text-white outline-none focus:border-primary/50"
          placeholder="#785DCD"
        />
      </div>
    </label>
  );
}

const FONT_OPTIONS: { id: FontPairing; label: string; example: string }[] = [
  { id: "inter", label: "Modern", example: "font-sans" },
  { id: "playfair", label: "Classic", example: "font-serif" },
  { id: "poppins", label: "Bold", example: "font-sans" },
  { id: "lato", label: "Minimal", example: "font-sans" },
];

function FontPicker({
  value,
  busy,
  onChange,
}: {
  value: FontPairing;
  busy: boolean;
  onChange: (v: FontPairing) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {FONT_OPTIONS.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            disabled={busy}
            className={`rounded-xl border p-4 text-left transition-colors ${
              active
                ? "border-primary/40 bg-primary/[0.08]"
                : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]"
            }`}
          >
            <p className={`text-[16px] font-semibold text-white ${opt.example}`}>
              Aa
            </p>
            <p className="mt-1 text-[12px] text-white/70">{opt.label}</p>
          </button>
        );
      })}
    </div>
  );
}

function normaliseHex(v: string): string {
  // <input type="color"> demands #RRGGBB — everything else gets a
  // default so the picker doesn't reset to black on every render.
  const trimmed = (v ?? "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
  return "#785DCD";
}

/** Sample content for the preview — showcases hero + contact so the user
 *  sees exactly the two most-visible sections of their site.
 *  Once the tenant has real content, the same WebsiteRenderer will render
 *  it here with the same brand bindings. */
function samplePreviewConfig(): WebsiteConfig {
  return {
    sections: [
      {
        id: "preview-hero",
        componentId: "hero-bold-centered",
        variables: {
          businessName: "Your business",
          tagline: "Everything you sell, in one place.",
          subtext: "Website + orders + payments. Set up in minutes.",
          ctaText: "Start now",
          ctaLink: "#",
        },
      },
      {
        id: "preview-contact",
        componentId: "contact-simple",
        variables: {
          businessName: "Your business",
          address: "123 Market St, Lagos",
          phone: "+234 800 000 0000",
          email: "hello@example.com",
        },
      },
    ],
  };
}
