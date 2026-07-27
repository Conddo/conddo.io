"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { inventoryApi, type Product } from "@/lib/api/inventory";
import { ApiError } from "@/lib/api/client";

const REASONS = ["Restock", "Sold", "Damaged", "Returned", "Correction", "Other"];

/** Adjust a product's stock by a signed delta (POST /inventory/products/{id}/adjust). */
export function AdjustStockModal({
  open,
  onClose,
  product,
  onAdjusted,
}: {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onAdjusted?: (p: Product) => void;
}) {
  const toast = useToast();
  const [direction, setDirection] = useState<1 | -1>(1);
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDirection(1);
      setQty("");
      setReason(REASONS[0]);
      setError(undefined);
    }
  }, [open]);

  if (!product) return null;

  const n = Number(qty);
  const projected = product.stock + direction * (Number.isFinite(n) ? n : 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    if (!qty || Number.isNaN(n) || n <= 0) {
      setError("Enter a quantity greater than zero.");
      return;
    }
    if (direction === -1 && n > product.stock) {
      setError(`Can't remove more than current stock (${product.stock}).`);
      return;
    }
    setSaving(true);
    try {
      const { data } = await inventoryApi.adjustStock(product.id, direction * n, reason);
      toast.success("Stock updated", `${product.name} → ${data.stock}`);
      onClose();
      onAdjusted?.(data);
    } catch (err) {
      toast.error("Couldn't adjust stock", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      title="Adjust stock"
      description={`${product.name} · current ${product.stock}`}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={() => !saving && onClose()} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="adjust-stock-form" disabled={saving}>
            {saving ? "Saving…" : "Apply"}
          </Button>
        </>
      }
    >
      <form id="adjust-stock-form" onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDirection(1)}
            className={`flex items-center justify-center gap-1.5 rounded-md border py-2.5 text-[14px] font-medium transition-colors ${direction === 1 ? "border-success/40 bg-emerald-500/20 text-emerald-300" : "border-white/[0.08] text-white/65 hover:bg-white/[0.06] hover:text-white"}`}
          >
            <Plus size={15} /> Add
          </button>
          <button
            type="button"
            onClick={() => setDirection(-1)}
            className={`flex items-center justify-center gap-1.5 rounded-md border py-2.5 text-[14px] font-medium transition-colors ${direction === -1 ? "border-danger/40 bg-rose-500/15 text-rose-200" : "border-white/[0.08] text-white/65 hover:bg-white/[0.06] hover:text-white"}`}
          >
            <Minus size={15} /> Remove
          </button>
        </div>
        <Field label="Quantity" htmlFor="as-qty" required error={error}>
          <TextInput id="as-qty" inputMode="numeric" value={qty} error={error} onChange={(e) => setQty(e.target.value)} placeholder="0" autoFocus />
        </Field>
        <Field label="Reason" htmlFor="as-reason">
          <Select id="as-reason" value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
        </Field>
        <p className="rounded-md bg-white/[0.06] px-3 py-2.5 text-[13px] text-white/80">
          New stock level: <span className="font-mono font-medium text-white">{Math.max(0, projected)}</span>
        </p>
      </form>
    </Modal>
  );
}
