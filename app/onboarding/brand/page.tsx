"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AlertCircle, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useOnboarding } from "@/lib/onboarding-store";
import { hrefFor, nextStep, prevStep } from "@/lib/onboarding-steps";

const SLUG = "brand";
const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2 MB — logos should be tiny SVGs / PNGs
const COLOR_SWATCHES = [
  "#7C5CBF", "#0F766E", "#1D4ED8", "#B45309",
  "#B91C1C", "#DB2777", "#4D7C0F", "#0891B2",
  "#141414", "#525252",
];

/**
 * Step 3 (v3 flow) — brand basics: logo + primary + secondary colours.
 *
 * The logo isn't uploaded here. The tenant doesn't have a JWT until Ready
 * runs `/auth/register/complete`, so we hold the {@link File} in the
 * onboarding store and let Ready upload it once the auth token exists.
 *
 * Colours are optional in the sense that we default to the marketing brand
 * ({@code #7C5CBF} on {@code #141414}) — the tenant just Continues to accept.
 */
export default function BrandStep() {
  const router = useRouter();
  const {
    logoFile,
    logoPreviewUrl,
    primaryColor,
    secondaryColor,
    update,
    reachStep,
  } = useOnboarding();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Revoke the object URL when a new one supersedes it, and on unmount.
  useEffect(
    () => () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const pickLogo = () => inputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That doesn't look like an image. Upload a PNG, SVG, or JPG.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError("Logo is too large. Please pick a file under 2 MB.");
      return;
    }
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    const preview = URL.createObjectURL(file);
    update({ logoFile: file, logoPreviewUrl: preview });
    setError(null);
  };

  const clearLogo = () => {
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    update({ logoFile: null, logoPreviewUrl: null });
    if (inputRef.current) inputRef.current.value = "";
  };

  const onContinue = () => {
    reachStep(3);
    const next = nextStep(SLUG);
    if (next) router.push(hrefFor(next.slug));
  };

  const goBack = () => {
    const prev = prevStep(SLUG);
    if (prev) router.push(hrefFor(prev.slug));
  };

  return (
    <div className="w-full max-w-2xl">
      <header className="mb-7 text-center">
        <h1 className="text-[28px] leading-tight tracking-[-0.02em] md:text-[32px]">
          Add your brand
        </h1>
        <p className="mt-2 text-[16px] text-white/65">
          Upload your logo and pick your colours. You can change these later.
        </p>
      </header>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger/20 bg-rose-500/[0.06] px-4 py-3 text-[14px] text-rose-200">
          <AlertCircle size={18} className="shrink-0" /> {error}
        </div>
      )}

      {/* Logo picker */}
      <div className="rounded-xl border border-white/10 bg-cinema-elev p-5">
        <div className="text-[13px] font-medium text-white">Logo</div>
        <p className="mt-1 text-[12px] text-white/50">
          PNG, SVG, or JPG. Under 2 MB. Square works best.
        </p>

        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={pickLogo}
            className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/[0.04] hover:border-white/30"
            aria-label={logoFile ? "Replace logo" : "Upload logo"}
          >
            {logoPreviewUrl ? (
              <Image
                src={logoPreviewUrl}
                alt="Logo preview"
                width={80}
                height={80}
                className="h-full w-full object-contain"
                unoptimized
              />
            ) : (
              <Upload size={22} className="text-white/60" />
            )}
          </button>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={pickLogo}
              className="rounded-md border border-white/15 px-3 py-1.5 text-[13px] text-white/85 hover:border-white/30"
            >
              {logoFile ? "Replace logo" : "Choose file"}
            </button>
            {logoFile && (
              <button
                type="button"
                onClick={clearLogo}
                className="inline-flex items-center gap-1 text-[12px] text-white/50 hover:text-rose-300"
              >
                <X size={12} /> Remove
              </button>
            )}
            {logoFile && (
              <span className="truncate text-[11px] text-white/40">
                {logoFile.name}
              </span>
            )}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {/* Colours */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <ColorField
          label="Primary colour"
          hint="Buttons, links, highlights."
          value={primaryColor}
          onChange={(v) => update({ primaryColor: v })}
        />
        <ColorField
          label="Secondary colour"
          hint="Dark headings, footer, accents."
          value={secondaryColor}
          onChange={(v) => update({ secondaryColor: v })}
        />
      </div>

      {/* Live preview strip */}
      <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
        <div style={{ background: secondaryColor }} className="p-5">
          <div className="flex items-center gap-3">
            {logoPreviewUrl && (
              <Image
                src={logoPreviewUrl}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 rounded object-contain"
                unoptimized
              />
            )}
            <span className="text-[15px] font-semibold text-white">Preview</span>
          </div>
          <button
            style={{ background: primaryColor }}
            className="mt-3 rounded-md px-3.5 py-2 text-[13px] font-medium text-white"
            type="button"
            tabIndex={-1}
          >
            Call to action
          </button>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={goBack}
          className="rounded-md border border-white/10 px-5 py-3 text-[14px] text-white/70 hover:border-white/20 hover:text-white"
        >
          Back
        </button>
        <Button onClick={onContinue} variant="primary" size="lg" className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );
}

function ColorField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-cinema-elev p-4">
      <div className="text-[13px] font-medium text-white">{label}</div>
      <p className="mt-0.5 text-[12px] text-white/45">{hint}</p>

      <div className="mt-3 flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-11 cursor-pointer rounded border border-white/12 bg-transparent"
          aria-label={label}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 rounded-md border border-white/10 bg-black/30 px-2 py-1.5 font-mono text-[12px] text-white focus:border-primary-light focus:outline-none"
          spellCheck={false}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {COLOR_SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={
              "h-6 w-6 rounded border transition " +
              (value.toLowerCase() === c.toLowerCase()
                ? "border-white/70 ring-2 ring-white/30"
                : "border-white/10 hover:border-white/30")
            }
            style={{ background: c }}
            aria-label={`Use ${c}`}
          />
        ))}
      </div>
    </div>
  );
}
