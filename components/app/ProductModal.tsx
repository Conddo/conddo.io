"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, Sparkles, AlertCircle, X, ChevronDown, ChevronUp } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Field, TextInput, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { inventoryApi, type Product, type Category } from "@/lib/api/inventory";
import { mediaApi } from "@/lib/api/media";
import {
  pharmacyAiApi,
  type AiConfidence,
  type AiSuggestFromImageResult,
} from "@/lib/api/pharmacyAi";
import { ApiError } from "@/lib/api/client";
import { useApiQuery } from "@/hooks/useApiQuery";
import { meQuery } from "@/lib/api/account";
import { productNamePlaceholder, verticalOf } from "@/lib/verticalCopy";

type Errors = Partial<Record<"name" | "price" | "stock" | "reorder", string>>;

const numErr = (v: string) => (v && (Number.isNaN(Number(v)) || Number(v) < 0) ? "Enter a valid number." : undefined);

const CONFIDENCE_TONE: Record<AiConfidence, "success" | "warning" | "neutral"> = {
  high: "success",
  medium: "warning",
  low: "neutral",
};

/** Compact preview row inside the AI suggestion panel — label on the left,
 *  body on the right, with an optional "Apply" CTA when the value can be
 *  copied into a form field. */
function AiRow({ label, value, onApply }: { label: string; value?: string | boolean | null; onApply?: () => void }) {
  if (value === undefined || value === null || value === "") return null;
  const text = typeof value === "boolean" ? (value ? "Yes" : "No") : value;
  return (
    <div className="flex items-start justify-between gap-3 border-t border-white/[0.06] py-2 first:border-t-0">
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-white/45">{label}</p>
        <p className="mt-0.5 text-[13px] text-white/65">{text}</p>
      </div>
      {onApply && (
        <button
          type="button"
          onClick={onApply}
          className="shrink-0 rounded-md border border-primary/30 bg-primary/[0.08] px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary hover:text-white"
        >
          Apply →
        </button>
      )}
    </div>
  );
}

/** Create or edit an inventory product (POST/PATCH /inventory/products).
 *  Pass `product` to edit; omit to create. For pharmacy tenants the modal
 *  also offers an AI assistant (Spec v2 §12C): scan packaging → Claude
 *  extracts name / NAFDAC / indications / etc → pharmacist confirms. */
export function ProductModal({
  open,
  onClose,
  product,
  categories,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  categories: Category[];
  onSaved?: (p: Product) => void;
}) {
  const toast = useToast();
  const { data: me } = useApiQuery(meQuery);
  const vertical = verticalOf(me);
  const isPharmacy = vertical === "pharmacy";
  const namePlaceholder = productNamePlaceholder(vertical);
  const editing = Boolean(product);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [reorder, setReorder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [active, setActive] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  // AI assistant state — pharmacy only.
  const fileRef = useRef<HTMLInputElement | null>(null);
  const imageFileRef = useRef<HTMLInputElement | null>(null);
  const [aiBusy, setAiBusy] = useState<"upload" | "analyse" | null>(null);
  const [aiResult, setAiResult] = useState<AiSuggestFromImageResult | null>(null);
  const [aiCollapsed, setAiCollapsed] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(product?.name ?? "");
    setSku(product?.sku ?? "");
    setCategoryId(product?.categoryId ?? "");
    setPrice(product?.price != null ? String(product.price) : "");
    setStock(product?.stock != null ? String(product.stock) : "");
    setReorder(product?.reorderThreshold != null ? String(product.reorderThreshold) : "");
    setExpiryDate(product?.expiryDate ?? "");
    setActive(product?.active ?? true);
    setImages(product?.images ?? []);
    setErrors({});
    setAiResult(null);
    setAiCollapsed(false);
    setAiBusy(null);
  }, [open, product]);

  function close() {
    if (saving) return;
    onClose();
  }

  function validate(): boolean {
    const next: Errors = {};
    if (!name.trim()) next.name = "Product name is required.";
    next.price = numErr(price);
    next.stock = numErr(stock);
    next.reorder = numErr(reorder);
    const cleaned = Object.fromEntries(Object.entries(next).filter(([, v]) => v));
    setErrors(cleaned);
    return Object.keys(cleaned).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const body = {
      name: name.trim(),
      sku: sku.trim() || undefined,
      categoryId: categoryId || undefined,
      price: price ? Number(price) : undefined,
      stock: stock ? Number(stock) : undefined,
      reorderThreshold: reorder ? Number(reorder) : undefined,
      // Send null on edit when the user cleared a previously-set date so the
      // server clears it; omit on create so it stays unset for non-pharmacy
      // tenants that never touch this field.
      expiryDate: expiryDate ? expiryDate : (editing ? null : undefined),
      active,
      images: images.length > 0 ? images : undefined,
    };
    setSaving(true);
    try {
      const { data } = product
        ? await inventoryApi.update(product.id, body)
        : await inventoryApi.create(body);
      toast.success(editing ? "Product updated" : "Product added", data.name);
      onClose();
      onSaved?.(data);
    } catch (err) {
      toast.error(editing ? "Couldn't update product" : "Couldn't add product",
        err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function onPickAiImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setAiResult(null);
    setAiBusy("upload");
    try {
      const up = await mediaApi.upload(file, "pharmacy-ai-scan");
      setAiBusy("analyse");
      const { data } = await pharmacyAiApi.suggestFromImage(up.data.url);
      setAiResult(data);
      setAiCollapsed(false);
      const conf = data.confidence === "high" ? "high" : data.confidence === "medium" ? "medium" : "low";
      toast.success("Packaging scanned", `AI confidence: ${conf}. Review and apply what looks right.`);
    } catch (err) {
      toast.error(
        "Couldn't scan packaging",
        err instanceof ApiError ? err.message : "Please try a clearer photo.",
      );
    } finally {
      setAiBusy(null);
    }
  }

  function applyAiName() {
    const s = aiResult?.suggestion;
    if (!s) return;
    const brand = s.nameBrand?.trim();
    const generic = s.nameGeneric?.trim();
    const next = brand && generic ? `${brand} (${generic})` : (brand || generic || "");
    if (!next) return;
    setName(next);
    setErrors((prev) => ({ ...prev, name: undefined }));
  }

  async function onPickProductImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingImage(true);
    try {
      const { data } = await mediaApi.upload(file, "product");
      setImages((prev) => [...prev, data.url]);
      toast.success("Image added", "Product image uploaded successfully.");
    } catch (err) {
      toast.error(
        "Couldn't upload image",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setUploadingImage(false);
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  function applyAiCategory() {
    const hint = aiResult?.suggestion.suggestedCategory?.trim().toLowerCase();
    if (!hint) return;
    // Best-effort fuzzy match — accept exact slug, name includes, or vice versa.
    const match = categories.find((c) => {
      const n = c.name.trim().toLowerCase();
      return n === hint || n.includes(hint) || hint.includes(n);
    });
    if (match) {
      setCategoryId(match.id);
      toast.success("Category applied", match.name);
    } else {
      toast.toast({
        tone: "info",
        title: "No matching category",
        description: `AI suggested "${aiResult?.suggestion.suggestedCategory}" — create it on Manage categories, then re-apply.`,
      });
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={editing ? "Edit product" : "Add product"}
      description={editing ? undefined : "Add a product to track stock and get low-stock alerts."}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={close} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="product-form" disabled={saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add product"}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={submit} className="space-y-4">
        {isPharmacy && (
          <div className="rounded-lg border border-primary/25 bg-primary/[0.12] p-3">
            {!aiResult ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Sparkles size={16} className="mt-0.5 shrink-0 text-primary-light" />
                  <div>
                    <p className="text-[13px] font-medium text-white">Scan packaging with AI</p>
                    <p className="mt-0.5 text-[12px] text-white/55">
                      Take a photo and we'll extract the drug name, NAFDAC number, indications, and warnings for you to review.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={aiBusy !== null}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-primary/40 bg-primary/[0.08] px-3 py-1.5 text-[12px] font-medium text-primary-light hover:bg-primary hover:text-white disabled:opacity-60"
                >
                  {aiBusy === "upload" ? (
                    <><Loader2 size={13} className="animate-spin" /> Uploading…</>
                  ) : aiBusy === "analyse" ? (
                    <><Loader2 size={13} className="animate-spin" /> Analysing…</>
                  ) : (
                    <><Camera size={13} /> Scan packaging</>
                  )}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={onPickAiImage}
                  className="hidden"
                />
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-primary" />
                    <p className="text-[13px] font-medium text-white">AI suggestions</p>
                    <Chip tone={CONFIDENCE_TONE[aiResult.confidence]}>{aiResult.confidence} confidence</Chip>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setAiCollapsed((v) => !v)}
                      className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] text-white/65 hover:bg-cinema-elev hover:text-white"
                    >
                      {aiCollapsed ? (<><ChevronDown size={12} /> Show</>) : (<><ChevronUp size={12} /> Hide</>)}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiResult(null)}
                      aria-label="Dismiss AI suggestions"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white/45 hover:bg-cinema-elev hover:text-white"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
                {!aiCollapsed && (
                  <>
                    <div className="mt-2 rounded-md border border-white/[0.06] bg-cinema-elev px-3 py-2">
                      <AiRow
                        label="Name"
                        value={
                          aiResult.suggestion.nameBrand && aiResult.suggestion.nameGeneric
                            ? `${aiResult.suggestion.nameBrand} (${aiResult.suggestion.nameGeneric})`
                            : (aiResult.suggestion.nameBrand || aiResult.suggestion.nameGeneric)
                        }
                        onApply={applyAiName}
                      />
                      <AiRow
                        label="Suggested category"
                        value={aiResult.suggestion.suggestedCategory}
                        onApply={applyAiCategory}
                      />
                      <AiRow label="NAFDAC number" value={aiResult.suggestion.nafdacNumber} />
                      <AiRow label="Brand / manufacturer" value={aiResult.suggestion.brand} />
                      <AiRow label="Requires prescription" value={aiResult.suggestion.requiresPrescription} />
                      <AiRow label="Indications" value={aiResult.suggestion.indications} />
                      <AiRow label="Dosage guidance" value={aiResult.suggestion.dosageGuidance} />
                      <AiRow label="Warnings" value={aiResult.suggestion.warnings} />
                      <AiRow label="Storage" value={aiResult.suggestion.storage} />
                      <AiRow label="Description" value={aiResult.suggestion.description} />
                    </div>
                    <p className="mt-2 flex items-start gap-1.5 text-[11px] text-white/55">
                      <AlertCircle size={11} className="mt-0.5 shrink-0 text-primary-light" />
                      {aiResult.note}
                    </p>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={aiBusy !== null}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-cinema-elev px-2.5 py-1 text-[11px] font-medium text-white/65 hover:border-primary hover:text-primary disabled:opacity-60"
                    >
                      {aiBusy ? <Loader2 size={11} className="animate-spin" /> : <Camera size={11} />} Try another photo
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={onPickAiImage}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            )}
          </div>
        )}

        <Field label="Product name" htmlFor="pr-name" required error={errors.name}>
          <TextInput id="pr-name" value={name} error={errors.name} onChange={(e) => setName(e.target.value)} placeholder={namePlaceholder} autoFocus />
        </Field>

        {/* ── Product Images ── */}
        <div className="space-y-3">
          <label className="block text-[13px] font-medium text-white/65">Product images</label>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((url) => (
                <div key={url} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-white/[0.06]">
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => imageFileRef.current?.click()}
                disabled={uploadingImage}
                className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-white/[0.06] text-white/35 hover:border-primary/50 hover:text-primary-light transition-colors"
              >
                {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={18} />}
              </button>
            </div>
          )}
          {images.length === 0 && (
            <button
              type="button"
              onClick={() => imageFileRef.current?.click()}
              disabled={uploadingImage}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/[0.06] px-4 py-6 text-[13px] text-white/45 hover:border-primary/50 hover:text-primary-light transition-colors"
            >
              {uploadingImage ? (
                <><Loader2 size={14} className="animate-spin" /> Uploading…</>
              ) : (
                <><ImagePlus size={16} /> Upload product image</>
              )}
            </button>
          )}
          <input
            ref={imageFileRef}
            type="file"
            accept="image/*"
            onChange={onPickProductImage}
            className="hidden"
          />
          {images.length > 0 && (
            <p className="text-[11px] text-white/45">{images.length} image{images.length !== 1 ? "s" : ""} uploaded</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="SKU" htmlFor="pr-sku">
            <TextInput id="pr-sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Optional" />
          </Field>
          <Field label="Category" htmlFor="pr-cat">
            <Select id="pr-cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Uncategorised</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Price (₦)" htmlFor="pr-price" error={errors.price}>
            <TextInput id="pr-price" inputMode="decimal" value={price} error={errors.price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
          </Field>
          <Field label="Stock" htmlFor="pr-stock" error={errors.stock}>
            <TextInput id="pr-stock" inputMode="numeric" value={stock} error={errors.stock} onChange={(e) => setStock(e.target.value)} placeholder="0" />
          </Field>
          <Field label="Reorder at" htmlFor="pr-reorder" error={errors.reorder} hint="Low-stock alert">
            <TextInput id="pr-reorder" inputMode="numeric" value={reorder} error={errors.reorder} onChange={(e) => setReorder(e.target.value)} placeholder="0" />
          </Field>
        </div>
        <Field label="Expiry date" htmlFor="pr-expiry" hint="Optional — used by pharmacies to flag stock that's about to expire.">
          <TextInput id="pr-expiry" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
        </Field>
        <label className="flex items-center gap-2.5">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 rounded border-white/[0.06] text-primary focus:ring-primary" />
          <span className="text-[14px] text-white/65">Active (visible & sellable)</span>
        </label>
      </form>
    </Modal>
  );
}
