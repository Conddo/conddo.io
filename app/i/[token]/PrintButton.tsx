"use client";

/**
 * "Download PDF" button on the public invoice page. Fires
 * {@code window.print()} which, on every modern browser, offers "Save
 * as PDF" as the destination. That keeps this a client-only feature
 * (no server PDF generation, no library dependencies) and always
 * matches the on-screen render exactly.
 *
 * Pass 2.5 / 3 will replace this with a real server-generated PDF
 * once we want branded attachments in the receipt email — but for
 * customer download today, print → save-as-PDF is the pragmatic path.
 */
export function PrintButton({ secondaryColor }: { secondaryColor: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      style={{
        display: "inline-block",
        padding: "10px 18px",
        borderRadius: 999,
        background: "#FFFFFF",
        color: secondaryColor,
        border: `1px solid rgba(0,0,0,0.12)`,
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      Download PDF
    </button>
  );
}
