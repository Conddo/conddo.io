// PUBLIC payment API — customer-facing, unauth. Hit from /pay/{intentId}
// on the customer-facing pay page and from the "Pay online" button on
// /i/{token} (public invoice view).

import { api } from "./client";

export type IntentStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "expired"
  | "refunded"
  | "partially_refunded";

export type BankOption = { code: string; name: string };

export type PublicIntent = {
  id: string;
  status: IntentStatus;
  amountKobo: number;
  currency: string;
  provider: string;
  origin: string;
  originReference: string | null;
  receivingBankName: string | null;
  receivingAccountNumber: string | null;
  receivingAccountName: string | null;
  failureReason: string | null;
  matchedTransactionRef: string | null;
  business: {
    name: string;
    slug: string | null;
    contactEmail: string | null;
  };
  brand: {
    logoUrl: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
  };
};

export const payApi = {
  get: (intentId: string) => api.get<PublicIntent>(`/public/payments/${intentId}`),
  confirm: (intentId: string, senderBank: string, senderAccountNumber: string) =>
    api.post<PublicIntent>(`/public/payments/${intentId}/confirm`, {
      senderBank,
      senderAccountNumber,
    }),
  verify: (intentId: string) => api.post<PublicIntent>(`/public/payments/${intentId}/verify`, {}),
  banks: (provider = "importapay") =>
    api.get<BankOption[]>(`/public/payments/banks?provider=${provider}`),

  /** Spawn a payment intent from an invoice public token — called by
   *  the Pay Online button on /i/{token}. Returns the intent id, which
   *  the caller should redirect the customer to at /pay/{intentId}. */
  startFromInvoice: (invoiceToken: string) =>
    api.post<{ intentId: string }>(`/public/invoice/${invoiceToken}/pay`, {}),
};

export const fmtNaira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
    kobo / 100,
  );
