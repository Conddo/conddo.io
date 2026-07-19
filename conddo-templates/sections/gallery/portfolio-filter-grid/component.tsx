"use client";

import { useMemo, useState } from "react";
import type { SectionProps } from "../../../types";

/** Filterable case-study grid. Tabs across the top; filter tag becomes
 *  active on click and only matching cards render. 'All' shows every card.
 *  Cards are click-through to the case-study detail when {@code href} is set. */
export function PortfolioFilterGrid({ variables, brand }: SectionProps) {
  const eyebrow = variables.eyebrow ? String(variables.eyebrow) : null;
  const heading = variables.heading ? String(variables.heading) : "Selected work";
  const rawFilters = Array.isArray(variables.filters)
    ? (variables.filters as string[])
    : typeof variables.filters === "string"
      ? [variables.filters]
      : [];
  const rawItems = Array.isArray(variables.items)
    ? (variables.items as string[])
    : typeof variables.items === "string"
      ? [variables.items]
      : [];

  const items = useMemo(
    () =>
      rawItems
        .map((s) => {
          const [category, imageUrl, clientName, resultLine, href] = s
            .split("|")
            .map((p) => p.trim());
          return { category, imageUrl, clientName, resultLine, href };
        })
        .filter((i) => i.imageUrl),
    [rawItems],
  );
  const tabs = useMemo(() => ["All", ...rawFilters.filter(Boolean)], [rawFilters]);
  const [active, setActive] = useState("All");

  const visible = active === "All" ? items : items.filter((i) => i.category === active);

  return (
    <section
      style={{ background: "#FFFFFF", padding: "clamp(72px, 10vw, 112px) 24px" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ maxWidth: 720, marginBottom: 40 }}>
          {eyebrow && (
            <p
              style={{
                margin: 0,
                marginBottom: 14,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: brand.primaryColor,
              }}
            >
              {eyebrow}
            </p>
          )}
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(26px, 3.4vw, 36px)",
              fontWeight: 700,
              letterSpacing: "-0.015em",
              color: brand.secondaryColor,
            }}
          >
            {heading}
          </h2>
        </div>

        {tabs.length > 1 && (
          <div
            role="tablist"
            aria-label="Filter case studies"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 32,
              overflowX: "auto",
              scrollbarWidth: "none",
            }}
          >
            {tabs.map((tab) => {
              const isActive = tab === active;
              return (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(tab)}
                  style={{
                    display: "inline-flex",
                    padding: "8px 14px",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: isActive ? brand.primaryColor : brand.secondaryColor,
                    background: "transparent",
                    border: "none",
                    borderBottom: `2px solid ${isActive ? brand.primaryColor : "transparent"}`,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        )}

        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {visible.map((it, i) => {
            const Card = it.href ? "a" : "div";
            const spanTwo = i % 5 === 0; // gentle rhythm — one large card every five
            return (
              <li
                key={i}
                style={{ gridColumn: spanTwo ? "span 1" : undefined }}
              >
                <Card
                  {...(it.href ? { href: it.href } : {})}
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    borderRadius: 16,
                    overflow: "hidden",
                    background: "#F5F3EE",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)",
                    transition: "transform 220ms ease, box-shadow 220ms ease",
                  }}
                >
                  <div
                    style={{
                      aspectRatio: spanTwo ? "4 / 3" : "1 / 1",
                      width: "100%",
                      overflow: "hidden",
                      background: "rgba(0,0,0,0.05)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.imageUrl}
                      alt={it.clientName ?? ""}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ padding: "16px 18px 20px" }}>
                    {it.category && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 10.5,
                          fontWeight: 700,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: brand.primaryColor,
                        }}
                      >
                        {it.category}
                      </p>
                    )}
                    {it.clientName && (
                      <h3
                        style={{
                          margin: 0,
                          marginTop: 6,
                          fontSize: 16,
                          fontWeight: 700,
                          color: brand.secondaryColor,
                          letterSpacing: "-0.005em",
                        }}
                      >
                        {it.clientName}
                      </h3>
                    )}
                    {it.resultLine && (
                      <p
                        style={{
                          margin: 0,
                          marginTop: 6,
                          fontSize: 13.5,
                          lineHeight: 1.5,
                          color: "#4B4B50",
                        }}
                      >
                        {it.resultLine}
                      </p>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
