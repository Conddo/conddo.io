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

/**
 * Modal for generating a shareable payment link backed by Importapay bank
 * transfer. The tenant enters an amount + optional customer info and gets
 * back a virtual receiving account + a URL to share.
 *
 * Two states:
 *   1. Form — enter amount, optional customer details, optional description
 *   2. Result — show the receiving account + copyable payment URL
 */
export function PaymentLinkModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"form" | "result">("form");

  // Form state
  const [amountNaira, setAmountNaira] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [description, setDescription] = useState("");

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result state
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
        {/* Header */}
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

        {/* Body */}
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
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-white/55">
                    Customer name
                  </span>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Amaka Obi"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-[14px] text-white placeholder:text-white/35 focus:border-primary/60 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-white/55">
                    Email
                  </span>
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
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-white/55">
                    Phone
                  </span>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0801 234 5678"
                    className="h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-[14px] text-white placeholder:text-white/35 focus:border-primary/60 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-white/55">
                    Reference
                  </span>
                  <input
                    type="text"
                    value={description}
             
