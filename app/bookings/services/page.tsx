"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import {
  bookableServicesApi,
  type BookableService,
  type UpsertServiceInput,
} from "@/lib/api/bookable-services";
import { ApiError } from "@/lib/api/client";

/**
 * Owner-side CRUD for the tenant's bookable services menu.
 *
 * <p>Each row = one entry on the customer-facing /book page. Duration
 * drives the slot-grid step; price is optional (shown as "Free" when 0).
 * Rows can be draft-toggled with the Active switch — a disabled row
 * still exists but the customer doesn't see it.
 */
export default function ServicesPage() {
  const [rows, setRows] = useState<BookableService[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setError(null);
    try {
      const res = await bookableServicesApi.list();
      setRows(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load services.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell
      title="Services"
      subtitle="What can customers book on your page? Each row is a menu entry with a duration and price."
      actions={
        <Button onClick={() => setCreating(true)} variant="primary" className="gap-1.5">
          <Plus size={16} /> New service
        </Button>
      }
    >
      <div className="mb-4">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1.5 text-[13px] text-white/55 hover:text-white/85"
        >
          <ArrowLeft size={13} /> Bookings
        </Link>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-400/20 bg-rose-500/[0.06] p-3 text-[13px] text-rose-200">
          <AlertCircle size={16} className="mt-0.5" /> {error}
        </div>
      )}

      {!rows && !error && (
        <div className="flex items-center gap-2 py-10 text-[13px] text-white/50">
          <Loader2 size={14} className="animate-spin" /> Loading services…
        </div>
      )}

      {rows && rows.length === 0 && !creating && (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
          <p className="text-[14px] text-white/70">
            You haven&apos;t added any services yet. Customers will see a plain
            &quot;what for?&quot; box until you do.
          </p>
          <Button
            onClick={() => setCreating(true)}
            variant="primary"
            className="mt-4 gap-1.5"
          >
            <Plus size={15} /> Add your first service
          </Button>
        </div>
      )}

      {rows && rows.length > 0 && (
        <ul className="divide-y divide-white/6 rounded-xl border border-white/10 bg-cinema-elev">
          {rows.map((r) => (
            <ServiceRowItem key={r.id} row={r} onChange={load} />
          ))}
        </ul>
      )}

      {creating && (
        <NewServiceModal
          onDismiss={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            load();
          }}
        />
      )}
    </AppShell>
  );
}

// ----- one row -----------------------------------------------------------

function ServiceRowItem({
  row,
  onChange,
}: {
  row: BookableService;
  onChange: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const price = row.priceKobo === 0 ? "Free" : `₦${(row.priceKobo / 100).toLocaleString()}`;

  async function toggleActive() {
    setBusy(true);
    try {
      await bookableServicesApi.update(row.id, { active: !row.active });
      onChange();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete "${row.name}"? Existing bookings are unaffected.`)) return;
    setBusy(true);
    try {
      await bookableServicesApi.remove(row.id);
      onChange();
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className={"flex items-center gap-4 p-4 " + (row.active ? "" : "opacity-60")}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[14px] font-medium text-white">{row.name}</p>
          {!row.active && (
            <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/60">
              hidden
            </span>
          )}
        </div>
        {row.description && (
          <p className="mt-0.5 truncate text-[12px] text-white/55">{row.description}</p>
        )}
        <p className="mt-0.5 text-[12px] text-white/45">
          {row.durationMinutes} min · <span className="text-white/80">{price}</span>
        </p>
      </div>
      <button
        onClick={toggleActive}
        disabled={busy}
        className={
          "inline-flex h-6 w-11 items-center rounded-full transition disabled:opacity-50 " +
          (row.active ? "bg-emerald-500/70" : "bg-white/12")
        }
        aria-pressed={row.active}
        aria-label={row.active ? "Hide from customers" : "Show to customers"}
      >
        <span
          className={
            "h-5 w-5 rounded-full bg-white transition " +
            (row.active ? "translate-x-[22px]" : "translate-x-[2px]")
          }
        />
      </button>
      <button
        onClick={remove}
        disabled={busy}
        className="inline-flex items-center rounded-md p-1.5 text-white/45 hover:text-rose-300 disabled:opacity-40"
        aria-label={`Delete ${row.name}`}
      >
        <Trash2 size={14} />
      </button>
    </li>
  );
}

// ----- create modal ------------------------------------------------------

function NewServiceModal({
  onDismiss,
  onCreated,
}: {
  onDismiss: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("30");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const durationMin = Number(duration);
    if (!name.trim()) return setError("Give the service a name.");
    if (!Number.isFinite(durationMin) || durationMin < 5)
      return setError("Duration must be at least 5 minutes.");
    const priceKobo = price.trim() ? Math.round(Number(price) * 100) : 0;
    if (!Number.isFinite(priceKobo) || priceKobo < 0)
      return setError("Price looks off.");
    const body: UpsertServiceInput = {
      name: name.trim(),
      description: description.trim() || null,
      durationMinutes: durationMin,
      priceKobo,
      active: true,
    };
    setSubmitting(true);
    try {
      await bookableServicesApi.create(body);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save the service.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-cinema-elev p-5">
        <div className="text-[15px] font-semibold text-white">Add a service</div>
        <p className="mt-1 text-[12px] text-white/55">
          Customers see this row on your public booking page.
        </p>

        <form onSubmit={onSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-white/55">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Consultation"
              className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-[14px] text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-white/55">Description (optional)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Free 15-min intro chat"
              className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-[14px] text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wide text-white/55">
                Duration (min)
              </label>
              <input
                type="number"
                min={5}
                step={5}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-[14px] text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wide text-white/55">
                Price (₦)
              </label>
              <input
                type="number"
                min={0}
                step={100}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0 = free"
                className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-[14px] text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-400/20 bg-rose-500/[0.06] p-3 text-[13px] text-rose-200">
              {error}
            </div>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onDismiss}
              disabled={submitting}
              className="rounded-md border border-white/10 px-3 py-1.5 text-[13px] text-white/70 hover:text-white"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
              Add service
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
