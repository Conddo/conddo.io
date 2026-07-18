"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarDays, Clock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { publicBookingApi } from "@/lib/api/public-booking";
import { ApiError, isNotConfigured, isServerError } from "@/lib/api/client";
import type { DayKey } from "@/lib/api/bookings";
import { BRAND_NAME } from "@/lib/brand";

const inputCls =
  "h-11 w-full rounded-md border border-white/10 bg-cinema-elev px-3.5 text-[15px] text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none";
const labelCls = "mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-white/65";

const DAY_ORDER: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABEL: Record<DayKey, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
const fmtSlot = (t: string) => {
  const d = new Date(t);
  return isNaN(d.getTime()) ? t : d.toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

export default function PublicBookingPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { data, loading, error } = useApiQuery(() => publicBookingApi.availability(slug), [slug]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ start: string } | null>(null);

  const business = data?.business || "this business";
  const hours = data?.workingHours;
  const booked = data?.booked ?? [];
  const unavailable = error && !isNotConfigured(error) && !isServerError(error);
  const brandLogo = data?.logoUrl ?? null;
  const brandPrimary = data?.primaryColor ?? "#7C5CBF";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) return setFormError("Please enter your name.");
    if (!date || !time) return setFormError("Please pick a date and time.");
    const start = new Date(`${date}T${time}`);
    if (Number.isNaN(start.getTime())) return setFormError("That date/time looks invalid.");

    setSubmitting(true);
    try {
      const { data: result } = await publicBookingApi.book(slug, {
        customerName: name.trim(),
        customerPhone: phone.trim() || undefined,
        customerEmail: email.trim() || undefined,
        service: service.trim() || undefined,
        start: start.toISOString(),
      });
      setConfirmed({ start: result.start });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't request your booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cinema-base px-4 py-10">
      <div className="w-full max-w-md">
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

        <div className="rounded-2xl border border-white/[0.06] bg-cinema-elev p-7 sm:p-8">
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
                <span className="font-medium text-white">{fmtSlot(confirmed.start)}</span> shortly.
              </p>
            </div>
          ) : (
            <>
              <header className="mb-6 text-center">
                <h1 className="text-[22px] leading-tight tracking-[-0.01em] text-white">Book with {business}</h1>
                <p className="mt-1.5 text-[14px] text-white/65">Pick a time and share your details.</p>
              </header>

              {hours && (
                <div className="mb-5 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.05em] text-white/45">
                    <Clock size={13} /> Opening hours
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {DAY_ORDER.map((k) => {
                      const h = hours[k];
                      return (
                        <div key={k} className="flex justify-between text-[12px]">
                          <span className="text-white/65">{DAY_LABEL[k]}</span>
                          <span className="font-mono text-white">{h?.open ? `${h.start}–${h.end}` : "Closed"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {formError && (
                <div className="mb-5 flex items-center gap-2 rounded-lg border border-danger/20 bg-rose-500/[0.06] px-4 py-3 text-[14px] text-rose-200">
                  <AlertCircle size={18} className="shrink-0" /> {formError}
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Date</label>
                    <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} required />
                  </div>
                  <div>
                    <label className={labelCls}>Time</label>
                    <input type="time" className={inputCls} value={time} onChange={(e) => setTime(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Your name</label>
                  <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Amaka Obi" required />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input className={inputCls} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0801 234 5678" />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>What for? (optional)</label>
                  <input className={inputCls} value={service} onChange={(e) => setService(e.target.value)} placeholder="e.g. Consultation" />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{ background: brandPrimary }}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <CalendarDays size={18} />}
                  {submitting ? "Requesting…" : "Request booking"}
                </button>
              </form>

              {booked.length > 0 && (
                <div className="mt-5">
                  <p className="mb-1.5 text-[11px] uppercase tracking-[0.05em] text-white/45">Already booked</p>
                  <div className="flex flex-wrap gap-1.5">
                    {booked.slice(0, 8).map((b, i) => (
                      <span key={i} className="rounded-full border border-white/[0.06] px-2.5 py-1 text-[11px] text-white/65">
                        {fmtSlot(b.start)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
