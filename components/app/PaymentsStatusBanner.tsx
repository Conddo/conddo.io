"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { paymentAccountApi, type PaymentAccount } from "@/lib/api/payment-account";
import { ApiError } from "@/lib/api/client";

/**
 * KYC status strip. Renders at the top of any payments-adjacent page so
 * a tenant always sees where they stand on live customer collections.
 *
 * Four states:
 *  - Not started (pending, no bank / no docs)   → CTA: "Set up payments"
 *  - Under review                               → informational, no CTA
 *  - Approved but bank not verified             → CTA: "Verify bank"
 *  - Approved + payments live                   → thin confirmation
 *  - Rejected                                   → CTA with reviewer note
 *
 * On error the banner silently self-hides — a temporarily unreachable
 * endpoint shouldn't block the page it's decorating.
 */
export function PaymentsStatusBanner({ context = "generic" }: { context?: "generic" | "invoices" }) {
  const [acct, setAcct] = useState<PaymentAccount | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    paymentAccountApi
      .get()
      .then((r) => setAcct(r.data))
      .catch((err) => {
        if (err instanceof ApiError) setHidden(true);
      });
  }, []);

  if (hidden || !acct) return null;

  // Approved + wired = quiet green strip. Anything else = actionable.
  if (acct.kycStatus === "approved" && acct.paymentsEnabled) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.04] px-3 py-2 text-[12.5px] text-emerald-100">
        <CheckCircle2 size={13} />
        Live payments are on. Customers can pay across orders, invoices, bookings, and links.
      </div>
    );
  }

  if (acct.kycStatus === "under_review") {
    return (
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
        <Clock size={18} className="mt-0.5 shrink-0 text-amber-300" />
        <div>
          <p className="text-[13.5px] font-medium text-amber-100">Payments are under review</p>
          <p className="mt-0.5 text-[12.5px] text-amber-100/75">
            {context === "invoices"
              ? "You can still create and email invoices. Customer Pay Now links will activate once your KYC is approved — usually within one business day."
              : "Our team is reviewing your bank and compliance documents. You'll get an email as soon as approval is complete."}
          </p>
        </div>
      </div>
    );
  }

  if (acct.kycStatus === "approved" && !acct.paymentsEnabled) {
    return (
      <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-300" />
          <div>
            <p className="text-[13.5px] font-medium text-amber-100">One step left — verify your bank</p>
            <p className="mt-0.5 text-[12.5px] text-amber-100/75">
              KYC is approved, but we need a verified settlement account before turning payments on.
            </p>
          </div>
        </div>
        <Link
          href="/settings/payments"
          className="shrink-0 self-start rounded-md bg-amber-500/15 px-3 py-1.5 text-[12.5px] font-medium text-amber-100 hover:bg-amber-500/25"
        >
          Verify bank
        </Link>
      </div>
    );
  }

  if (acct.kycStatus === "rejected") {
    return (
      <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-4">
        <div className="flex items-start gap-3">
          <XCircle size={18} className="mt-0.5 shrink-0 text-rose-300" />
          <div>
            <p className="text-[13.5px] font-medium text-rose-100">Payment setup needs changes</p>
            <p className="mt-0.5 text-[12.5px] text-rose-100/75">
              {acct.kycRejectionReason ?? "A reviewer asked for changes to your submission."}
            </p>
          </div>
        </div>
        <Link
          href="/settings/payments"
          className="shrink-0 self-start rounded-md bg-rose-500/20 px-3 py-1.5 text-[12.5px] font-medium text-rose-100 hover:bg-rose-500/30"
        >
          Update submission
        </Link>
      </div>
    );
  }

  // Pending — never started or partly filled but not submitted.
  return (
    <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-primary/20 bg-primary/[0.05] p-4">
      <div className="flex items-start gap-3">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary-light" />
        <div>
          <p className="text-[13.5px] font-medium text-white">Turn on customer payments</p>
          <p className="mt-0.5 text-[12.5px] text-white/70">
            {context === "invoices"
              ? "Add your bank and upload compliance documents so customers can pay invoices online. Usually approved within one business day."
              : "Add your bank account and upload compliance documents to accept payments from customers. Approval usually within one business day."}
          </p>
        </div>
      </div>
      <Link
        href="/settings/payments"
        className="shrink-0 self-start rounded-md bg-primary px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-primary/90"
      >
        Set up payments
      </Link>
    </div>
  );
}
