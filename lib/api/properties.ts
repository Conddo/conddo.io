// Real Estate — properties module. Backed by /api/v1/properties.
// Every field mirrors PropertyController.PropertyDetail / .PropertyRow.

import { api } from "./client";

export type PropertyStatus =
  | "draft"
  | "available"
  | "reserved"
  | "under_offer"
  | "sold"
  | "rented"
  | "archived";

export type PropertyType =
  | "house" | "duplex" | "bungalow" | "apartment" | "self-con"
  | "land" | "commercial" | "office" | "shop" | "warehouse" | "mixed-use";

export type ListingType = "sale" | "rent" | "short-let";

/** Compact row for the dashboard list. */
export type PropertyRow = {
  id: string;
  title: string;
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  price: number;
  currency: string;
  estateName: string | null;
  state: string | null;
  bedrooms: number | null;
  primaryImageUrl: string | null;
  featured: boolean;
};

/** Full detail — used by the edit + preview surfaces. */
export type PropertyDetail = {
  id: string;
  title: string;
  slug: string | null;
  referenceCode: string | null;
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  price: number;
  currency: string;
  priceNegotiable: boolean;
  rentPeriod: string | null;
  addressLine: string | null;
  estateName: string | null;
  lga: string | null;
  state: string | null;
  country: string;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  toilets: number | null;
  sizeSqm: number | null;
  plotSizeSqm: number | null;
  yearBuilt: number | null;
  parkingSpaces: number | null;
  features: string[];
  images: string[];
  floorPlanUrl: string | null;
  virtualTourUrl: string | null;
  documents: {
    cOfO: boolean;
    deedOfAssignment: boolean;
    surveyPlan: boolean;
    governorConsent: boolean;
    gazette: boolean;
  };
  documentNotes: string | null;
  isPublic: boolean;
  featured: boolean;
  description: string | null;
};

export type CreatePropertyInput = {
  title: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  currency?: string;
  rentPeriod?: string;
  addressLine?: string;
  estateName?: string;
  lga?: string;
  state?: string;
  landmark?: string;
  bedrooms?: number;
  bathrooms?: number;
  sizeSqm?: number;
  features?: string[];
  images?: string[];
  description?: string;
};

export type UpdatePropertyInput = Partial<CreatePropertyInput> & {
  status?: PropertyStatus;
  priceNegotiable?: boolean;
  hasCofO?: boolean;
  hasDeedOfAssignment?: boolean;
  hasSurveyPlan?: boolean;
  hasGovernorConsent?: boolean;
  hasGazette?: boolean;
  documentNotes?: string;
  isPublic?: boolean;
  featured?: boolean;
};

export type PropertyPage = {
  content: PropertyRow[];
  page: number;
  size: number;
  total: number;
};

// ----- Human labels ---------------------------------------------------------

const STATUS_LABELS: Record<PropertyStatus, string> = {
  draft: "Draft",
  available: "Available",
  reserved: "Reserved",
  under_offer: "Under offer",
  sold: "Sold",
  rented: "Rented",
  archived: "Archived",
};

const STATUS_TONES: Record<PropertyStatus, "success" | "warning" | "info" | "neutral"> = {
  draft: "neutral",
  available: "success",
  reserved: "info",
  under_offer: "warning",
  sold: "neutral",
  rented: "neutral",
  archived: "neutral",
};

const TYPE_LABELS: Record<PropertyType, string> = {
  house: "House",
  duplex: "Duplex",
  bungalow: "Bungalow",
  apartment: "Apartment",
  "self-con": "Self-con",
  land: "Land",
  commercial: "Commercial",
  office: "Office",
  shop: "Shop",
  warehouse: "Warehouse",
  "mixed-use": "Mixed-use",
};

const LISTING_LABELS: Record<ListingType, string> = {
  sale: "For sale",
  rent: "For rent",
  "short-let": "Short-let",
};

export const propertyStatusLabel = (s: PropertyStatus) => STATUS_LABELS[s] ?? s;
export const propertyStatusTone = (s: PropertyStatus) => STATUS_TONES[s] ?? "neutral";
export const propertyTypeLabel = (t: PropertyType) => TYPE_LABELS[t] ?? t;
export const listingTypeLabel = (l: ListingType) => LISTING_LABELS[l] ?? l;

// ----- API ------------------------------------------------------------------

export const propertiesApi = {
  list: async (page = 0, size = 20) => {
    const { data } = await api.get<PropertyPage>(`/properties?page=${page}&size=${size}`);
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get<PropertyDetail>(`/properties/${id}`);
    return data;
  },
  create: async (input: CreatePropertyInput) => {
    const { data } = await api.post<PropertyDetail>("/properties", input);
    return data;
  },
  update: async (id: string, input: UpdatePropertyInput) => {
    const { data } = await api.patch<PropertyDetail>(`/properties/${id}`, input);
    return data;
  },
  changeStatus: async (id: string, status: PropertyStatus) => {
    const { data } = await api.patch<PropertyDetail>(`/properties/${id}/status`, { status });
    return data;
  },
  delete: async (id: string) => {
    await api.del(`/properties/${id}`);
  },
};

/** As a Result for useApiQuery. */
export const propertiesQuery = (page = 0, size = 20) =>
  api.get<PropertyPage>(`/properties?page=${page}&size=${size}`);
