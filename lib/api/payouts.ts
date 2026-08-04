// Tenant-facing payouts API. Populated by provider webhooks (not by
// tenant action) — read-only surface.

import { api } from "./client";

export type PayoutStatus = "pending" | "processing" | "succeeded" | "failed";

export type PayoutRow = {
  id: string;
  provider: string;
  providerReference: string;
  amountKobo: number;
  currency: string;
  bankName: string | null;
  accountNumberLast4: string | null;
  accountName: string | null;
  status: PayoutStatus;
  failureReason: string | null;
  initiatedAt: string;
  completedAt: string | null;
};

export const payoutsApi = {
  list: () => api.get<PayoutRow[]>("/payments/payouts"),
  get: (id: string) => api.get<PayoutRow>(`/payments/payouts/${id}`),
};
