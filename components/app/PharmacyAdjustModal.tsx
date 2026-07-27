"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, Select, TextArea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { type Product } from "@/lib/api/inventory";
import {
  pharmacyInventoryApi,
  ADJUSTMENT_REASON_LABELS,
  type AdjustmentReason,
  type AdjustmentInput,
} from "@/lib/api/pharmacyInventory";
import { ApiError } from "@/lib/api/client";

/** Pharmacy adjustment with reason code (Spec v2 §12A). Unlike the simpler
 *  delta-based AdjustStockModal used by other verticals, this submits the
 *  **absolute target quantity** plus a reason code that lands in the
 *  movement log for the audit trail. */
export function PharmacyAdjustModal({
  open,
  onClose,
  product,
  onAdjusted,
}: {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onAdjusted?: () => void;
}) {
  const toast = useToast();
  const [adjustedQty, setAdjustedQty] = useState("");
  const [reason, setReason] = useState<AdjustmentReason>("COUNT_CORRECTION");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !product) return;
    setAdjustedQty(String(product.stock));
    setReason("COUNT_CORRECTION");
    setNote("");
    setSaving(false);
  }, [open, product]);

  if (!product) return null;

  const target = Number(adjustedQty);
  const variance = Number.isFinite(target) ? target - product.stock : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    if (!adjustedQty || !Number.isFinite(target) || target < 0) {
      toast.error("Enter a valid quantity", "The new stock level must be zero or more.");
      return;
    }
    if (target === product.stock) {
      toast.toast({ tone: "info", title: "No change", description: "The new quantity matches the current stock — nothing to adjust." });
      return;
    }
    if ((reason === "DAMAGE" || reason === "EXPIRY_REMOVAL" || reason === "THEFT") && !note.trim()) {
      toast.error("Add a note", "Damage, expiry, and theft adjustments must include a reason note for the audit trail.");
      return;
    }
    const body: AdjustmentInput = {
      productId: product.id,
      adjustedQty: target,
      reason,
      note: note.trim() || undefined,
    };
    setSaving(true);
    try {
      const { data } = await pharmacyInventoryApi.adjustment(body);
      toast.success(
        "Adjustment recorded",
        `${product.name}: ${data.quantityBefore} → ${data.quantityAfter} (${data.variance > 0 ? "+" : ""}${data.variance})`,
      );
      onAdjusted?.();
      onClose();
    } catch (err) {
      toast.error(
        "Couldn't adjust stock",
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
      title={`Adjust ${product.name}`}
      description={`Current stock: ${product.stock}. Enter the new physical count and a reason — every adjustment is recorded in the movement log.`}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="pa-form" disabled={saving}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Adjust stock"}
          </Button>
        </>
      }
    >
      <form id="pa-form" onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="New stock quantity" htmlFor="pa-qty" required>
            <TextInput
              id="pa-qty"
              inputMode="numeric"
              value={adjustedQty}
              onChange={(e) => setAdjustedQty(e.target.value)}
              placeholder={String(product.stock)}
              autoFocus
            />
          </Field>
          <Field label="Reason" htmlFor="pa-reason" required>
            <Select
              id="pa-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as AdjustmentReason)}
            >
              {Object.entries(ADJUSTMENT_REASON_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </Field>
        </div>

        {variance != null && variance !== 0 && (
          <div className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 ${
            variance > 0
              ? "border-success/30 bg-emerald-500/20"
              : "border-danger/30 bg-rose-500/15"
          }`}>
            <span className="text-[13px] text-white/65">Variance</span>
            <span className={`font-mono text-[14px] font-medium ${variance > 0 ? "text-emerald-300" : "text-rose-200"}`}>
              {variance > 0 ? "+" : ""}{variance} unit{Math.abs(variance) === 1 ? "" : "s"}
            </span>
          </div>
        )}

        <Field
          label="Note"
          htmlFor="pa-note"
          hint={(reason === "DAMAGE" || reason === "EXPIRY_REMOVAL" || reason === "THEFT")
            ? "Required for this reason — include batch, lot, or other detail for the audit."
            : "Optional — context for the audit log."}
        >
          <TextArea
            id="pa-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={
              reason === "EXPIRY_REMOVAL" ? "e.g. Batch B-2024-09 expired, 12 units removed"
              : reason === "DAMAGE" ? "e.g. Water damage from leaking AC unit"
              : reason === "THEFT" ? "e.g. Reported to police — case ref XYZ"
              : "Optional context"
            }
          />
        </Field>

        <p className="flex items-start gap-1.5 rounded-md bg-white/[0.06] px-3 py-2 text-[11px] text-white/60">
          <AlertCircle size={11} className="mt-0.5 shrink-0 text-primary-light" />
          Adjustments are append-only in the audit log. You can't edit or delete this row later — pick the reason carefully.
        </p>
      </form>
    </Modal>
  );
}
