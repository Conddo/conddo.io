"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save, Loader2, Trash2, ChevronDown, Building2, FileText, ImagePlus, AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Field, TextInput, TextArea, Select } from "@/components/ui/Field";
import { MediaGalleryEditor } from "@/components/ui/MediaGalleryEditor";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api/client";
import { mediaApi } from "@/lib/api/media";
import {
  propertiesApi, listingTypeLabel, propertyStatusLabel, propertyStatusTone,
  propertyTypeLabel,
  type ListingType, type PropertyDetail, type PropertyStatus, type PropertyType,
  type UpdatePropertyInput,
} from "@/lib/api/properties";

/**
 * Property detail + edit page. Split into three panels:
 *  - Media (gallery + floor plan) via MediaGalleryEditor + single-file upload
 *  - Core fields (title, price, spec, location)
 *  - Documents (Nigerian CofO/Deed/Governor's Consent status)
 *
 * <p>Save is a single PATCH with all dirty fields. Individual actions
 * (change status, delete) fire their own endpoints so the primary Save
 * button only owns content edits.
 */
export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const toast = useToast();

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [floorPlanUploading, setFloorPlanUploading] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await propertiesApi.get(params.id);
        if (active) setProperty(data);
      } catch (err) {
        if (active) setError(err instanceof ApiError ? err.message : "Couldn't load property.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [params.id]);

  if (loading) {
    return (
      <AppShell title="Property" backHref="/properties">
        <div className="flex justify-center py-20 text-white/45">
          <Loader2 size={20} className="animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (error || !property) {
    return (
      <AppShell title="Property" backHref="/properties">
        <div className="rounded-xl border border-danger/20 bg-rose-500/[0.06] p-6 text-center text-rose-200">
          <AlertCircle className="mx-auto mb-2" />
          {error ?? "Property not found."}
        </div>
      </AppShell>
    );
  }

  const patch = (change: Partial<PropertyDetail>) =>
    setProperty((prev) => (prev ? { ...prev, ...change } : prev));

  async function save() {
    if (!property) return;
    setSaving(true);
    try {
      const body: UpdatePropertyInput = {
        title: property.title,
        propertyType: property.propertyType,
        listingType: property.listingType,
        price: property.price,
        priceNegotiable: property.priceNegotiable,
        rentPeriod: property.rentPeriod ?? undefined,
        addressLine: property.addressLine ?? undefined,
        estateName: property.estateName ?? undefined,
        lga: property.lga ?? undefined,
        state: property.state ?? undefined,
        landmark: property.landmark ?? undefined,
        bedrooms: property.bedrooms ?? undefined,
        bathrooms: property.bathrooms ?? undefined,
        sizeSqm: property.sizeSqm ?? undefined,
        features: property.features,
        images: property.images,
        description: property.description ?? undefined,
        hasCofO: property.documents.cOfO,
        hasDeedOfAssignment: property.documents.deedOfAssignment,
        hasSurveyPlan: property.documents.surveyPlan,
        hasGovernorConsent: property.documents.governorConsent,
        hasGazette: property.documents.gazette,
        documentNotes: property.documentNotes ?? undefined,
        isPublic: property.isPublic,
        featured: property.featured,
      };
      const saved = await propertiesApi.update(property.id, body);
      setProperty(saved);
      toast.toast({ tone: "success", title: "Saved" });
    } catch (err) {
      toast.toast({
        tone: "error",
        title: err instanceof ApiError ? err.message : "Couldn't save",
      });
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(status: PropertyStatus) {
    try {
      const updated = await propertiesApi.changeStatus(property!.id, status);
      setProperty(updated);
      toast.toast({ tone: "success", title: `Status is now ${propertyStatusLabel(status)}` });
    } catch (err) {
      toast.toast({
        tone: "error",
        title: err instanceof ApiError ? err.message : "Couldn't change status",
      });
    }
  }

  async function remove() {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    try {
      await propertiesApi.delete(property!.id);
      toast.toast({ tone: "success", title: "Listing deleted" });
      router.push("/properties");
    } catch (err) {
      toast.toast({
        tone: "error",
        title: err instanceof ApiError ? err.message : "Couldn't delete",
      });
    }
  }

  async function uploadFloorPlan(file: File) {
    setFloorPlanUploading(true);
    try {
      const uploaded = await mediaApi.upload(file, "property-floor-plan");
      patch({ floorPlanUrl: uploaded.data.url });
      toast.toast({ tone: "success", title: "Floor plan uploaded" });
    } catch (err) {
      toast.toast({
        tone: "error",
        title: err instanceof ApiError ? err.message : "Couldn't upload floor plan",
      });
    } finally {
      setFloorPlanUploading(false);
    }
  }

  return (
    <AppShell
      title={property.title || "Untitled property"}
      subtitle={`${propertyTypeLabel(property.propertyType)} · ${listingTypeLabel(property.listingType)}`}
      backHref="/properties"
      actions={
        <>
          <StatusMenu current={property.status} onSelect={changeStatus} />
          <Button variant="primary" size="md" onClick={save} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left column — media + core fields + documents */}
        <div className="space-y-6">
          <Panel title="Photos" icon={ImagePlus}>
            <MediaGalleryEditor
              value={property.images}
              onChange={(next) => patch({ images: next })}
              purpose="property"
              emptyLabel="Add property photos"
              emptyHint="Drop photos here. The first one becomes the hero on your website."
            />
          </Panel>

          <Panel title="Core details" icon={Building2}>
            <div className="space-y-4">
              <Field label="Title" htmlFor="ed-title" required>
                <TextInput
                  id="ed-title"
                  value={property.title}
                  onChange={(e) => patch({ title: e.target.value })}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Type" htmlFor="ed-type">
                  <Select
                    id="ed-type"
                    value={property.propertyType}
                    onChange={(e) => patch({ propertyType: e.target.value as PropertyType })}
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="duplex">Duplex</option>
                    <option value="bungalow">Bungalow</option>
                    <option value="self-con">Self-con</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
                    <option value="office">Office</option>
                    <option value="shop">Shop</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="mixed-use">Mixed-use</option>
                  </Select>
                </Field>
                <Field label="For" htmlFor="ed-listing">
                  <Select
                    id="ed-listing"
                    value={property.listingType}
                    onChange={(e) => patch({ listingType: e.target.value as ListingType })}
                  >
                    <option value="sale">Sale</option>
                    <option value="rent">Rent</option>
                    <option value="short-let">Short-let</option>
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Field label="Price (₦)" htmlFor="ed-price">
                  <TextInput
                    id="ed-price"
                    inputMode="decimal"
                    value={property.price != null ? String(property.price) : ""}
                    onChange={(e) => patch({ price: Number(e.target.value.replace(/[,\s]/g, "")) || 0 })}
                  />
                </Field>
                <Field label="Bedrooms" htmlFor="ed-beds">
                  <TextInput
                    id="ed-beds"
                    type="number"
                    min={0}
                    value={property.bedrooms ?? ""}
                    onChange={(e) => patch({ bedrooms: e.target.value ? Number(e.target.value) : null })}
                  />
                </Field>
                <Field label="Bathrooms" htmlFor="ed-baths">
                  <TextInput
                    id="ed-baths"
                    type="number"
                    min={0}
                    value={property.bathrooms ?? ""}
                    onChange={(e) => patch({ bathrooms: e.target.value ? Number(e.target.value) : null })}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Estate / area" htmlFor="ed-estate">
                  <TextInput
                    id="ed-estate"
                    value={property.estateName ?? ""}
                    onChange={(e) => patch({ estateName: e.target.value || null })}
                    placeholder="Lekki Phase 1"
                  />
                </Field>
                <Field label="State" htmlFor="ed-state">
                  <TextInput
                    id="ed-state"
                    value={property.state ?? ""}
                    onChange={(e) => patch({ state: e.target.value || null })}
                    placeholder="Lagos"
                  />
                </Field>
              </div>

              <Field label="Address" htmlFor="ed-addr">
                <TextInput
                  id="ed-addr"
                  value={property.addressLine ?? ""}
                  onChange={(e) => patch({ addressLine: e.target.value || null })}
                  placeholder="12 Admiralty Way"
                />
              </Field>

              <Field label="Description" htmlFor="ed-desc">
                <TextArea
                  id="ed-desc"
                  rows={4}
                  value={property.description ?? ""}
                  onChange={(e) => patch({ description: e.target.value || null })}
                  placeholder="What makes this listing stand out?"
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Documents" icon={FileText}>
            <p className="mb-3 text-[13px] text-white/55">
              Buyers ask &ldquo;which papers are ready?&rdquo; before viewing.
              Mark what&apos;s in order — it appears on the listing.
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <DocToggle
                label="Certificate of Occupancy (C of O)"
                value={property.documents.cOfO}
                onChange={(v) => patch({ documents: { ...property.documents, cOfO: v } })}
              />
              <DocToggle
                label="Deed of Assignment"
                value={property.documents.deedOfAssignment}
                onChange={(v) =>
                  patch({ documents: { ...property.documents, deedOfAssignment: v } })
                }
              />
              <DocToggle
                label="Survey Plan"
                value={property.documents.surveyPlan}
                onChange={(v) => patch({ documents: { ...property.documents, surveyPlan: v } })}
              />
              <DocToggle
                label="Governor's Consent"
                value={property.documents.governorConsent}
                onChange={(v) =>
                  patch({ documents: { ...property.documents, governorConsent: v } })
                }
              />
              <DocToggle
                label="Gazette"
                value={property.documents.gazette}
                onChange={(v) => patch({ documents: { ...property.documents, gazette: v } })}
              />
            </div>
            <Field label="Notes on documents" htmlFor="ed-doc-notes" className="mt-4">
              <TextArea
                id="ed-doc-notes"
                rows={2}
                value={property.documentNotes ?? ""}
                onChange={(e) => patch({ documentNotes: e.target.value || null })}
                placeholder="Excision in progress. Consent expected in Q3."
              />
            </Field>
          </Panel>
        </div>

        {/* Right column — visibility + floor plan + danger */}
        <div className="space-y-6">
          <Panel title="Visibility">
            <div className="space-y-3">
              <ToggleRow
                label="Show on public website"
                value={property.isPublic}
                onChange={(v) => patch({ isPublic: v })}
              />
              <ToggleRow
                label="Feature on homepage"
                value={property.featured}
                onChange={(v) => patch({ featured: v })}
              />
              <ToggleRow
                label="Price negotiable"
                value={property.priceNegotiable}
                onChange={(v) => patch({ priceNegotiable: v })}
              />
            </div>
          </Panel>

          <Panel title="Floor plan">
            {property.floorPlanUrl ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={property.floorPlanUrl}
                  alt="Floor plan"
                  className="w-full rounded-lg border border-white/[0.08]"
                />
                <button
                  type="button"
                  onClick={() => patch({ floorPlanUrl: null })}
                  className="inline-flex items-center gap-1 text-[13px] text-rose-200 hover:text-white"
                >
                  <Trash2 size={13} strokeWidth={2.25} />
                  Remove floor plan
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] p-6 text-center hover:border-white/20">
                {floorPlanUploading ? (
                  <Loader2 size={18} className="animate-spin text-white/70" />
                ) : (
                  <ImagePlus size={18} className="text-white/70" />
                )}
                <p className="mt-1 text-[13px] font-medium text-white">
                  {floorPlanUploading ? "Uploading…" : "Add floor plan"}
                </p>
                <p className="mt-0.5 text-[12px] text-white/45">JPEG, PNG, or PDF</p>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) uploadFloorPlan(f);
                  }}
                />
              </label>
            )}
          </Panel>

          <Panel title="Danger zone">
            <p className="mb-3 text-[13px] text-white/55">
              Deleting a listing removes it everywhere including your public site.
            </p>
            <button
              type="button"
              onClick={remove}
              className="inline-flex items-center gap-1.5 rounded-md border border-danger/25 bg-rose-500/[0.06] px-3 py-1.5 text-[13.5px] font-medium text-rose-200 hover:bg-rose-500/[0.12]"
            >
              <Trash2 size={14} />
              Delete this listing
            </button>
          </Panel>

          <p className="text-center text-[12px] text-white/40">
            <Link href="/properties" className="hover:text-white/70">
              ← Back to all properties
            </Link>
          </p>
        </div>
      </div>
    </AppShell>
  );
}

// ----- Small helpers --------------------------------------------------------

function Panel({
  title, icon: Icon, children,
}: {
  title: string; icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-cinema-elev p-5">
      <div className="mb-4 flex items-center gap-2">
        {Icon && (
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.05] text-white/60">
            <Icon size={13} strokeWidth={2.25} />
          </span>
        )}
        <h2 className="text-[13.5px] font-medium uppercase tracking-[0.06em] text-white/70">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function DocToggle({
  label, value, onChange,
}: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-[13.5px] transition-colors ${
        value
          ? "border-emerald-500/25 bg-emerald-500/[0.05] text-emerald-100"
          : "border-white/[0.08] bg-white/[0.02] text-white/70 hover:border-white/20"
      }`}
    >
      <span>{label}</span>
      <span
        className={`inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          value ? "bg-emerald-500/70" : "bg-white/10"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function ToggleRow({
  label, value, onChange,
}: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between text-[14px] text-white/85">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          value ? "bg-primary/85" : "bg-white/10"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function StatusMenu({
  current, onSelect,
}: {
  current: PropertyStatus;
  onSelect: (s: PropertyStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const options: PropertyStatus[] = [
    "draft", "available", "reserved", "under_offer", "sold", "rented", "archived",
  ];
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[13.5px] text-white hover:bg-white/[0.08]"
      >
        <Chip tone={propertyStatusTone(current)}>{propertyStatusLabel(current)}</Chip>
        <ChevronDown size={14} strokeWidth={2.25} />
      </button>
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute right-0 top-full z-30 mt-1 w-56 rounded-lg border border-white/10 bg-cinema-elev p-1 shadow-2xl"
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[13.5px] transition-colors hover:bg-white/[0.06] ${
                opt === current ? "bg-white/[0.04]" : ""
              }`}
            >
              <span>{propertyStatusLabel(opt)}</span>
              {opt === current && <Chip tone={propertyStatusTone(opt)}>Current</Chip>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
