/** Inline Conddo wordmark — replaces the PNG logo on the marketing
 *  surface so there's no baked-in background plate that conflicts with
 *  the dark header capsule.
 *
 *  Structure: a small 2×2 gradient brand mark + the "Conddo" wordmark
 *  in the body font (semibold, tight tracking). Tone prop switches
 *  between light (for dark surfaces — default) and dark (for light
 *  surfaces, if we ever need it). */

export function Wordmark({
  tone = "light",
  className = "",
  showTld = false,
}: {
  tone?: "light" | "dark";
  className?: string;
  showTld?: boolean;
}) {
  const text = tone === "light" ? "text-white" : "text-ink";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <BrandMark />
      <span className={`text-[16px] font-semibold tracking-[-0.02em] leading-none ${text}`}>
        Conddo{showTld && <span className="text-primary-light">.io</span>}
      </span>
    </span>
  );
}

/** The little 2×2 colored-square brand mark. Sits at h-5 by default so it
 *  aligns visually with a 15px wordmark. Pure CSS — no asset weight. */
function BrandMark() {
  return (
    <span
      aria-hidden
      className="grid h-5 w-5 grid-cols-2 grid-rows-2 gap-[1.5px] rounded-[5px] overflow-hidden"
    >
      <span className="bg-gradient-to-br from-primary to-primary-hover" />
      <span className="bg-gradient-to-br from-primary-light to-primary" />
      <span className="bg-gradient-to-br from-rose-300 to-rose-400" />
      <span className="bg-gradient-to-br from-primary-light to-primary-hover" />
    </span>
  );
}
