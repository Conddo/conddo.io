"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Truck, Loader2, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { inventoryApi, type Product } from "@/lib/api/inventory";
import {
  pharmacyInventoryApi,
  type RestockInput,
} from "@/lib/api/pharmacyInventory";
import { ApiError } from "@/lib/api/client";

type Line = { productId: string; quantity: string };

/** Multi-line stock receipt — pharmacist enters everything that arrived on a
 *  delivery in one form. Each line becomes a RESTOCK movement; the BE
 *  returns a single restockId that all of them share for audit grouping. */
export function RestockModal({
  open,
  onClose,
  onRestocked,
}: {
  open: boolean;
  onClose: () => void;
  onRestocked?: () => void;
}) {
  const toast = useToast();
  const productsQ = useApiQuery(() => inventoryApi.list({ size: 500 }));
  const products: Product[] = productsQ.data ?? [];

  const [lines, setLines] = useState<Line[]>([{ productId: "", quantity: "" }]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLines([{ productId: "", quantity: "" }]);
    setNote("");
    setSaving(false);
  }, [open]);

  function patchLine(idx: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, { productId: "", quantity: "" }]);
  }

  function removeLine(idx: number) {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const items = lines
      .map((l) => ({ productId: l.productId, quantity: Number(l.quantity) }))
      .filter((l) => l.productId && Number.isFinite(l.quantity) && l.quantity > 0);
    if (items.length === 0) {
      toast.error("Add at least one line", "Pick a product and enter a quantity.");
      return;
    }
    const dupes = items.length - new Set(items.map((i) => i.productId)).size;
    if (dupes > 0) {
      toast.error("Duplicate product", "Each product can only appear once. Combine quantities into one line.");
      return;
    }
    const body: RestockInput = { items, note: note.trim() || undefined };
    setSaving(true);
    try {
      const { data } = await pharmacyInventoryApi.restock(body);
      toast.success(
        `Restock recorded`,
        `${data.itemsRestocked} line${data.itemsRestocked === 1 ? "" : "s"} added to stock.`,
      );
      onRestocked?.();
      onClose();
    } catch (err) {
      toast.error(
        "Couldn't record restock",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      title="Record restock"
      description="Add a delivery to inventory. Each line creates a RESTOCK movement; the audit log groups them under one restock id."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" form="restock-form" disabled={saving}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> Recording…</> : (<><Truck size={14} /> Record restock</>)}
          </Button>
        </>
      }
    >
      <form id="restock-form" onSubmit={submit} className="space-y-4">
        <div className="space-y-3">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 sm:grid-cols-[1fr_120px_auto]"
            >
              <Field label={idx === 0 ? "Product" : ""} htmlFor={`rs-p-${idx}`}>
                <Select
                  id={`rs-p-${idx}`}
                  value={line.productId}
                  onChange={(e) => patchLine(idx, { productId: e.target.value })}
                >
                  <option value="">Pick a product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (current: {p.stock})
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={idx === 0 ? "Quantity" : ""} htmlFor={`rs-q-${idx}`}>
                <TextInput
                  id={`rs-q-${idx}`}
                  inputMode="numeric"
                  value={line.quantity}
                  onChange={(e) => patchLine(idx, { quantity: e.target.value })}
                  placeholder="0"
                />
              </Field>
              <div className={idx === 0 ? "sm:self-end" : "self-end"}>
                <button
                  type="button"
                  onClick={() => removeLine(idx)}
                  disabled={lines.length === 1}
                  aria-label="Remove line"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white/45 hover:bg-rose-500/[0.06] hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white/45"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addLine}
            className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-white/[0.06] px-3 py-1.5 text-[12px] font-medium text-white/65 hover:border-primary hover:bg-primary/[0.08] hover:text-primary"
          >
            <Plus size={13} /> Add another line
          </button>
        </div>

        <Field label="Delivery note" htmlFor="rs-note" hint="Optional — supplier, invoice ref, anything that helps your audit later.">
          <TextInput
            id="rs-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Monthly restock from Emzor — invoice #INV-2026-06-091"
          />
        </Field>

        <p className="flex items-start gap-1.5 rounded-md bg-white/[0.06] px-3 py-2 text-[11px] text-white/60">
          <AlertCircle size={11} className="mt-0.5 shrink-0 text-primary-light" />
          Stock levels update immediately. Subscribe to the dashboard live-stock events for real-time updates across devices.
        </p>
      </form>
    </Modal>
  );
}
