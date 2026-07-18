"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Share2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  MapPin,
  User,
  Copy,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { NewBookingModal } from "@/components/app/NewBookingModal";
import { AvailabilityModal } from "@/components/app/AvailabilityModal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";
import { meQuery } from "@/lib/api/account";
import { bookingsApi, type BookingEvent, type DayKey } from "@/lib/api/bookings";
import { tenantBookingUrl } from "@/lib/brand";

const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]; // 08:00–18:00, 60px each
const HOUR_PX = 60;
const GRID_HEIGHT = HOURS.length * HOUR_PX;
const pad = (h: number) => `${String(h).padStart(2, "0")}:00`;
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const fmtTime = (t: string) => {
  const d = new Date(t);
  if (!isNaN(d.getTime())) return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const m = t.match(/(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : t;
};

// Week (Mon–Sun) at `offset` from the current week. offset=0 → this week,
// -1 → previous, +1 → next. The "Today" button resets to 0.
function weekFromOffset(offset: number): { dates: Date[]; monthLabel: string } {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  const sunday = dates[6];
  // Show "Month — Month Year" when the week straddles a month boundary; one
  // label otherwise.
  const sameMonth = monday.getMonth() === sunday.getMonth() && monday.getFullYear() === sunday.getFullYear();
  const monthLabel = sameMonth
    ? monday.toLocaleString("en-US", { month: "long", year: "numeric" })
    : `${monday.toLocaleString("en-US", { month: "short" })}–${sunday.toLocaleString("en-US", { month: "short", year: "numeric" })}`;
  return { dates, monthLabel };
}

function placeEvent(ev: BookingEvent, dates: Date[]) {
  const s = new Date(ev.start);
  if (isNaN(s.getTime())) return null;
  const dayIdx = dates.findIndex((d) => sameDay(d, s));
  if (dayIdx < 0) return null;
  const startH = s.getHours() + s.getMinutes() / 60;
  if (startH < HOURS[0] || startH >= HOURS[0] + HOURS.length) return null;
  const e = ev.end ? new Date(ev.end) : null;
  const endH = e && !isNaN(e.getTime()) ? e.getHours() + e.getMinutes() / 60 : startH + 1;
  return { dayIdx, top: (startH - HOURS[0]) * HOUR_PX, height: Math.max((endH - startH) * HOUR_PX, 30) };
}

export default function BookingsPage() {
  const toast = useToast();
  const today = new Date();
  const [weekOffset, setWeekOffset] = useState(0);
  const { dates, monthLabel } = weekFromOffset(weekOffset);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [availOpen, setAvailOpen] = useState(false);

  const events = useApiQuery(() => bookingsApi.range(iso(dates[0]), iso(dates[6])), [iso(dates[0])]);
  const upcoming = useApiQuery(bookingsApi.upcoming);
  const availabilityQ = useApiQuery(bookingsApi.availability);
  const { data: performance } = useApiQuery(bookingsApi.performance);
  const { data: me } = useApiQuery(meQuery);

  const evs = events.data ?? [];
  const upcomingList = upcoming.data ?? [];
  const availability = availabilityQ.data;
  const hours = availability?.workingHours;
  const bookingLink = tenantBookingUrl(me?.tenant?.subdomain);

  function refetchAll() {
    events.refetch();
    upcoming.refetch();
    availabilityQ.refetch();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(bookingLink.startsWith("http") ? bookingLink : `https://${bookingLink}`);
      toast.success("Link copied", bookingLink);
    } catch {
      toast.error("Couldn't copy", "Copy the link manually.");
    }
  }

  return (
    <AppShell
      title="Bookings"
      subtitle="Manage your consultation schedule and client meetings."
      actions={
        <>
          <Link
            href="/bookings/services"
            className="hidden items-center gap-1.5 rounded-md border border-white/12 bg-white/[0.03] px-3 py-1.5 text-[13px] text-white/85 hover:bg-white/[0.08] sm:inline-flex"
          >
            Services
          </Link>
          <Button variant="secondary" size="md" className="hidden sm:inline-flex" onClick={copyLink}>
            <Share2 size={16} />
            Share link
          </Button>
          <Button variant="primary" size="md" onClick={() => setBookingOpen(true)}>
            <Plus size={17} />
            <span className="hidden sm:inline">New Booking</span>
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        {/* Calendar + upcoming */}
        <div className="min-w-0 space-y-6">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-cinema-elev p-3">
            <div className="flex flex-wrap items-center gap-4">
              <span className="rounded-md bg-white/[0.02] px-3 py-1.5 text-[13px] font-bold text-primary">Week</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous week"
                  onClick={() => setWeekOffset((n) => n - 1)}
                  className="rounded-full p-1 text-white/65 hover:bg-white/[0.02] hover:text-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="px-1 text-[15px] font-medium text-white">{monthLabel}</span>
                <button
                  type="button"
                  aria-label="Next week"
                  onClick={() => setWeekOffset((n) => n + 1)}
                  className="rounded-full p-1 text-white/65 hover:bg-white/[0.02] hover:text-white"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              disabled={weekOffset === 0}
              className="rounded-lg border border-white/[0.06] px-4 py-1.5 text-[13px] font-medium text-white hover:bg-white/[0.02] disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Today
            </button>
          </div>

          {/* Week grid */}
          <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-cinema-elev">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-white/[0.06] bg-white/[0.02]">
                <div className="border-r border-white/[0.06]" />
                {dates.map((d, i) => {
                  const isToday = sameDay(d, today);
                  return (
                    <div key={i} className={`border-r border-white/[0.06] p-3 text-center last:border-r-0 ${isToday ? "bg-primary/[0.08]" : ""}`}>
                      <div className={`text-[11px] uppercase tracking-[0.05em] ${isToday ? "font-bold text-primary" : "text-white/45"}`}>{DOW[i]}</div>
                      <div className={`text-[16px] ${isToday ? "font-bold text-primary" : "text-white"}`}>{d.getDate()}</div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-[64px_1fr]">
                <div>
                  {HOURS.map((h) => (
                    <div key={h} className="relative h-[60px]">
                      <span className="absolute -top-2 right-2 font-mono text-[11px] text-white/45">{pad(h)}</span>
                    </div>
                  ))}
                </div>
                <div className="relative" style={{ height: GRID_HEIGHT }}>
                  <div className="absolute inset-0 grid grid-cols-7">
                    {dates.map((d, i) => (
                      <div key={i} className={`border-r border-white/[0.06] last:border-r-0 ${sameDay(d, today) ? "bg-primary/[0.08]" : ""}`} />
                    ))}
                  </div>
                  <div className="absolute inset-0">
                    {HOURS.map((h) => (
                      <div key={h} className="h-[60px] border-b border-white/[0.06]/60" />
                    ))}
                  </div>
                  {evs.map((ev) => {
                    const pos = placeEvent(ev, dates);
                    if (!pos) return null;
                    return (
                      <div
                        key={ev.id}
                        className="absolute p-1"
                        style={{ left: `${(pos.dayIdx / 7) * 100}%`, width: `${100 / 7}%`, top: pos.top, height: pos.height }}
                      >
                        <div className="flex h-full w-full cursor-pointer flex-col justify-center overflow-hidden rounded-r-md border-l-4 border-primary bg-primary/[0.08] p-2 transition-all hover:brightness-105">
                          <div className="truncate text-[11px] font-bold text-primary">{ev.customer}</div>
                          <div className="truncate text-[10px] text-primary/80">{ev.service}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming */}
          <div>
            <h2 className="mb-4 text-[18px] font-medium tracking-[-0.01em] text-white">Upcoming this week</h2>
            {upcomingList.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingList.map((u) => (
                  <div key={u.id} className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
                    <div className="flex items-start justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/[0.08] text-primary"><User size={20} /></span>
                      {u.when && <span className="rounded bg-white/[0.02] px-2 py-1 text-[11px] text-white/65">{u.when}</span>}
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-white">{u.customer}</p>
                      <p className="text-[14px] text-white/65">{u.service}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/[0.06] pt-3 text-[11px] text-white/45">
                      <span className="flex items-center gap-1 font-mono"><Clock size={14} /> {fmtTime(u.start)}</span>
                      {u.mode && <span className="flex items-center gap-1">{u.mode === "in-person" ? <MapPin size={14} /> : <Video size={14} />} {u.mode}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-white/[0.06] bg-cinema-elev px-6 py-10 text-center text-[14px] text-white/65">
                No upcoming bookings this week.
              </div>
            )}
          </div>
        </div>

        {/* Availability sidebar */}
        <aside className="space-y-8 rounded-xl border border-white/[0.06] bg-cinema-elev p-6">
          <h3 className="text-[16px] font-medium text-white">Availability Settings</h3>

          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.05em] text-white/45">Working Hours</p>
            <div className="space-y-1.5">
              {DAY_KEYS.map((k, i) => {
                const h = hours?.[k];
                return (
                  <div key={k} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-cinema-base px-3 py-2">
                    <span className="text-[14px] font-medium text-white">{DOW[i]}</span>
                    <span className="font-mono text-[13px] text-white/65">
                      {h ? (h.open ? `${h.start} - ${h.end}` : "Closed") : "—"}
                    </span>
                  </div>
                );
              })}
              <button onClick={() => setAvailOpen(true)} className="text-[13px] font-medium text-primary hover:underline">Edit schedule</button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.05em] text-white/45">Booking Duration</span>
              <span className="font-mono text-[13px] text-white">{availability ? `${availability.slotDurationMinutes} min` : "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.05em] text-white/45">Buffer Time</span>
              <span className="font-mono text-[13px] text-white">
                {availability ? (availability.bufferMinutes === 0 ? "No buffer" : `${availability.bufferMinutes} min`) : "—"}
              </span>
            </div>
            <Button variant="secondary" size="md" className="w-full" onClick={() => setAvailOpen(true)}>
              Edit availability
            </Button>
          </div>

          <div className="border-t border-white/[0.06] pt-6">
            <p className="mb-2 text-[11px] uppercase tracking-[0.05em] text-white/45">Shareable Link</p>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="mb-2 text-[12px] text-white/45">Allow clients to book directly on your calendar.</p>
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-cinema-elev p-2">
                <span className="flex-1 truncate font-mono text-[11px] text-white/65">{bookingLink}</span>
                <button onClick={copyLink} aria-label="Copy link" className="rounded-md p-1 text-white/45 hover:bg-white/[0.02] hover:text-white"><Copy size={14} /></button>
              </div>
              <button onClick={copyLink} className="w-full rounded-lg border border-primary/20 bg-primary/[0.08] py-2 text-[14px] font-bold text-primary transition-colors hover:bg-primary/10">
                Copy booking link
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-white/[0.02] p-4">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              <span className="text-[14px] font-bold text-white">Weekly Performance</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[12px]">
                <span className="text-white/65">Bookings this week</span>
                <span className="font-bold text-white">{performance?.bookingsThisWeek ?? 0}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-white/65">Revenue projected</span>
                <span className="font-mono font-bold text-white">{naira(performance?.revenueProjected ?? 0)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <NewBookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        defaultDate={iso(today)}
        onCreated={refetchAll}
      />
      <AvailabilityModal
        open={availOpen}
        onClose={() => setAvailOpen(false)}
        current={availability ?? null}
        onSaved={refetchAll}
      />
    </AppShell>
  );
}
