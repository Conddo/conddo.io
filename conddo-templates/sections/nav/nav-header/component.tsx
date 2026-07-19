import type { TenantBrand, WebsitePage } from "../../../types";

/**
 * Sticky top nav for multi-page sites.
 *
 * <p>Responsive by design:
 * <ul>
 *   <li><b>&ge;768px</b> — logo/business-name on the left, inline link list
 *       on the right, active link underlined in brand primary.</li>
 *   <li><b>&lt;768px</b> — logo/lettermark on the left, a proper hamburger
 *       button on the right that toggles a full-width dropdown below the
 *       nav bar. Built with native {@code <details>/<summary>} so it works
 *       with zero client JS and stays keyboard-accessible.</li>
 * </ul>
 *
 * <p>Not part of {@code SECTION_MAP} — its props are structured
 * ({@code WebsitePage[]}), not the flat {@code variables} contract
 * {@link SECTION_MAP} expects. {@code WebsiteRenderer} imports and
 * renders it directly.
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
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "saturate(140%) blur(10px)",
        WebkitBackdropFilter: "saturate(140%) blur(10px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <style>{`
        /* Responsive rules — inline styles can't take media queries so
         * every breakpoint-dependent rule lives here. */
        .nav-header-inline { display: none; }
        .nav-header-toggle { display: inline-flex; }
        @media (min-width: 768px) {
          .nav-header-inline { display: flex; }
          .nav-header-toggle { display: none; }
          .nav-header-mobile-panel { display: none !important; }
        }

        /* Hamburger button — three lines that morph into an X when the
         * parent <details> is open. */
        .nav-header-toggle .bar {
          display: block;
          width: 22px;
          height: 2px;
          margin: 5px 0;
          border-radius: 2px;
          transition: transform 200ms ease, opacity 200ms ease;
        }
        details[open] .nav-header-toggle .bar:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        details[open] .nav-header-toggle .bar:nth-child(2) {
          opacity: 0;
        }
        details[open] .nav-header-toggle .bar:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }

        /* Panel that slides down when the hamburger is open. Kept simple —
         * a solid white panel with the same links stacked vertically. */
        .nav-header-mobile-panel {
          border-top: 1px solid rgba(0,0,0,0.06);
          background: rgba(255,255,255,0.98);
        }
        .nav-header-mobile-panel ul {
          list-style: none;
          margin: 0;
          padding: 8px 0;
        }
      `}</style>

      <details>
        <summary
          aria-label="Menu"
          style={{
            display: "block",
            cursor: "auto",
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
              gap: 16,
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
                flexShrink: 0,
                minWidth: 0,
              }}
            >
              {brand.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brand.logoUrl}
                  alt={businessName}
                  // Wordmark logos (mark + text) compress hard at small
                  // heights. 44px keeps the mark crisp on the standard
                  // 64px nav bar without blowing the header out of ratio.
                  // maxWidth stops very wide wordmarks from pushing the
                  // nav links off-screen on narrower viewports.
                  style={{
                    height: 44,
                    width: "auto",
                    maxWidth: 180,
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              ) : (
                <span
                  style={{
                    width: 30,
                    height: 30,
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
                  {(businessName || "?").slice(0, 1).toUpperCase()}
                </span>
              )}
              {/* Only render the business name as text when we're drawing
               *  the letter-mark fallback. Real logos already contain the
               *  wordmark; rendering it a second time next to the mark
               *  reads as duplicated ("F Flagscale PR" beside a full
               *  wordmark image). */}
              {!brand.logoUrl && (
                <span style={{ whiteSpace: "nowrap" }}>{businessName}</span>
              )}
            </a>

            {/* Desktop inline list */}
            <ul
              className="nav-header-inline"
              style={{
                gap: 4,
                listStyle: "none",
                margin: 0,
                padding: 0,
                alignItems: "center",
              }}
            >
              {visible.map((p) => {
                const active = p.path === currentPath;
                return (
                  <li key={p.path} style={{ flexShrink: 0 }}>
                    <a
                      href={p.path}
                      style={{
                        display: "inline-block",
                        padding: "8px 14px",
                        textDecoration: "none",
                        color: active ? brand.primaryColor : brand.secondaryColor,
                        fontWeight: active ? 600 : 500,
                        fontSize: 14,
                        borderBottom: `2px solid ${active ? brand.primaryColor : "transparent"}`,
                        whiteSpace: "nowrap",
                        transition: "color 120ms ease",
                      }}
                    >
                      {p.label}
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Mobile hamburger — clicking the summary toggles the details */}
            <span
              className="nav-header-toggle"
              role="button"
              aria-label="Toggle menu"
              style={{
                width: 44,
                height: 44,
                cursor: "pointer",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                background: "transparent",
                border: `1px solid rgba(0,0,0,0.08)`,
                borderRadius: 12,
                color: brand.secondaryColor,
              }}
            >
              <span className="bar" style={{ background: brand.secondaryColor }} />
              <span className="bar" style={{ background: brand.secondaryColor }} />
              <span className="bar" style={{ background: brand.secondaryColor }} />
            </span>
          </nav>
        </summary>

        {/* Mobile dropdown panel */}
        <div className="nav-header-mobile-panel">
          <ul>
            {visible.map((p) => {
              const active = p.path === currentPath;
              return (
                <li key={p.path}>
                  <a
                    href={p.path}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "14px 24px",
                      textDecoration: "none",
                      color: active ? brand.primaryColor : brand.secondaryColor,
                      fontWeight: active ? 700 : 500,
                      fontSize: 15.5,
                      borderLeft: `3px solid ${active ? brand.primaryColor : "transparent"}`,
                    }}
                  >
                    {p.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </details>
    </header>
  );
}
