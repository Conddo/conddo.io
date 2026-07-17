// Tenant support surface — submit a request/complaint, list your own.
// Every response is scoped to the caller's tenant via RLS on the BE.

import { api } from "./client";

export type RequestKind = "FEATURE" | "COMPLAINT" | "BUG" | "QUESTION";
export type RequestStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "DISMISSED";
export type RequestPriority = "LOW" | "NORMAL" | "HIGH";

export type SupportRequest = {
  id: string;
  kind: RequestKind;
  title: string;
  body: string;
  status: RequestStatus;
  priority: RequestPriority;
  adminResponse: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SubmitRequestInput = {
  kind: RequestKind;
  title: string;
  body: string;
};

export const supportApi = {
  submit: (input: SubmitRequestInput) =>
    api.post<SupportRequest>("/support/requests", input),
  list: () => api.get<SupportRequest[]>("/support/requests"),
  one: (id: string) => api.get<SupportRequest>(`/support/requests/${id}`),
};
