import { notFound } from "next/navigation";
import type { Metadata } from "next";

/**
 * PUBLIC invoice / receipt view. Rendered in the tenant's brand
 * (logo + primary + secondary colour) so the customer sees the tenant's
 * document, not a Conddo-branded page.
 *
 * <p>Server component — fetches from
 * {@code GET /api/v1/public/invoice/{token}}, unauth. Any 404 flows
 * through to the app's not-found page.
 *
 * <p>Pass 2 will add a Download PDF button. Pass 3 adds a Pay Now
 * button that opens Routepay / Importapay.
 */
export const revalidate = 30;

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

type PublicInvoice = {
  invoice: {
    id: string;
    invoiceNumber: string;
    customerName: string;
    customerEmail: string | null;
    customerPhone: string | null;
    customerAddress: string | null;
    currency: string;
    subtotalKobo: number;
    taxKobo: number;
    discountKobo: number;
    totalKobo: number;
    status: string;
    issueDate: string;
    dueDate: string | null;
    paidAt: string | null;
    paidMethod: string | null;
    notes: string | null;
    terms: string | null;
  };
  brand: {
    logoUrl: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
  };
  business: {
    name: string;
    slug: string;
    contactEmail: string | null;
    contactPhone: string | null;
  };
  lines: Array<{
    description: string;
    quantity: string;
    unitPriceKobo: number;
    taxRatePercent: string | null;
    lineTotalKobo: number;
  }>;
};

async function fetchInvoice(token: string): Promise<PublicInvoice | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/public/invoice/${encodeURIComponent(token)}`,
      { next: { revalidate: 30 }, headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const envelope = (await res.json()) as { success?: boolean; data?: PublicInvoice };
    return envelope.data ?? null;
  } catch {
    return null;
  }
}

function fmtNaira(kobo: number): string {
  return "₦" + (kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const data = await fetchInvoice(token);
  if (!data) return { title: "Invoice not found" };
  return {
    title: `${data.invoice.invoiceNumber} · ${data.business.name}`,
    description: `Invoice from ${data.business.name}`,
  };
}

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await fetchInvoice(token);
  if (!data) notFound();

  const primary = data.brand.primaryColor ?? "#3F3F42";
  const secondary = data.brand.secondaryColor ?? "#141414";
  const isPaid = data.invoice.status === "paid";
  const documentLabel = isPaid ? "Receipt" : "Invoice";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F4F3F0",
        color: secondary,
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        padding: "clamp(24px, 4vw, 56px) 16px",
      }}
    >
      <div
        style={{
          maxWidth: 780,
          margin: "0 auto",
          background: "#FFFFFF",
          borderRadius: 16,
          boxShadow: "0 1px 2px rgba(0,0,0,0.05), 0 10px 30px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Header band — tenant primary tint + logo + document label */}
        <div
          style={{
            padding: "clamp(24px, 4vw, 40px)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <div>
            {data.brand.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.brand.logoUrl}
                alt={data.business.name}
                style={{ height: 48, width: "auto", maxWidth: 220, objectFit: "contain", display: "block" }}
              />
            ) : (
              <div style={{ fontSize: 22, fontWeight: 700, color: secondary }}>{data.business.name}</div>
            )}
            <div style={{ marginTop: 12, fontSize: 13, color: "#6D6E71", lineHeight: 1.55 }}>
              {data.business.name}
              {data.business.contactEmail ? <>{" · "}{data.business.contactEmail}</> : null}
              {data.business.contactPhone ? <>{" · "}{data.business.contactPhone}</> : null}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: 999,
                background: isPaid ? "#DCFCE7" : "#FEF3C7",
                color: isPaid ? "#166534" : "#92400E",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              {documentLabel}
            </div>
            <div style={{ marginTop: 8, fontFamily: "ui-monospace, monospace", fontSize: 13, color: "#6D6E71" }}>
              {data.invoice.invoiceNumber}
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: "#6D6E71" }}>
              Issued {data.invoice.issueDate}
            </div>
            {data.invoice.dueDate && !isPaid && (
              <div style={{ fontSize: 12, color: "#6D6E71" }}>Due {data.invoice.dueDate}</div>
            )}
          </div>
        </div>

        {/* Bill-to */}
        <div
          style={{
            padding: "clamp(20px, 3vw, 32px) clamp(24px, 4vw, 40px)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#6D6E71", marginBottom: 6 }}>
            Bill to
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: secondary }}>{data.invoice.customerName}</div>
          {data.invoice.customerEmail && (
            <div style={{ fontSize: 13.5, color: "#4B4B50" }}>{data.invoice.customerEmail}</div>
          )}
          {data.invoice.customerPhone && (
            <div style={{ fontSize: 13.5, color: "#4B4B50" }}>{data.invoice.customerPhone}</div>
          )}
          {data.invoice.customerAddress && (
            <div style={{ fontSize: 13.5, color: "#4B4B50" }}>{data.invoice.customerAddress}</div>
          )}
        </div>

        {/* Line items */}
        <div style={{ padding: "clamp(20px, 3vw, 32px) clamp(24px, 4vw, 40px)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr>
                <th style={thStyle(secondary)}>Description</th>
                <th style={{ ...thStyle(secondary), textAlign: "right", width: 60 }}>Qty</th>
                <th style={{ ...thStyle(secondary), textAlign: "right", width: 120 }}>Unit</th>
                <th style={{ ...thStyle(secondary), textAlign: "right", width: 120 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.lines.map((l, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                  <td style={{ padding: "10px 6px", color: secondary }}>{l.description}</td>
                  <td style={{ padding: "10px 6px", textAlign: "right", fontFamily: "ui-monospace, monospace", color: "#4B4B50" }}>
                    {l.quantity}
                  </td>
                  <td style={{ padding: "10px 6px", textAlign: "right", fontFamily: "ui-monospace, monospace", color: "#4B4B50" }}>
                    {fmtNaira(l.unitPriceKobo)}
                  </td>
                  <td style={{ padding: "10px 6px", textAlign: "right", fontFamily: "ui-monospace, monospace", color: secondary, fontWeight: 600 }}>
                    {fmtNaira(l.lineTotalKobo)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ minWidth: 260, fontSize: 14 }}>
              <TotalRow label="Subtotal" kobo={data.invoice.subtotalKobo} />
              {data.invoice.taxKobo > 0 && <TotalRow label="Tax" kobo={data.invoice.taxKobo} />}
              {data.invoice.discountKobo > 0 && (
                <TotalRow label="Discount" kobo={-data.invoice.discountKobo} />
              )}
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: `2px solid ${primary}`,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 18,
                  fontWeight: 700,
                  color: secondary,
                }}
              >
                <span>Total</span>
                <span style={{ fontFamily: "ui-monospace, monospace" }}>{fmtNaira(data.invoice.totalKobo)}</span>
              </div>
            </div>
          </div>
        </div>

        {(data.invoice.notes || data.invoice.terms) && (
          <div style={{ padding: "clamp(20px, 3vw, 32px) clamp(24px, 4vw, 40px)", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            {data.invoice.notes && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#6D6E71", marginBottom: 6 }}>
                  Notes
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.65, color: "#4B4B50", whiteSpace: "pre-line" }}>{data.invoice.notes}</div>
              </div>
            )}
            {data.invoice.terms && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#6D6E71", marginBottom: 6 }}>
                  Terms
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.65, color: "#4B4B50", whiteSpace: "pre-line" }}>{data.invoice.terms}</div>
              </div>
            )}
          </div>
        )}

        {isPaid && (
          <div
            style={{
              padding: "clamp(16px, 3vw, 24px) clamp(24px, 4vw, 40px)",
              background: "#DCFCE7",
              color: "#166534",
              fontSize: 13.5,
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            Paid on {new Date(data.invoice.paidAt ?? "").toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
            {data.invoice.paidMethod ? ` · ${data.invoice.paidMethod}` : ""}
          </div>
        )}
      </div>

      <p style={{ maxWidth: 780, margin: "16px auto 0", fontSize: 11.5, color: "#8A8A8A", textAlign: "center" }}>
        Sent via <strong style={{ color: "#4B4B50" }}>Conddo</strong> — the business platform for African SMEs.
      </p>
    </main>
  );
}

function thStyle(color: string): React.CSSProperties {
  return {
    textAlign: "left",
    padding: "8px 6px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#6D6E71",
    borderBottom: `1px solid rgba(0,0,0,0.08)`,
  };
}

function TotalRow({ label, kobo }: { label: string; kobo: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "#4B4B50" }}>
      <span>{label}</span>
      <span style={{ fontFamily: "ui-monospace, monospace" }}>
        {kobo < 0 ? "−" : ""}
        {fmtNaira(Math.abs(kobo))}
      </span>
    </div>
  );
}
