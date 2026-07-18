// Public, unauthenticated self-book endpoints (§11.5). Backs /book/{slug}.
import { api } from "./client";
import type { DayKey, DayHours } from "./bookings";

export type BookedSlot = { start: string; end: string };
export type PublicAvailability = {
  business: string;
  /** Tenant's own slug — distinct from the booking-link slug in the URL. */
  slug: string;
  /** Tenant brand — feeds the branded booking page (logo + colours). */
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  workingHours: Partial<Record<DayKey, DayHours>>;
  slotDurationMinutes: number;
  bufferMinutes: number;
  booked: BookedSlot[];
};

export type PublicBookingResult = { id: string; status: string; start: string; end: string };

export type PublicBookingInput = {
  customerName: string;
  customerPhone?: string;
  /** Optional but strongly encouraged — no email → no customer confirmation. */
  customerEmail?: string;
  service?: string;
  start: string; // ISO datetime
};

export const publicBookingApi = {
  availability: (slug: string) => api.get<PublicAvailability>(`/public/book/${encodeURIComponent(slug)}`),
  book: (slug: string, body: PublicBookingInput) =>
    api.post<PublicBookingResult>(`/public/book/${encodeURIComponent(slug)}`, body),
};
