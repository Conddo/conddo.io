"use client";

import { useEffect, useMemo, useState } from "react";
import type { SectionProps } from "../../../types";

/**
 * Live embedded booking form on the tenant's public site.
 *
 * <p>Same API surface as the standalone {@code /book/[slug]} page:
 * fetches {@code GET /api/v1/public/book/{slug}} for the service menu +
 * booked slots, {@code GET /api/v1/public/book/{slug}/slots} for open
 * slots, and {@code POST /api/v1/public/book/{slug}} to create the
 * booking. Anything a visitor submits here lands in the tenant's
 * {@code /bookings} dashboard just like a public-book placement.
 *
 * <p>Requires the {@code slug} variable — the tenant's booking-link slug
 * (usually the tenant subdomain slug, e.g. {@code "flagscale-pr"}).
 */
type PublicService = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceKobo: number;
};

type PublicAvailability = {
  business: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  slotDurationMinutes: number;
  bufferMinutes: number;
  services: PublicService[];
};

type ApiEnvelope<T> = { success?: boolean; data?: T; error?: { message?: string } };

// Next.js inlines NEXT_PUBLIC_* env vars into the client bundle at build
// time via a literal-substitution pass. Wrapping the read in a runtime
// typeof-guard defeats that pass, which is exactly why the tenant site's
// booking form was fetching from a broken same-origin path
// (flagscale-pr.getconddo.com/api/…) instead of the API host. Reading the
// var straight lets the substitution happen and API_BASE gets baked in.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export function BookingForm({ variables, brand }: SectionProps) {
  const heading = String(variables.heading ?? "Book a call");
  const subtext = variables.subtext
    ? String(variables.subtext)
    : "Pick a service and a time. We'll confirm by email.";
  const slug = variables.slug ? String(variables.slug) : "";
  const successHeadline = String(
    variables.successHeadline ?? "Booking requested",
  );
  const successBody = String(
    variables.successBody ??
      "You'll get a confirmation email shortly. We'll reach out if we need anything else.",
  );

  const [availability, setAvailability] = useState<PublicAvailability | null>(null);
  const [loadingAvail, setLoadingAvail] = useState(true);
  const [availError, setAvailError] = useState<string | null>(null);

  const [pickedService, setPickedService] = useState<PublicService | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [pickedSlot, setPickedSlot] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [freeService, setFreeService] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);

  // Fetch availability + service menu once we know the slug.
  useEffect(() => {
    if (!slug) {
      setAvailError("This booking form isn't wired up yet — no slug set.");
      setLoadingAvail(false);
      return;
    }
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/public/book/${encodeURIComponent(slug)}`, {
          headers: { Accept: "application/json" },
        });
        const envelope = (await res.json()) as ApiEnvelope<PublicAvailability>;
        if (!alive) return;
        if (!res.ok || envelope.success === false || !envelope.data) {
          setAvailError(
            envelope.error?.message ??
              "We couldn't load availability right now. Please try again shortly.",
          );
        } else {
          setAvailability(envelope.data);
          if (envelope.data.services?.length === 1) {
            setPickedService(envelope.data.services[0]);
          }
        }
      } catch (e) {
        if (alive) {
          const msg = e instanceof Error ? e.message : "";
          // Surface the underlying reason when we have one — helps diagnose
          // CORS / DNS / mixed-content failures rather than blaming the
          // user's network. Falls back to a friendly line when the browser
          // gave us nothing to work with.
          setAvailError(
            msg
              ? `Couldn't load availability: ${msg}`
              : "Couldn't load availability. Please try again in a moment.",
          );
        }
      } finally {
        if (alive) setLoadingAvail(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  // Fetch fresh slots whenever the service pick changes (or availability lands).
  useEffect(() => {
    if (!availability) return;
    if (availability.services.length > 0 && !pickedService) return;
    let alive = true;
    setLoadingSlots(true);
    setPickedSlot(null);
    const qs = new URLSearchParams();
    if (pickedService) qs.set("serviceId", pickedService.id);
    qs.set("days", "14");
    fetch(`${API_BASE}/api/v1/public/book/${encodeURIComponent(slug)}/slots?${qs}`, {
      headers: { Accept: "application/json" },
    })
      .then((r) => r.json() as Promise<ApiEnvelope<string[]>>)
      .then((envelope) => {
        if (!alive) return;
        setSlots(envelope.data ?? []);
      })
      .catch(() => {
        if (alive) setSlots([]);
      })
      .finally(() => {
        if (alive) setLoadingSlots(false);
      });
    return () => {
      alive = false;
    };
  }, [availability, pickedService, slug]);

  const slotsByDay = useMemo(() => groupByDay(slots ?? []), [slots]);
  const hasServices = (availability?.services?.length ?? 0) > 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) return setFormError("Please enter your name.");
    if (!pickedSlot) return setFormError("Pick a time.");
    if (hasServices && !pickedService) return setFormError("Pick a service.");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/public/book/${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: phone.trim() || undefined,
          customerEmail: email.trim() || undefined,
          serviceId: pickedService?.id,
          service: pickedService ? pickedService.name : freeService.trim() || undefined,
          start: pickedSlot,
        }),
      });
      const envelope = (await res.json()) as ApiEnvelope<{ start: string }>;
      if (!res.ok || envelope.success === false) {
        throw new Error(
          envelope.error?.message ?? "We couldn't request your booking. Please try again.",
        );
      }
      setConfirmed(envelope.data?.start ?? pickedSlot);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const brandPrimary = brand.primaryColor;
  const brandSecondary = brand.secondaryColor;

  return (
    <section
      style={{
        background: "#FFFFFF",
        padding: "clamp(64px, 9vw, 96px) 24px",
      }}
    >
      <style>{`
        .book-field {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.1);
          background: #FAF9F6;
          font-size: 16px;
          color: #3F3F42;
          font-family: inherit;
        }
        .book-field:focus { outline: none; border-color: ${brandPrimary}; }
        .book-slot-btn {
          border: 1px solid rgba(0,0,0,0.1);
          background: #FAF9F6;
          color: #3F3F42;
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
        }
        .book-slot-btn[aria-pressed="true"] {
          background: ${brandPrimary};
          border-color: ${brandPrimary};
          color: ${brandSecondary};
        }
      `}</style>

      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(26px, 3.4vw, 36px)",
            fontWeight: 700,
            letterSpacing: "-0.015em",
            color: brandSecondary,
          }}
        >
          {heading}
        </h2>
        {subtext && (
          <p
            style={{
              margin: 0,
              marginTop: 12,
              fontSize: 15.5,
              lineHeight: 1.6,
              color: "#4B4B50",
            }}
          >
            {subtext}
          </p>
        )}

        <div
          style={{
            marginTop: 32,
            background: "#FAF9F6",
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: 20,
            padding: "clamp(20px, 3vw, 28px)",
          }}
        >
          {loadingAvail && (
            <p style={{ margin: 0, fontSize: 14, color: "#6D6E71" }}>Loading availability…</p>
          )}
          {availError && (
            <p style={{ margin: 0, fontSize: 14, color: "#B91C1C" }}>{availError}</p>
          )}

          {!loadingAvail && !availError && !confirmed && availability && (
            <form onSubmit={submit} style={{ display: "grid", gap: 20 }}>
              {hasServices && (
                <div>
                  <FieldLabel color={brandSecondary}>Service</FieldLabel>
                  <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                    {availability.services.map((s) => {
                      const isPicked = pickedService?.id === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setPickedService(s)}
                          aria-pressed={isPicked}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 12,
                            padding: "14px 16px",
                            borderRadius: 14,
                            border: `1px solid ${isPicked ? brandPrimary : "rgba(0,0,0,0.1)"}`,
                            background: isPicked ? "#FFFDF5" : "#FFFFFF",
                            textAlign: "left",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            color: brandSecondary,
                          }}
                        >
                          <span style={{ flex: 1 }}>
                            <span style={{ fontSize: 15, fontWeight: 700, display: "block" }}>
                              {s.name}
                            </span>
                            {s.description && (
                              <span
                                style={{
                                  fontSize: 13,
                                  color: "#4B4B50",
                                  display: "block",
                                  marginTop: 4,
                                }}
                              >
                                {s.description}
                              </span>
                            )}
                            <span
                              style={{
                                fontSize: 11.5,
                                color: "#6D6E71",
                                display: "block",
                                marginTop: 6,
                              }}
                            >
                              {s.durationMinutes} min
                            </span>
                          </span>
                          <span
                            style={{
                              fontFamily: "ui-monospace, monospace",
                              fontSize: 13.5,
                              color: brandSecondary,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {s.priceKobo === 0 ? "Free" : `₦${(s.priceKobo / 100).toLocaleString()}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <FieldLabel color={brandSecondary}>Pick a time</FieldLabel>
                <div style={{ marginTop: 8 }}>
                  {loadingSlots ? (
                    <p style={{ margin: 0, fontSize: 14, color: "#6D6E71" }}>
                      Finding open slots…
                    </p>
                  ) : slots && slots.length === 0 ? (
                    <p
                      style={{
                        margin: 0,
                        padding: 12,
                        borderRadius: 12,
                        background: "#FFFFFF",
                        border: "1px solid rgba(0,0,0,0.08)",
                        fontSize: 14,
                        color: "#6D6E71",
                      }}
                    >
                      No open slots in the next 14 days. Please reach out to us directly.
                    </p>
                  ) : (
                    <div
                      style={{
                        maxHeight: 280,
                        overflowY: "auto",
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 14,
                        background: "#FFFFFF",
                        padding: 8,
                      }}
                    >
                      {slotsByDay.map(([day, times]) => (
                        <div key={day} style={{ marginBottom: 10 }}>
                          <p
                            style={{
                              margin: 0,
                              padding: "4px 6px",
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.14em",
                              textTransform: "uppercase",
                              color: "#6D6E71",
                            }}
                          >
                            {fmtDate(day)}
                          </p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: 6 }}>
                            {times.map((t) => (
                              <button
                                key={t}
                                type="button"
                                className="book-slot-btn"
                                onClick={() => setPickedSlot(t)}
                                aria-pressed={pickedSlot === t}
                              >
                                {fmtTime(t)}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <FieldLabel color={brandSecondary}>Your name</FieldLabel>
                  <input
                    className="book-field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Amaka Obi"
                  />
                </label>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                  <label style={{ display: "grid", gap: 6 }}>
                    <FieldLabel color={brandSecondary}>Phone</FieldLabel>
                    <input
                      className="book-field"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0801 234 5678"
                    />
                  </label>
                  <label style={{ display: "grid", gap: 6 }}>
                    <FieldLabel color={brandSecondary}>Email</FieldLabel>
                    <input
                      className="book-field"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </label>
                </div>
                {!hasServices && (
                  <label style={{ display: "grid", gap: 6 }}>
                    <FieldLabel color={brandSecondary}>What for? (optional)</FieldLabel>
                    <input
                      className="book-field"
                      value={freeService}
                      onChange={(e) => setFreeService(e.target.value)}
                      placeholder="Consultation, strategy call…"
                    />
                  </label>
                )}
              </div>

              {formError && (
                <p style={{ margin: 0, fontSize: 14, color: "#B91C1C" }}>{formError}</p>
              )}

              <button
                type="submit"
                disabled={submitting || !pickedSlot || (hasServices && !pickedService)}
                style={{
                  height: 52,
                  padding: "0 24px",
                  borderRadius: 999,
                  background: brandPrimary,
                  color: brandSecondary,
                  border: "none",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: submitting ? "wait" : "pointer",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  opacity: submitting || !pickedSlot ? 0.6 : 1,
                }}
              >
                {submitting ? "Requesting…" : "Request booking"}
              </button>
            </form>
          )}

          {confirmed && (
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: brandPrimary,
                  marginBottom: 8,
                }}
              >
                Confirmed
              </p>
              <h3
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 700,
                  color: brandSecondary,
                  letterSpacing: "-0.005em",
                }}
              >
                {successHeadline}
              </h3>
              <p
                style={{
                  margin: 0,
                  marginTop: 8,
                  fontSize: 15.5,
                  lineHeight: 1.6,
                  color: "#4B4B50",
                }}
              >
                Booked for <strong style={{ color: brandSecondary }}>{fmtDate(confirmed)} at {fmtTime(confirmed)}</strong>. {successBody}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FieldLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color,
      }}
    >
      {children}
    </span>
  );
}

function groupByDay(slots: string[]): Array<[string, string[]]> {
  const map = new Map<string, string[]>();
  for (const s of slots) {
    const d = new Date(s);
    if (isNaN(d.getTime())) continue;
    const key = d.toISOString().slice(0, 10);
    const arr = map.get(key);
    if (arr) arr.push(s);
    else map.set(key, [s]);
  }
  return Array.from(map.entries());
}

function fmtDate(t: string) {
  const d = new Date(t);
  return isNaN(d.getTime())
    ? t
    : d.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" });
}

function fmtTime(t: string) {
  const d = new Date(t);
  return isNaN(d.getTime())
    ? t
    : d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}
