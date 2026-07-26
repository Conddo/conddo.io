"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Landmark,
  Link as LinkIcon,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fmtNaira, intentsApi, type CreatePaymentLinkResult } from "@/lib/api/intents";
import { ApiError } from "@/lib/api/client";

export function PaymentLinkModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"form" | "result">("form");
  const [amountNaira, setAmountNaira] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreatePaymentLinkResult | null>(null);
  const [copied, setCopied] = useState(false);

  function resetForm() {
    setStep("form");
    setAmountNaira("");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setDescription("");
    setError(null);
    setResult(null);
    setCopied(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const naira = Number(amountNaira);
    if (!Number.isFinite(naira) || naira <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }
    const kobo = Math.round(naira * 100);
    setSubmitting(true);
    try {
      const res = await intentsApi.createPaymentLink({
        amountKobo: kobo,
        customerName: customerName.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        description: description.trim() || undefined,
      });
      setResult(res.data);
      setStep("result");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the payment link.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyUrl() {
    if (!result) return;
    const fullUrl = window.location.origin + result.paymentUrl;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const input = document.getElementById("payment-link-url") as HTMLInputElement | null;
      input?.select();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create payment link"
        className="relative flex max-h-[92vh] w-full max-w-md flex-col rounded-t-2xl border border-white/[0.08] bg-[#0d0d0d] sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-[17px] font-medium tracking-[-0.01em] text-white">
              {step === "form" ? "Create payment link" : "Payment link created"}
            </h2>
            <p className="mt-0.5 text-[13px] text-white/55">
              {step === "form"
                ? "Generate a shareable link your customer can use to pay via bank transfer."
                : "Share this link with your customer."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="-mr-1.5 -mt-1 shrink-0 rounded-md p-1.5 text-white/45 hover:bg-white/[0.06] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-400/25 bg-rose-500/[0.06] p-3 text-[13px] text-rose-200">
              <span>{error}</span>
            </div>
          )}

          {step === "form" && (
            <form onSubmit={onSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-white/55">
                  Amount * <span className="text-white/35">(in Naira)</span>
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amountNaira}
                  onChange={(e) => setAmountNaira(e.target.value)}
                  placeholder="5000"
                  required
                  autoFocus
                  className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-[15px] text-white placeholder:text-white/35 focus:border-primary/60 focus:outline-none"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-white/55">Customer name</span>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Amaka Obi"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-[14px] text-white placeholder:text-white/35 focus:border-primary/60 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-white/55">Email</span>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="amaka@example.com"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-[14px] text-white placeholder:text-white/35 focus:border-primary/60 focus:outline-none"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-white/55">Phone</span>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0801 234 5678"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-[14px] text-white placeholder:text-white/35 focus:border-primary/60 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-white/55">Reference</span>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Payment for custom dress"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-[14px] text-white placeholder:text-white/35 focus:border-primary/60 focus:outline-none"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" size="md" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={submitting}>
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <LinkIcon size={14} />
                  )}
                  {submitting ? "Creating..." : "Generate link"}
                </Button>
              </div>
            </form>
          )}

          {step === "result" && result && (
            <div className="space-y-5">
              <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-300" />
                <div>
                  <p className="text-[13px] font-medium text-emerald-100">Link generated</p>
                  <p className="mt-0.5 text-[12px] text-emerald-100/70">
                    Customer will pay {fmtNaira(result.amountKobo)} via bank transfer
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-white/55">Payment link</p>
                <div className="flex items-center gap-2">
                  <input
                    id="payment-link-url"
                    type="text"
                    readOnly
                    value={window.location.origin + result.paymentUrl}
                    className="h-10 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 font-mono text-[13px] text-white/85"
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    type="button"
                    onClick={copyUrl}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:bg-white/[0.06] hover:text-white"
                    aria-label="Copy link"
                  >
                    {copied ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Copy size={16} />}
                  </button>
                </div>
                {copied && <p className="mt-1 text-[12px] text-emerald-300/80">Copied to clipboard!</p>}
                <a href={result.paymentUrl} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-[12px] text-primary-light hover:underline">
                  <ExternalLink size={11} /> Open pay page in new tab
                </a>
              </div>

              {result.receivingBankName && (
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.1]">
                      <Landmark size={15} className="text-primary-light" />
                    </div>
                    <p className="text-[13px] font-medium text-white">Bank transfer details</p>
                  </div>
                  <div className="space-y-2 text-[13px]">
                    <div className="flex justify-between">
                      <span className="text-white/50">Bank</span>
                      <span className="font-medium text-white">{result.receivingBankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Account number</span>
                      <span className="font-mono font-medium text-white">{result.receivingAccountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Account name</span>
                      <span className="text-right text-white/85">{result.receivingAccountName}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/[0.06] pt-2">
                      <span className="text-white/50">Amount</span>
                      <span className="font-mono font-medium text-white">{fmtNaira(result.amountKobo)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="md" onClick={() => { resetForm(); setStep("form"); }}>
                  Create another
                </Button>
                <Button variant="primary" size="md" onClick={handleClose}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
