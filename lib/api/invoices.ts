// Tenant-side invoicing API. Growth-tier feature, gated on the BE via
// @RequiresFeature('invoicing'). All money is in kobo everywhere in this
// client — display code multiplies by / 100 to show naira.

import { api } from "./client";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

export type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  totalKobo: number;
  status: InvoiceStatus;
  issueDate: string; // YYYY-MM-DD
  dueDate: string | null;
  createdAt: string;
  publicToken: string;
};

export type InvoiceLineRow = {
  id: string;
  description: string;
  quantity: string; // BigDecimal serialised as string on the wire
  unitPriceKobo: number;
  taxRatePercent: string | null;
  lineTotalKobo: number;
  sortOrder: number;
};

export type InvoiceDetail = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  customerId: string | null;
  currency: string;
  subtotalKobo: number;
  taxKobo: number;
  discountKobo: number;
  totalKobo: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string | null;
  paidAt: string | null;
  paidMethod: string | null;
  paymentReference: string | null;
  notes: string | null;
  terms: string | null;
  publicToken: string;
  linkedOrderId: string | null;
  linkedBookingId: string | null;
  lines: InvoiceLineRow[];
};

export type InvoiceLineInput = {
  description: string;
  quantity?: number;
  unitPriceKobo: number;
  taxRatePercent?: number | null;
};

export type UpsertInvoiceInput = {
  customerName: string;
  customerId?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  issueDate?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  terms?: string | null;
  discountKobo?: number;
  linkedOrderId?: string | null;
  linkedBookingId?: string | null;
  lines: InvoiceLineInput[];
};

export const invoicesApi = {
  list: (status?: InvoiceStatus) =>
    api.get<InvoiceRow[]>(`/invoices${status ? `?status=${status}` : ""}`),
  get: (id: string) => api.get<InvoiceDetail>(`/invoices/${id}`),
  create: (body: UpsertInvoiceInput) => api.post<InvoiceDetail>("/invoices", body),
  update: (id: string, body: UpsertInvoiceInput) =>
    api.put<InvoiceDetail>(`/invoices/${id}`, body),
  markSent: (id: string) => api.post<InvoiceRow>(`/invoices/${id}/send`),
  emailToCustomer: (id: string) => api.post<InvoiceRow>(`/invoices/${id}/email`),
  markPaid: (id: string, method: "cash" | "transfer" | "other" = "cash") =>
    api.post<InvoiceRow>(`/invoices/${id}/mark-paid`, { method }),
  voidInvoice: (id: string) => api.del<InvoiceRow>(`/invoices/${id}`),
};

/** Naira display. Kobo → ₦x,xxx.xx with grouping and 2dp. */
export function fmtNaira(kobo: number): string {
  return "₦" + (kobo / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
