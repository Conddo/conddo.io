"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, TextArea, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api/client";
import { propertiesApi, type PropertyType, type ListingType } from "@/lib/api/properties";

/** Minimal create form — advanced fields (documents, features, images) live
 *  on the edit page since first-add friction should be low. */
export function CreatePropertyModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [listingType, setListingType] = useState<ListingType>("sale");
  const [price, setPrice] = useState("");
  const [state, setState] = useState("Lagos");
  const [estateName, setEstateName] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  function close() {
    if (saving) return;
    setError(null);
    setTitle("");
    setPropertyType("apartment");
    setListingType("sale");
    setPrice("");
    setState("Lagos");
    setEstateName("");
    setBedrooms("");
    setDescription("");
    onClose();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError("Give the listing a title.");
    const parsedPrice = Number(price.replace(/[,\s]/g, ""));
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return setError("Enter a valid price.");
    }
    setSaving(true);
    setError(null);
    try {
      await propertiesApi.create({
        title: title.trim(),
        propertyType,
        listingType,
        price: parsedPrice,
        state: state.trim() || undefined,
        estateName: estateName.trim() || undefined,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        description: description.trim() || undefined,
      });
      toast.push({ tone: "success", message: "Listing added." });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save the listing.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="New listing"
      description="Add a property to your dashboard. You can add photos + documents from the listing page after saving."
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={close} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="new-property-form" disabled={saving}>
            {saving ? "Saving…" : "Save listing"}
          </Button>
        </>
      }
    >
      <form id="new-property-form" onSubmit={submit} className="space-y-4">
        <Field label="Title" htmlFor="p-title" required error={error ?? undefined}>
          <TextInput
            id="p-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 3-bed apartment in Lekki Phase 1"
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Type" htmlFor="p-type">
            <Select
              id="p-type"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
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
          <Field label="For" htmlFor="p-listing">
            <Select
              id="p-listing"
              value={listingType}
              onChange={(e) => setListingType(e.target.value as ListingType)}
            >
              <option value="sale">Sale</option>
              <option value="rent">Rent</option>
              <option value="short-let">Short-let</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (₦)" htmlFor="p-price" required>
            <TextInput
              id="p-price"
              value={price}
              inputMode="decimal"
              onChange={(e) => setPrice(e.target.value)}
              placeholder="35,000,000"
            />
          </Field>
          <Field label="Bedrooms" htmlFor="p-beds">
            <TextInput
              id="p-beds"
              type="number"
              min={0}
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              placeholder="3"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Estate / area" htmlFor="p-estate">
            <TextInput
              id="p-estate"
              value={estateName}
              onChange={(e) => setEstateName(e.target.value)}
              placeholder="Lekki Phase 1"
            />
          </Field>
          <Field label="State" htmlFor="p-state">
            <TextInput
              id="p-state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="Lagos"
            />
          </Field>
        </div>

        <Field label="Description" htmlFor="p-desc" hint="What makes this listing stand out?">
          <TextArea
            id="p-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Newly built, all-en-suite, 24hr power, C of O ready."
          />
        </Field>
      </form>
    </Modal>
  );
}
