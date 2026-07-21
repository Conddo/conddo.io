// Payment-account API — bank connect, KYC docs, submission for review,
// and admin approval/rejection. Separate from lib/api/payments.ts which
// owns the legacy RoutePay checkout + transactions surface.

import { api } from "./client";

export type KycStatus = "pending" | "under_review" | "approved" | "rejected";

export type PaymentAccount = {
  bankCode: string | null;
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  accountVerified: boolean;
  kycStatus: KycStatus;
  kycRejectionReason: string | null;
  cacDocumentUrl: string | null;
  directorIdUrl: string | null;
  utilityBillUrl: string | null;
  businessAddress: string | null;
  paymentsEnabled: boolean;
};

export const paymentAccountApi = {
  get: () => api.get<PaymentAccount>("/me/payments/account"),
  updateBank: (payload: {
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  }) => api.put<PaymentAccount>("/me/payments/account/bank", payload),
  updateKycDocs: (payload: {
    cacDocumentUrl?: string | null;
    directorIdUrl?: string | null;
    utilityBillUrl?: string | null;
    businessAddress?: string | null;
  }) => api.put<PaymentAccount>("/me/payments/account/kyc-docs", payload),
  submit: () => api.post<PaymentAccount>("/me/payments/account/submit", {}),
};
