// Tenant-facing PaymentIntent API — powers /payments dashboard +
// per-intent detail. Distinct from lib/api/payments.ts (legacy read/write
// surface) and lib/api/pay.ts (public customer-side pay page).

import { api } from "./client";

export type IntentStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "expired"
  | "refunded"
  | "partially_refunded";

export type IntentOrigin =
  | "subscription"
  | "order"
  | "booking"
  | "invoice"
  | "pos"
  | "link"
  | "other";

export type IntentRow = {
  id: string;
  status: IntentStatus;
  origin: IntentOrigin;
  amountKobo: number;
  currency: string;
  customerName: string | null;
  customerEmail: string | null;
  provider: string;
  originReference: string | null;
  initiatedAt: string;
  completedAt: string | null;
};

export type IntentDetail = IntentRow & {
  feeKobo: number;
  netKobo: number;
  providerReference: string | null;
  customerPhone: string | null;
  receivingBankName: string | null;
  receivingAccountNumber: string | null;
  receivingAccountName: string | null;
  senderBankName: string | null;
  senderAccountNumber: string | null;
  matchedTransactionRef: string | null;
  failureReason: string | null;
  originOrderId: string | null;
  originInvoiceId: string | null;
  originBookingId: string | null;
  lastVerifiedAt: string | null;
};

export type TenantBalance = {
  availableKobo: number;
  succeededCount: number;
  pendingCount: number;
  failedCount: number;
  refundedCount: number;
};

export type PagedResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type CreatePaymentLinkInput = {
  amountKobo: number;
  currency?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
};

export type CreatePaymentLinkResult = {
  intentId: string;
  status: string;
  paymentUrl: string;
  receivingBankName: string | null;
  receivingAccountNumber: string | null;
  receivingAccountName: string | null;
  amountKobo: number;
  currency: string;
  createdAt: string;
};

export const intentsApi = {
  list: (opts: { status?: string; page?: number; size?: number } = {}) => {
    const qs = new URLSearchParams();
    if (opts.status) qs.set("status", opts.status);
    qs.set("page", String(opts.page ?? 0));
    qs.set("size", String(opts.size ?? 20));
    return api.get<PagedResponse<IntentRow>>(`/payments/intents?${qs.toString()}`);
  },
  balance: () => api.get<TenantBalance>("/payments/intents/balance"),
  get: (id: string) => api.get<IntentDetail>(`/payments/intents/${id}`),

  /** Create a shareable payment link backed by Importapay bank transfer. */
  createPaymentLink: (input: CreatePaymentLinkInput) =>
    api.post<CreatePaymentLinkResult>("/payments/links", input),
};

export const fmtNaira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
