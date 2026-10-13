import Link from "next/link";

const TABS = [
  { label: "Overview", href: "/marketing" },
  { label: "Social", href: "/marketing/social" },
  { label: "Ads", href: "/marketing/ads" },
  { label: "Email", href: "/marketing/email" },
  { label: "SMS", href: "/marketing/sms" },
  { label: "Leads", href: "/marketing/leads" },
];

/** Sub-navigation shared by the Marketing Hub screens. */
export function MarketingTabs({ active }: { active: string }) {
  return (
    <div className="mb-6 -mx-4 overflow-x-auto border-b border-white/[0.06] px-4 md:-mx-8 md:px-8">
      <nav className="flex gap-6">
        {TABS.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className={`whitespace-nowrap border-b-2 pb-3 text-[14px] transition-colors ${
              t.label === active
                ? "border-primary font-medium text-primary"
                : "border-transparent text-white/65 hover:text-white"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
