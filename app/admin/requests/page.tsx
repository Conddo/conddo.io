"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Send,
  CheckCircle2,
  CircleSlash,
} from "lucide-react";
import { StudioNav } from "@/components/admin/StudioNav";
import {
  adminApi,
  AdminApiError,
  clearAdminToken,
  getAdminToken,
  type AdminRequestRow,
  type RequestStatus,
  type RequestPriority,
  type RequestStatusFilter,
} from "@/lib/api/admin";

/** studio.getconddo.com/requests — every support request across every
 *  tenant. Filter tabs, inline reply, status change, priority change. */
export default function AdminRequestsPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/admin/dashboard");
      return;
    }
    setAuthed(true);
  }, [router]);

  if (authed !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={22} className="animate-spin text-white/50" />
      </div>
    );
  }
  return (
    <Body
      onSignOut={() => {
        clearAdminToken();
        router.replace("/admin/dashboard");
      }}
    />
  );
}

function Body({ onSignOut }: { onSignOut: () => void }) {
  const [rows, setRows] = useState<AdminRequestRow[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [filter, setFilter] = useState<RequestStatusFilter>("OPEN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadRows(f: RequestStatusFilter) {
    try {
      setRows(await adminApi.requests(f));
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Couldn't load requests");
    }
  }

  async function loadCounts() {
    try {
      setCounts(await adminApi.requestCounts());
    } catch {
      setCounts(null);
    }
  }

  async function loadAll() {
    setLoading(true);
    setError(null);
    await Promise.all([loadRows(filter), loadCounts()]);
    setLoading(false);
  }

  useEffect(() => { loadAll(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { loadRows(filter); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filter]);

  function onRowMutated(updated: AdminRequestRow) {
    setRows((prev) =>
      prev ? prev.map((r) => (r.id === updated.id ? updated : r)) : prev,
    );
    loadCounts();
  }

  return (
    <div>
      <StudioNav onRefresh={loadAll} onSignOut={onSignOut} />
      <div className="mx-auto max-w-6xl px-6 py-6">
        <h1 className="text-[22px] font-semibold text-white">Support requests</h1>
        <p className="mt-1 text-[13.5px] text-white/60">
          Requests, complaints, bugs, and questions from every tenant.
        </p>

        <FilterTabs value={filter} counts={counts} onChange={setFilter} />

        {loading && !rows && (
          <div className="mt-6 flex items-center justify-center text-white/50">
            <Loader2 size={16} className="mr-2 animate-spin" /> Loading…
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-rose-400/25 bg-rose-500/[0.06] p-4 text-rose-200">
            {error}
          </div>
        )}

        {rows && rows.length === 0 && !loading && (
          <div className="mt-6 rounded-2xl border border-white/[0.06] bg-[#111114] p-8 text-center text-[13.5px] text-white/55">
            Nothing in this bucket.
          </div>
        )}

        {rows && rows.length > 0 && (
          <ul className="mt-4 space-y-3">
            {rows.map((r) => (
              <li key={r.id}>
                <RequestCard row={r} onChange={onRowMutated} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- */
/* Filter tabs                                                     */
/* ------------------------------------------------------------- */

const FILTER_OPTIONS: RequestStatusFilter[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "DISMISSED", "ALL"];

const FILTER_LABEL: Record<RequestStatusFilter, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  DISMISSED: "Dismissed",
  ALL: "All",
};

function FilterTabs({
  value,
  counts,
  onChange,
}: {
  value: RequestStatusFilter;
  counts: Record<string, number> | null;
  onChange: (v: RequestStatusFilter) => void;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-1">
      {FILTER_OPTIONS.map((f) => {
        const active = value === f;
        const count = counts && f !== "ALL" ? counts[f] ?? 0 : undefined;
        return (
          <button
            key={f}
            onClick={() => onChange(f)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
              active
                ? "bg-white/[0.08] text-white"
                : "text-white/60 hover:bg-white/[0.03] hover:text-white/85"
            }`}
          >
            {FILTER_LABEL[f]}
            {count !== undefined && (
              <span className="rounded-full bg-white/[0.06] px-1.5 font-mono text-[10.5px] text-white/70">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------- */
/* Request card                                                    */
/* ------------------------------------------------------------- */

const STATUS_TONE: Record<RequestStatus, string> = {
  OPEN: "bg-amber-500/15 text-amber-200",
  IN_PROGRESS: "bg-primary/15 text-primary-light",
  RESOLVED: "bg-emerald-500/15 text-emerald-300",
  DISMISSED: "bg-white/[0.08] text-white/50",
};

const KIND_LABEL: Record<string, string> = {
  FEATURE: "Feature",
  COMPLAINT: "Complaint",
  BUG: "Bug",
  QUESTION: "Question",
};

const PRIORITY_TONE: Record<RequestPriority, string> = {
  HIGH: "border-rose-400/30 text-rose-200",
  NORMAL: "border-white/15 text-white/70",
  LOW: "border-white/10 text-white/45",
};

function RequestCard({
  row,
  onChange,
}: {
  row: AdminRequestRow;
  onChange: (r: AdminRequestRow) => void;
}) {
  const [open, setOpen] = useState(row.status === "OPEN");
  const [reply, setReply] = useState(row.adminResponse ?? "");
  const [busy, setBusy] = useState<null | "reply" | "status" | "priority">(null);
  const [error, setError] = useState<string | null>(null);

  const createdAt = useMemo(
    () => new Date(row.createdAt).toLocaleString(),
    [row.createdAt],
  );

  async function sendReply() {
    if (busy || !reply.trim()) return;
    setBusy("reply");
    setError(null);
    try {
      const updated = await adminApi.respondToRequest(row.id, reply.trim());
      onChange(updated);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Couldn't send reply");
    } finally {
      setBusy(null);
    }
  }

  async function setStatus(status: RequestStatus) {
    if (busy || status === row.status) return;
    setBusy("status");
    setError(null);
    try {
      const updated = await adminApi.changeRequestStatus(row.id, status);
      onChange(updated);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Couldn't change status");
    } finally {
      setBusy(null);
    }
  }

  async function setPriority(priority: RequestPriority) {
    if (busy || priority === row.priority) return;
    setBusy("priority");
    setError(null);
    try {
      const updated = await adminApi.changeRequestPriority(row.id, priority);
      onChange(updated);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Couldn't change priority");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-2xl border border-white/[0.06] bg-[#111114] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 px-5 py-3.5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="truncate text-[14.5px] font-medium text-white">{row.title}</p>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${STATUS_TONE[row.status]}`}
            >
              {row.status.toLowerCase().replace("_", " ")}
            </span>
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase ${PRIORITY_TONE[row.priority]}`}>
              {row.priority.toLowerCase()}
            </span>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-white/50">
            <span>{KIND_LABEL[row.kind] ?? row.kind}</span>
            <Link
              href={`/admin/tenants/${row.tenantId}`}
              onClick={(e) => e.stopPropagation()}
              className="text-primary-light hover:underline"
            >
              {row.tenantName}
              {row.tenantSlug && <span className="text-white/40"> @{row.tenantSlug}</span>}
            </Link>
            <span>{createdAt}</span>
            {row.adminResponse && <span className="text-emerald-300">Replied</span>}
          </p>
        </div>
        {open ? (
          <ChevronDown size={14} className="text-white/45" />
        ) : (
          <ChevronRight size={14} className="text-white/45" />
        )}
      </button>

      {open && (
        <div className="border-t border-white/[0.06] bg-black/25 px-5 py-4 space-y-4">
          <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-white/85">
            {row.body}
          </p>

          {/* Reply box */}
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-white/60">
              Reply
            </p>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              maxLength={10_000}
              placeholder="Type your reply. Tenant sees this in their Settings → Support."
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[13.5px] text-white outline-none placeholder:text-white/30 focus:border-primary/50"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-[10.5px] text-white/40">
                {reply.length}/10000
              </span>
              <button
                onClick={sendReply}
                disabled={busy !== null || !reply.trim() || reply === row.adminResponse}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/90 px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-primary disabled:opacity-50"
              >
                {busy === "reply" ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                {row.adminResponse ? "Update reply" : "Send reply"}
              </button>
            </div>
          </div>

          {/* Status + priority quick actions */}
          <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.05] pt-4">
            <span className="text-[11px] font-medium uppercase tracking-wide text-white/60">
              Status
            </span>
            <StatusButton current={row.status} target="IN_PROGRESS" onClick={() => setStatus("IN_PROGRESS")} busy={busy === "status"} />
            <StatusButton current={row.status} target="RESOLVED" onClick={() => setStatus("RESOLVED")} busy={busy === "status"} tone="emerald" />
            <StatusButton current={row.status} target="DISMISSED" onClick={() => setStatus("DISMISSED")} busy={busy === "status"} tone="mute" />
            <StatusButton current={row.status} target="OPEN" onClick={() => setStatus("OPEN")} busy={busy === "status"} tone="reopen" />

            <span className="ml-4 text-[11px] font-medium uppercase tracking-wide text-white/60">
              Priority
            </span>
            <PriorityButton current={row.priority} target="HIGH" onClick={() => setPriority("HIGH")} busy={busy === "priority"} />
            <PriorityButton current={row.priority} target="NORMAL" onClick={() => setPriority("NORMAL")} busy={busy === "priority"} />
            <PriorityButton current={row.priority} target="LOW" onClick={() => setPriority("LOW")} busy={busy === "priority"} />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-400/25 bg-rose-500/[0.08] p-3 text-[13px] text-rose-200">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function StatusButton({
  current,
  target,
  onClick,
  busy,
  tone,
}: {
  current: RequestStatus;
  target: RequestStatus;
  onClick: () => void;
  busy: boolean;
  tone?: "emerald" | "mute" | "reopen";
}) {
  const active = current === target;
  const label = FILTER_LABEL[target];
  const base =
    "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11.5px] font-medium transition-colors disabled:opacity-60";
  const cls = active
    ? "border-white/25 bg-white/[0.08] text-white cursor-default"
    : tone === "emerald"
      ? "border-emerald-400/25 bg-emerald-500/[0.06] text-emerald-200 hover:bg-emerald-500/[0.10]"
      : tone === "mute"
        ? "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.06]"
        : tone === "reopen"
          ? "border-amber-400/25 bg-amber-500/[0.06] text-amber-200 hover:bg-amber-500/[0.10]"
          : "border-primary/25 bg-primary/[0.06] text-primary-light hover:bg-primary/[0.10]";
  return (
    <button
      onClick={onClick}
      disabled={busy || active}
      className={`${base} ${cls}`}
    >
      {tone === "emerald" && <CheckCircle2 size={11} />}
      {tone === "mute" && <CircleSlash size={11} />}
      {label}
    </button>
  );
}

function PriorityButton({
  current,
  target,
  onClick,
  busy,
}: {
  current: RequestPriority;
  target: RequestPriority;
  onClick: () => void;
  busy: boolean;
}) {
  const active = current === target;
  return (
    <button
      onClick={onClick}
      disabled={busy || active}
      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11.5px] font-medium disabled:opacity-60 ${
        active
          ? "border-white/25 bg-white/[0.08] text-white"
          : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
      }`}
    >
      {target[0] + target.slice(1).toLowerCase()}
    </button>
  );
}
