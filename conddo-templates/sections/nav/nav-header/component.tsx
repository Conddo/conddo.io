import type { TenantBrand, WebsitePage } from "../../../types";

/**
 * Sticky top nav for multi-page sites. Not part of {@code SECTION_MAP}
 * because its props don't fit the {@code SectionProps} contract —
 * {@link WebsiteRenderer} instantiates it directly with a typed payload.
 *
 * <p>Style: white background with a soft border, brand secondary as the
 * text color, brand primary as the active-link underline. Tries very
 * hard not to overpower the sections underneath — sits at 64px tall,
 * loses nothing on mobile.
 */
export function NavHeader({
  brand,
  businessName,
  pages,
  currentPath,
}: {
  brand: TenantBrand;
  businessName: string;
  pages: Array<Pick<WebsitePage, "path" | "label" | "showInNav">>;
  currentPath: string;
}) {
  const visible = pages.filter((p) => p.showInNav !== false);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        width: "100%",
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "saturate(140%) blur(10px)",
        WebkitBackdropFilter: "saturate(140%) blur(10px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <nav
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: brand.secondaryColor,
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: "-0.01em",
          }}
        >
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logoUrl}
              alt={businessName}
              style={{ height: 28, width: "auto", objectFit: "contain" }}
            />
          ) : (
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: brand.primaryColor,
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
              }}
              aria-hidden
            >
              {businessName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span>{businessName}</span>
        </a>

        <ul
          style={{
            display: "flex",
            gap: 4,
            listStyle: "none",
            margin: 0,
            padding: 0,
            flexWrap: "wrap",
          }}
        >
          {visible.map((p) => {
            const active = p.path === currentPath;
            return (
              <li key={p.path}>
                <a
                  href={p.path}
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    textDecoration: "none",
                    color: active ? brand.primaryColor : brand.secondaryColor,
                    fontWeight: active ? 600 : 500,
                    fontSize: 14,
                    borderBottom: `2px solid ${active ? brand.primaryColor : "transparent"}`,
                    transition: "color 120ms ease",
                  }}
                >
                  {p.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
