// Inventory module — typed API surface. Endpoints: ACTION_LIST §11.6.
import { api } from "./client";

// GET /inventory/products — row/detail. `lowStock` is derived server-side.
// `expiryDate` is optional (pharmacy uses it; other verticals leave it null).
// Spec: backend/specs/PHARMACY_DEEP_DIVE_SPEC.md §2.
export type Product = {
  id: string;
  name: string;
  sku: string | null;
  categoryId: string | null;
  category: string | null;
  price: number;
  stock: number;
  reorderThreshold: number;
  lowStock: boolean;
  active: boolean;
  expiryDate?: string | null;  // YYYY-MM-DD; pharmacy-only, optional
  batchNumber?: string | null; // pharmacy-only, optional (Phase 2)
  images?: string[];            // Cloudinary URLs surfaced on public catalog
};

// FE-derived expiry status. Same banding the dashboard widget uses.
export type ExpiryStatus = "none" | "fresh" | "expiring_soon" | "expired";

export function expiryStatusOf(p: Product, now: Date = new Date()): ExpiryStatus {
  if (!p.expiryDate) return "none";
  const expiry = new Date(p.expiryDate);
  if (Number.isNaN(expiry.getTime())) return "none";
  const diffDays = Math.floor((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays < 0) return "expired";
  if (diffDays <= 30) return "expiring_soon";
  return "fresh";
}

export type Category = {
  id: string;
  name: string;
  productCount?: number;
};

export type UpdateCategoryInput = { name?: string };

export type StockStatus = "in_stock" | "low" | "out";
export const stockStatus = (p: Product): StockStatus =>
  p.stock <= 0 ? "out" : p.lowStock ? "low" : "in_stock";

export type ProductListParams = {
  search?: string;
  category?: string;
  lowStock?: boolean;
  expiringWithinDays?: number; // pharmacy filter: "expiring in next N days"
  page?: number;
  size?: number;
};

// Write payloads (backend CreateProductRequest / UpdateProductRequest, §11.6).
export type CreateProductInput = {
  name: string;
  sku?: string;
  categoryId?: string;
  price?: number;
  stock?: number;
  reorderThreshold?: number;
  active?: boolean;
  expiryDate?: string | null;  // YYYY-MM-DD; pharmacy-only
  batchNumber?: string | null; // pharmacy-only (Phase 2)
  images?: string[];            // Cloudinary URLs surfaced on public catalog
};
export type UpdateProductInput = Partial<CreateProductInput>;

export const inventoryApi = {
  list: (p: ProductListParams = {}) => {
    const qs = new URLSearchParams();
    if (p.search) qs.set("search", p.search);
    if (p.category) qs.set("category", p.category);
    if (p.lowStock) qs.set("lowStock", "true");
    if (p.expiringWithinDays != null) qs.set("expiringWithinDays", String(p.expiringWithinDays));
    qs.set("page", String(p.page ?? 0));
    qs.set("size", String(p.size ?? 20));
    return api.get<Product[]>(`/inventory/products?${qs.toString()}`);
  },
  get: (id: string) => api.get<Product>(`/inventory/products/${id}`),
  lowStock: () => api.get<Product[]>("/inventory/low-stock"),
  categories: () => api.get<Category[]>("/inventory/categories"),

  create: (body: CreateProductInput) => api.post<Product>("/inventory/products", body),
  update: (id: string, body: UpdateProductInput) => api.patch<Product>(`/inventory/products/${id}`, body),
  remove: (id: string) => api.del<void>(`/inventory/products/${id}`),
  adjustStock: (id: string, delta: number, reason?: string) =>
    api.post<Product>(`/inventory/products/${id}/adjust`, { delta, reason }),
  createCategory: (name: string) => api.post<Category>("/inventory/categories", { name }),
  updateCategory: (id: string, body: UpdateCategoryInput) =>
    api.patch<Category>(`/inventory/categories/${id}`, body),
  removeCategory: (id: string) => api.del<void>(`/inventory/categories/${id}`),
};
