"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PaymentsStatusBanner } from "@/components/app/PaymentsStatusBanner";
import { Button } from "@/components/ui/Button";
import {
  fmtNaira,
  invoicesApi,
  type InvoiceLineInput,
  type UpsertInvoiceInput,
} from "@/lib/api/invoices";
import { ApiError } from "@/lib/api/client";

/**
 * /invoices/new — draft invoice creation.
 *
 * <p>Line items enter in naira for readability (customers think in ₦,
 * not kobo); we convert to kobo at submit time. Tax rate is optional
 * per-line so a single invoice can mix VAT-eligible items with exempt
 * ones (Nigerian 7.5% VAT is the sensible default the picker shortcuts
 * to but doesn't apply automatically).
 */
type LineDraft = {
  description: string;
  quantity: string;
  unitPriceNaira: string;
  taxRatePercent: string;
};

const EMPTY_LINE: LineDraft = {
  description: "",
  quantity: "1",
  unitPriceNaira: "",
  taxRatePercent: "",
};

export default function NewInvoicePage() {
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [discountNaira, setDiscountNaira] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([{ ...EMPTY_LINE }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => computeTotals(lines, discountNaira), [lines, discountNaira]);

  function updateLine(idx: number, patch: Partial<LineDraft>) {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }
  function addLine() {
    setLines((prev) => [...prev, { ...EMPTY_LINE }]);
  }
  function removeLine(idx: number) {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!customerName.trim()) return setError("Customer name is required.");

    const cleanedLines: InvoiceLineInput[] = [];
    for (const l of lines) {
      const desc = l.description.trim();
      const qty = Number(l.quantity);
      const unit = Number(l.unitPriceNaira);
      if (!desc && !unit) continue;
      if (!desc) return setError("Every line needs a description.");
      if (!Number.isFinite(qty) || qty <= 0)
        return setError("Quantity on every line must be positive.");
      if (!Number.isFinite(unit) || unit < 0)
        return setError("Unit price on every line must be zero or more.");
      const taxRate = l.taxRatePercent.trim() ? Number(l.taxRatePercent) : null;
      cleanedLines.push({
        description: desc,
        quantity: qty,
        unitPriceKobo: Math.round(unit * 100),
        taxRatePercent: taxRate,
      });
    }
    if (cleanedLines.length === 0) return setError("Add at least one line item.");

    const body: UpsertInvoiceInput = {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim() || null,
      customerPhone: customerPhone.trim() || null,
      customerAddress: customerAddress.trim() || null,
      dueDate: dueDate || null,
      notes: notes.trim() || null,
      terms: terms.trim() || null,
      discountKobo: discountNaira.trim() ? Math.round(Number(discountNaira) * 100) : 0,
      lines: cleanedLines,
    };

    setSubmitting(true);
    try {
      const res = await invoicesApi.create(body);
      router.push(`/invoices/${res.data.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the invoice.");
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="New invoice" subtitle="Fill in customer + line items. Save as a draft first — you can share the link when you're ready.">
      <Link
        href="/invoices"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-white/55 hover:text-white/85"
      >
        <ArrowLeft size={13} /> Invoices
      </Link>

      <PaymentsStatusBanner context="invoices" />

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-400/25 bg-rose-500/[0.06] p-3 text-[13px] text-rose-200">
          <AlertCircle size={16} className="mt-0.5" /> {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="grid gap-6">
        <Card title="Customer">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Name" required value={customerName} onChange={setCustomerName} placeholder="Amaka Obi" />
            <Field label="Email" type="email" value={customerEmail} onChange={setCustomerEmail} placeholder="you@example.com" />
            <Field label="Phone" type="tel" value={customerPhone} onChange={setCustomerPhone} placeholder="0801 234 5678" />
            <Field label="Address" value={customerAddress} onChange={setCustomerAddress} placeholder="Lagos, Nigeria" />
          </div>
        </Card>

        <Card title="Line items">
          <div className="grid gap-3">
            {lines.map((l, i) => (
              <div key={i} className="grid gap-2 md:grid-cols-[1fr_100px_140px_100px_40px] md:items-end">
                <Field label={i === 0 ? "Description" : undefined} value={l.description} onChange={(v) => updateLine(i, { description: v })} placeholder="Consulting hours" />
                <Field label={i === 0 ? "Qty" : undefined} type="number" value={l.quantity} onChange={(v) => updateLine(i, { quantity: v })} />
                <Field label={i === 0 ? "Unit price (₦)" : undefined} type="number" value={l.unitPriceNaira} onChange={(v) => updateLine(i, { unitPriceNaira: v })} placeholder="0.00" />
                <Field label={i === 0 ? "Tax %" : undefined} type="number" value={l.taxRatePercent} onChange={(v) => updateLine(i, { taxRatePercent: v })} placeholder="7.5" />
                <button
                  type="button"
                  onClick={() => removeLine(i)}
                  disabled={lines.length <= 1}
                  className="inline-flex h-10 items-center justify-center rounded-md text-white/40 hover:text-rose-300 disabled:opacity-30"
                  aria-label="Remove line"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addLine}
              className="mt-1 inline-flex items-center gap-1.5 self-start rounded-md border border-white/12 bg-white/[0.03] px-2.5 py-1.5 text-[12.5px] text-white/85 hover:bg-white/[0.08]"
            >
              <Plus size={13} /> Add line
            </button>
          </div>
        </Card>

        <Card title="Money">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
            <Field label="Due date" type="date" value={dueDate} onChange={setDueDate} />
            <Field label="Discount (₦)" type="number" value={discountNaira} onChange={setDiscountNaira} placeholder="0" />
          </div>
          <div className="mt-4 space-y-1 text-right text-[13.5px]">
            <div className="flex justify-between text-white/60">
              <span>Subtotal</span>
              <span className="font-mono text-white">{fmtNaira(totals.subtotalKobo)}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Tax</span>
              <span className="font-mono text-white">{fmtNaira(totals.taxKobo)}</span>
            </div>
            {totals.discountKobo > 0 && (
              <div className="flex justify-between text-white/60">
                <span>Discount</span>
                <span className="font-mono text-white">−{fmtNaira(totals.discountKobo)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 text-[16px] font-semibold text-white">
              <span>Total</span>
              <span className="font-mono">{fmtNaira(totals.totalKobo)}</span>
            </div>
          </div>
        </Card>

        <Card title="Notes & terms">
          <div className="grid gap-3 md:grid-cols-2">
            <TextArea label="Notes (visible to customer)" value={notes} onChange={setNotes} placeholder="Thanks for your business!" />
            <TextArea label="Terms" value={terms} onChange={setTerms} placeholder="Payment due within 14 days." />
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Link
            href="/invoices"
            className="rounded-md border border-white/12 px-3 py-2 text-[13px] text-white/70 hover:text-white"
          >
            Cancel
          </Link>
          <Button type="submit" variant="primary" disabled={submitting} className="gap-1.5">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
            {submitting ? "Saving…" : "Save as draft"}
          </Button>
        </div>
      </form>
    </AppShell>
  );
}

function computeTotals(lines: LineDraft[], discountNaira: string) {
  let subtotalKobo = 0;
  let taxKobo = 0;
  for (const l of lines) {
    const qty = Number(l.quantity);
    const unit = Number(l.unitPriceNaira);
    if (!Number.isFinite(qty) || qty <= 0) continue;
    if (!Number.isFinite(unit) || unit < 0) continue;
    const line = Math.round(qty * unit * 100);
    subtotalKobo += line;
    if (l.taxRatePercent.trim()) {
      const rate = Number(l.taxRatePercent);
      if (Number.isFinite(rate) && rate > 0) {
        taxKobo += Math.round((line * rate) / 100);
      }
    }
  }
  const discountKobo = discountNaira.trim() ? Math.round(Number(discountNaira) * 100) : 0;
  return {
    subtotalKobo,
    taxKobo,
    discountKobo,
    totalKobo: Math.max(0, subtotalKobo + taxKobo - discountKobo),
  };
}

// ----- primitives --------------------------------------------------------

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-cinema-elev p-5">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-white/55">
          {label}
          {required ? " *" : ""}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-[14px] text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-white/55">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-[13.5px] text-white placeholder:text-white/35 focus:border-primary-light focus:outline-none"
      />
    </label>
  );
}
