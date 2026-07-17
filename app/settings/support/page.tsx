"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  Lightbulb,
  MessageSquare,
  Bug,
  HelpCircle,
  Send,
} from "lucide-react";
import { SettingsShell } from "@/components/app/SettingsShell";
import {
  supportApi,
  type RequestKind,
  type RequestStatus,
  type SupportRequest,
} from "@/lib/api/support";
import { ApiError } from "@/lib/api/client";

/** /settings/support — tenants file feature requests, complaints, bug
 *  reports, and questions here. They see their own history with the
 *  platform's reply (if any) inline. */
export default function SupportPage() {
  return (
    <SettingsShell
      active="support"
      title="Support &amp; Requests"
      description="Ask a question, report a bug, request a feature, or share feedback. We reply here."
    >
      <SupportBody />
    </SettingsShell>
  );
}

function SupportBody() {
  const [requests, setRequests] = useState<SupportRequest[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await supportApi.list();
      setRequests(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <SubmitForm
        onSubmitted={(r) => {
          setFlash("Thanks — we'll get back to you here.");
          setRequests((prev) => [r, ...(prev ?? [])]);
          setTimeout(() => setFlash(null), 4000);
        }}
      />

      {flash && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/[0.06] p-3 text-[13.5px] text-emerald-200">
          <Check size={15} className="mt-0.5 shrink-0" />
          <p>{flash}</p>
        </div>
      )}

      <RequestsList
        requests={requests}
        loading={loading}
        error={error}
        onRefresh={load}
      />
    </div>
  );
}

/* ------------------------------------------------------------------- */
/* Submit form                                                          */
/* ------------------------------------------------------------------- */

const KIND_OPTIONS: { id: RequestKind; label: string; icon: typeof Lightbulb; hint: string }[] = [
  {
    id: "FEATURE",
    label: "Feature request",
    icon: Lightbulb,
    hint: "Something you wish Conddo could do",
  },
  {
    id: "COMPLAINT",
    label: "Complaint",
    icon: MessageSquare,
    hint: "Something isn't working the way you expected",
  },
  {
    id: "BUG",
    label: "Bug",
    icon: Bug,
    hint: "You found something broken",
  },
  {
    id: "QUESTION",
    label: "Question",
    icon: HelpCircle,
    hint: "You're stuck and need help",
  },
];

function SubmitForm({ onSubmitted }: { onSubmitted: (r: SupportRequest) => void }) {
  const [kind, setKind] = useState<RequestKind>("FEATURE");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await supportApi.submit({
        kind,
        title: title.trim(),
        body: body.trim(),
      });
      onSubmitted(res.data);
      setTitle("");
      setBody("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/[0.06] bg-cinema-elev p-5">
      <p className="mb-4 text-[12px] font-medium uppercase tracking-wide text-white/60">
        Send us a note
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <p className="mb-2 text-[12px] font-medium text-white/70">What&apos;s this about?</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {KIND_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = kind === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setKind(opt.id)}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors ${
                    active
                      ? "border-primary/40 bg-primary/[0.08]"
                      : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]"
                  }`}
                >
                  <Icon size={16} className={active ? "text-primary-light" : "text-white/70"} />
                  <span className="text-[13px] font-medium text-white">{opt.label}</span>
                  <span className="text-[11px] text-white/50">{opt.hint}</span>
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-white/70">
            Title
          </span>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="A short summary — one line"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-[13.5px] text-white outline-none placeholder:text-white/30 focus:border-primary/50"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-white/70">
            Tell us more
          </span>
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={5000}
            rows={5}
            placeholder="Context, steps you tried, screenshots (paste image URLs), anything that helps us respond well"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-[13.5px] text-white outline-none placeholder:text-white/30 focus:border-primary/50"
          />
          <span className="mt-1 block text-right font-mono text-[10.5px] text-white/40">
            {body.length}/5000
          </span>
        </label>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-400/25 bg-rose-500/[0.08] p-3 text-[13px] text-rose-200">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={submitting || !title.trim() || !body.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-[13px] font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            Send
          </button>
        </div>
      </form>
    </section>
  );
}

/* ------------------------------------------------------------------- */
/* History list                                                         */
/* ------------------------------------------------------------------- */

function RequestsList({
  requests,
  loading,
  error,
  onRefresh,
}: {
  requests: SupportRequest[] | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  if (loading && !requests) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-white/[0.06] bg-cinema-elev p-8 text-white/55">
        <Loader2 size={16} className="mr-2 animate-spin" /> Loading your history…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-400/25 bg-rose-500/[0.06] p-4 text-rose-200">
        <p className="text-[13.5px]">{error}</p>
        <button
          onClick={onRefresh}
          className="mt-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-[12.5px] font-medium text-rose-100 hover:bg-rose-500/20"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-cinema-elev p-6 text-center text-[13.5px] text-white/55">
        You haven&apos;t sent any requests yet.
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-white/[0.06] bg-cinema-elev overflow-hidden">
      <header className="border-b border-white/[0.06] px-5 py-3.5">
        <h2 className="text-[13.5px] font-medium text-white">Your requests</h2>
      </header>
      <ul className="divide-y divide-white/[0.06]">
        {requests.map((r) => (
          <li key={r.id}>
            <RequestRow request={r} />
          </li>
        ))}
      </ul>
    </section>
  );
}

const STATUS_TONE: Record<RequestStatus, string> = {
  OPEN: "bg-amber-500/15 text-amber-200",
  IN_PROGRESS: "bg-primary/15 text-primary-light",
  RESOLVED: "bg-emerald-500/15 text-emerald-300",
  DISMISSED: "bg-white/[0.08] text-white/50",
};

const KIND_LABEL: Record<RequestKind, string> = {
  FEATURE: "Feature",
  COMPLAINT: "Complaint",
  BUG: "Bug",
  QUESTION: "Question",
};

function RequestRow({ request }: { request: SupportRequest }) {
  const [open, setOpen] = useState(false);
  const created = useMemo(
    () => new Date(request.createdAt).toLocaleDateString(),
    [request.createdAt],
  );
  const respondedAt = request.respondedAt
    ? new Date(request.respondedAt).toLocaleDateString()
    : null;

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="truncate text-[14px] font-medium text-white">{request.title}</p>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${STATUS_TONE[request.status]}`}
            >
              {request.status.toLowerCase().replace("_", " ")}
            </span>
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-white/50">
            <span>{KIND_LABEL[request.kind]}</span>
            <span>{created}</span>
            {request.adminResponse && <span className="text-primary-light">Reply received</span>}
          </p>
        </div>
        {open ? (
          <ChevronDown size={13} className="text-white/50" />
        ) : (
          <ChevronRight size={13} className="text-white/50" />
        )}
      </button>

      {open && (
        <div className="border-t border-white/[0.06] bg-black/25 px-5 py-4">
          <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-white/85">
            {request.body}
          </p>
          {request.adminResponse ? (
            <div className="mt-4 rounded-xl border border-primary/25 bg-primary/[0.06] p-3.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-primary-light">
                Reply from Conddo
                {respondedAt && (
                  <span className="ml-2 font-mono normal-case text-white/50">
                    {respondedAt}
                  </span>
                )}
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-white/90">
                {request.adminResponse}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-[12px] text-white/45">
              We haven&apos;t replied yet. You&apos;ll see the response here.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
