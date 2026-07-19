import type { CSSProperties } from "react";

/**
 * Concentric-ring signature mark, drawn as inline SVG so it inherits
 * currentColor and scales without a network round-trip. Reused as a
 * hero watermark, an inline accent, or a bullet in card grids.
 *
 * <p>Ring count and stroke widths were tuned to echo the Flagscale
 * wordmark's Africa silhouette without literally drawing the continent
 * — the shape reads as "signal radiating outward" (any Africa-shaped
 * ring set feels heavy-handed on the site itself; the watermark
 * variant leans into that abstraction).
 */
export function RingMotif({
  size = 320,
  strokeWidth = 1.5,
  count = 8,
  opacity = 0.14,
  color,
  className,
  style,
}: {
  size?: number;
  strokeWidth?: number;
  count?: number;
  opacity?: number;
  /** Overrides currentColor when set. */
  color?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const rings = Array.from({ length: count }, (_, i) => {
    // Rings decay outward — inner rings are more opaque than outer.
    const r = 8 + (i * (size / 2 - 8)) / (count - 1);
    const localOpacity = (1 - i / (count - 1)) * 0.6 + 0.4;
    return (
      <circle
        key={i}
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color ?? "currentColor"}
        strokeWidth={strokeWidth}
        opacity={localOpacity}
      />
    );
  });
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
      className={className}
      style={{ opacity, ...style }}
    >
      {rings}
    </svg>
  );
}

/** Small gold ring used as a bullet or an inline accent (not a watermark). */
export function RingBullet({
  size = 14,
  color,
  style,
}: {
  size?: number;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      aria-hidden
      style={style}
    >
      <circle cx={7} cy={7} r={5.5} fill="none" stroke={color ?? "currentColor"} strokeWidth={1.5} />
      <circle cx={7} cy={7} r={2.5} fill="none" stroke={color ?? "currentColor"} strokeWidth={1} opacity={0.6} />
    </svg>
  );
}
