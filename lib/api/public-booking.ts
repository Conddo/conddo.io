// Public, unauthenticated self-book endpoints (§11.5). Backs /book/{slug}.
import { api } from "./client";
import type { DayKey, DayHours } from "./bookings";

export type BookedSlot = { start: string; end: string };
/** Public shape of a bookable service — no internal fields, no timestamps. */
export type PublicService = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceKobo: number;
};
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
  /** The tenant's active services menu. Empty when the tenant hasn't
   *  configured any yet — the FE falls back to a free-text service field
   *  and the tenant's default slot length. */
  services: PublicService[];
};

export type PublicBookingResult = { id: string; status: string; start: string; end: string };

export type PublicBookingInput = {
  customerName: string;
  customerPhone?: string;
  /** Optional but strongly encouraged — no email → no customer confirmation. */
  customerEmail?: string;
  /** Free-text fallback for tenants that haven't defined services yet. */
  service?: string;
  /** Picked service id. Wins over free-text when set. */
  serviceId?: string;
  start: string; // ISO datetime
};

export const publicBookingApi = {
  availability: (slug: string) =>
    api.get<PublicAvailability>(`/public/book/${encodeURIComponent(slug)}`),
  /** Open slots for the next `days` (default 14). Pass serviceId when the
   *  customer has picked a service so the slot length matches its duration. */
  slots: (slug: string, opts: { serviceId?: string; days?: number } = {}) => {
    const params = new URLSearchParams();
    if (opts.serviceId) params.set("serviceId", opts.serviceId);
    if (opts.days) params.set("days", String(opts.days));
    const qs = params.toString();
    return api.get<string[]>(
      `/public/book/${encodeURIComponent(slug)}/slots${qs ? "?" + qs : ""}`,
    );
  },
  book: (slug: string, body: PublicBookingInput) =>
    api.post<PublicBookingResult>(`/public/book/${encodeURIComponent(slug)}`, body),
};
