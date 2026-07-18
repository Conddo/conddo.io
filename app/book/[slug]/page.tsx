"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CalendarDays, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { publicBookingApi, type PublicService } from "@/lib/api/public-booking";
import { ApiError, isNotConfigured, isServerError } from "@/lib/api/client";
import { BRAND_NAME } from "@/lib/brand";

const inputCls =
  "h-11 w-full rounded-md border border-white/10 bg-cinema-elev px-3.5 text-[15px] text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none";
const labelCls = "mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-white/65";

const fmtDate = (t: string) => {
  const d = new Date(t);
  return isNaN(d.getTime())
    ? t
    : d.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" });
};
const fmtTime = (t: string) => {
  const d = new Date(t);
  return isNaN(d.getTime())
    ? t
    : d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
};

export default function PublicBookingPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { data, loading, error } = useApiQuery(
    () => publicBookingApi.availability(slug),
    [slug],
  );

  const services = data?.services ?? [];
  const hasServices = services.length > 0;

  const [pickedService, setPickedService] = useState<PublicService | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [pickedSlot, setPickedSlot] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [freeService, setFreeService] = useState(""); // fallback when tenant has no services
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ start: string } | null>(null);

  const business = data?.business || "this business";
  const unavailable = error && !isNotConfigured(error) && !isServerError(error);
  const brandLogo = data?.logoUrl ?? null;
  const brandPrimary = data?.primaryColor ?? "#7C5CBF";

  // Auto-pick the first service when the tenant has exactly one — saves a click.
  useEffect(() => {
    if (hasServices && !pickedService) {
      if (services.length === 1) setPickedService(services[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasServices, services.length]);

  // Fetch slots whenever the picked service (or the tenant, once loaded) changes.
  useEffect(() => {
    if (!data) return;
    if (hasServices && !pickedService) return; // wait for pick
    setLoadingSlots(true);
    setPickedSlot(null);
    publicBookingApi
      .slots(slug, { serviceId: pickedService?.id, days: 14 })
      .then((r) => setSlots(r.data))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [slug, pickedService?.id, data, hasServices, pickedService]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) return setFormError("Please enter your name.");
    if (!pickedSlot) return setFormError("Pick a time slot.");
    if (hasServices && !pickedService) return setFormError("Pick a service.");

    setSubmitting(true);
    try {
      const { data: result } = await publicBookingApi.book(slug, {
        customerName: name.trim(),
        customerPhone: phone.trim() || undefined,
        customerEmail: email.trim() || undefined,
        serviceId: pickedService?.id,
        service: pickedService ? pickedService.name : freeService.trim() || undefined,
        start: pickedSlot,
      });
      setConfirmed({ start: result.start });
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : "Couldn't request your booking. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const slotsByDay = groupByDay(slots ?? []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-cinema-base px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center">
          {brandLogo ? (
            <Image
              src={brandLogo}
              alt={business}
              width={200}
              height={64}
              className="h-14 w-auto object-contain"
              unoptimized
            />
          ) : (
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-[20px] font-semibold text-white"
              style={{ background: brandPrimary }}
            >
              {business.slice(0, 1).toUpperCase()}
            </div>
          )}
          <p className="mt-3 text-[13px] font-medium text-white/70">{business}</p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-cinema-elev p-6 sm:p-7">
          {loading ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Loader2 size={24} className="mb-3 animate-spin text-primary" />
              <p className="text-[14px] text-white/65">Loading availability…</p>
            </div>
          ) : unavailable ? (
            <div className="py-8 text-center">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-rose-500/[0.06] text-rose-200">
                <AlertCircle size={26} />
              </span>
              <h1 className="text-[20px] tracking-[-0.01em] text-white">Booking unavailable</h1>
              <p className="mt-2 text-[14px] text-white/65">
                We couldn&apos;t find a booking page at this link. Please check the address.
              </p>
            </div>
          ) : confirmed ? (
            <div className="py-8 text-center">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                <CheckCircle2 size={28} />
              </span>
              <h1 className="text-[22px] tracking-[-0.01em] text-white">Booking requested</h1>
              <p className="mt-2 text-[15px] leading-relaxed text-white/65">
                Thanks, {name.trim().split(/\s+/)[0]}. {business} will confirm your booking for{" "}
                <span className="font-medium text-white">
                  {fmtDate(confirmed.start)} at {fmtTime(confirmed.start)}
                </span>
                . {email && "A confirmation email is on the way."}
              </p>
            </div>
          ) : (
            <>
              <header className="mb-5">
                <h1 className="text-[22px] leading-tight tracking-[-0.01em] text-white">
                  Book with {business}
                </h1>
                <p className="mt-1.5 text-[14px] text-white/60">
                  {hasServices
                    ? "Pick a service, then a time that works for you."
                    : "Pick a time and share your details."}
                </p>
              </header>

              {hasServices && (
                <section className="mb-5">
                  <p className={labelCls}>Service</p>
                  <div className="grid gap-2">
                    {services.map((s) => {
                      const isPicked = pickedService?.id === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setPickedService(s)}
                          aria-pressed={isPicked}
                          className={
                            "flex items-start justify-between gap-3 rounded-xl border p-3 text-left transition " +
                            (isPicked
                              ? "border-white/40 bg-white/[0.05]"
                              : "border-white/10 bg-white/[0.02] hover:border-white/25")
                          }
                          style={isPicked ? { borderColor: brandPrimary } : {}}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-[14px] font-medium text-white">{s.name}</div>
                            {s.description && (
                              <div className="mt-0.5 text-[12px] text-white/55">{s.description}</div>
                            )}
                            <div className="mt-1 text-[11px] text-white/45">{s.durationMinutes} min</div>
                          </div>
                          <div className="shrink-0 font-mono text-[13px] text-white/80">
                            {s.priceKobo === 0 ? "Free" : `₦${(s.priceKobo / 100).toLocaleString()}`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              <section className="mb-5">
                <p className={labelCls}>Pick a time</p>
                {loadingSlots ? (
                  <div className="flex items-center gap-2 py-4 text-[13px] text-white/50">
                    <Loader2 size={14} className="animate-spin" /> Finding open slots…
                  </div>
                ) : slots && slots.length === 0 ? (
                  <p className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-[13px] text-white/55">
                    No open slots in the next 14 days. Please reach out to {business} directly.
                  </p>
                ) : (
                  <div className="max-h-72 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-2">
                    {slotsByDay.map(([day, times]) => (
                      <div key={day} className="mb-3 last:mb-0">
                        <p className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wide text-white/50">
                          {fmtDate(day)}
                        </p>
                        <div className="flex flex-wrap gap-1.5 px-1">
                          {times.map((t) => {
                            const isPicked = pickedSlot === t;
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setPickedSlot(t)}
                                aria-pressed={isPicked}
                                className={
                                  "rounded-full border px-3 py-1 text-[12px] font-medium transition " +
                                  (isPicked
                                    ? "border-transparent text-white"
                                    : "border-white/12 bg-white/[0.02] text-white/80 hover:border-white/25")
                                }
                                style={isPicked ? { background: brandPrimary } : {}}
                              >
                                {fmtTime(t)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {formError && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger/20 bg-rose-500/[0.06] px-4 py-3 text-[14px] text-rose-200">
                  <AlertCircle size={18} className="shrink-0" /> {formError}
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className={labelCls}>Your name</label>
                  <input
                    className={inputCls}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Amaka Obi"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input
                      className={inputCls}
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0801 234 5678"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input
                      className={inputCls}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                {!hasServices && (
                  <div>
                    <label className={labelCls}>What for? (optional)</label>
                    <input
                      className={inputCls}
                      value={freeService}
                      onChange={(e) => setFreeService(e.target.value)}
                      placeholder="e.g. Consultation"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !pickedSlot || (hasServices && !pickedService)}
                  style={{ background: brandPrimary }}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CalendarDays size={18} />
                  )}
                  {submitting ? "Requesting…" : "Request booking"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-[12px] text-white/45">
          Powered by <span className="font-medium text-white/65">{BRAND_NAME}</span>
        </p>
      </div>
    </main>
  );
}

/** Group ISO datetimes by YYYY-MM-DD, preserving chronological order. */
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
