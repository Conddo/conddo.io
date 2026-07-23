import Link from "next/link";

/**
 * Growth-tier upsell for invoicing surfaces. Rendered by /invoices and
 * /invoices/new when the BE returns PLAN_UPGRADE_REQUIRED. Same copy in
 * both places so the tenant sees one consistent story regardless of how
 * they arrived — direct link, Create Invoice CTA on /payments, etc.
 */
export function InvoicingUpgradeNudge() {
  return (
    <div className="rounded-xl border border-amber-400/25 bg-amber-500/[0.06] p-6">
      <h2 className="text-[15px] font-semibold text-amber-100">
        Invoicing is a Growth-tier feature
      </h2>
      <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-amber-100/80">
        Send branded invoices to customers, take payment online, and track what&apos;s
        paid — all from your dashboard. Upgrade to Growth to unlock invoicing.
      </p>
      <Link
        href="/settings/billing"
        className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-white hover:bg-primary/90"
      >
        See plans
      </Link>
    </div>
  );
}
