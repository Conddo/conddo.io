// Owner-side services CRUD — powers /settings/bookings/services.
// Tenant-scoped; BE gates on the Bookings feature (Growth+).

import { api } from "./client";

export type BookableService = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceKobo: number;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type UpsertServiceInput = {
  name: string;
  description?: string | null;
  durationMinutes: number;
  priceKobo?: number;
  active?: boolean;
  sortOrder?: number;
};

export const bookableServicesApi = {
  list: () => api.get<BookableService[]>("/bookings/services"),
  create: (body: UpsertServiceInput) =>
    api.post<BookableService>("/bookings/services", body),
  update: (id: string, body: Partial<UpsertServiceInput>) =>
    api.patch<BookableService>(`/bookings/services/${encodeURIComponent(id)}`, body),
  remove: (id: string) =>
    api.del<void>(`/bookings/services/${encodeURIComponent(id)}`),
};
