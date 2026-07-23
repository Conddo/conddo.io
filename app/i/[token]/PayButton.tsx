"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { payApi } from "@/lib/api/pay";
import { ApiError } from "@/lib/api/client";

/** "Pay online" button on the public invoice view. Spawns (or resumes)
 *  a payment intent and redirects the customer to /pay/{intentId}. */
export function PayButton({
  invoiceToken,
  primaryColor,
}: {
  invoiceToken: string;
  primaryColor: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const res = await payApi.startFromInvoice(invoiceToken);
      router.push(`/pay/${res.data.intentId}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start payment.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={start}
        disabled={loading}
        style={{
          backgroundColor: primaryColor,
          color: "#fff",
          padding: "10px 18px",
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 600,
          border: "none",
          cursor: loading ? "wait" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
        className="pay-button no-print"
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : null}
        Pay online
      </button>
      {error && (
        <p
          style={{
            marginTop: 8,
            color: "#d63a3a",
            fontSize: 12,
            textAlign: "right",
          }}
          className="no-print"
        >
          {error}
        </p>
      )}
    </>
  );
}
