import type { SectionProps } from "../../../types";

/**
 * Sticky in-page jump nav. Each item is 'label|#anchor-id'. Renders as a
 * horizontal scroller on mobile so long service lists never wrap into an
 * awkward second row.
 */
export function ServicesAnchorNav({ variables, brand }: SectionProps) {
  const raw = Array.isArray(variables.items)
    ? (variables.items as string[])
    : typeof variables.items === "string"
      ? [variables.items]
      : [];
  const items = raw
    .map((s) => {
      const [label, href] = s.split("|").map((p) => p.trim());
      return { label, href };
    })
    .filter((i) => i.label);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Services quick jump"
      style={{
        position: "sticky",
        top: 64,
        zIndex: 20,
        background: "rgba(250,249,246,0.92)",
        backdropFilter: "saturate(140%) blur(10px)",
        WebkitBackdropFilter: "saturate(140%) blur(10px)",
        borderTop: "1px solid rgba(0,0,0,0.05)",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: "12px 24px",
          maxWidth: 1200,
          marginInline: "auto",
          display: "flex",
          gap: 6,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {items.map((it, i) => (
          <li key={i} style={{ flex: "0 0 auto" }}>
            <a
              href={it.href ?? "#"}
              style={{
                display: "inline-flex",
                padding: "8px 12px",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: brand.secondaryColor,
                textDecoration: "none",
                borderBottom: "2px solid transparent",
                whiteSpace: "nowrap",
              }}
              onFocus={undefined}
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
