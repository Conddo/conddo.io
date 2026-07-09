"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, TextArea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api/client";
import { dealsApi } from "@/lib/api/deals";

/** New deal — starts as a Lead. Property + agent assignment happen from the
 *  detail page since first-add friction should be low. Commission_pct is
 *  captured here because it's the number tenants care about at intake. */
export function CreateDealModal({
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
  const [prospectName, setProspectName] = useState("");
  const [prospectPhone, setProspectPhone] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [commissionPct, setCommissionPct] = useState("7.5");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  function close() {
    if (saving) return;
    setError(null);
    setProspectName("");
    setProspectPhone("");
    setDealValue("");
    setCommissionPct("7.5");
    setNotes("");
    onClose();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!prospectName.trim()) return setError("Prospect name is required.");
    const parsedValue = dealValue ? Number(dealValue.replace(/[,\s]/g, "")) : undefined;
    const parsedPct = commissionPct ? Number(commissionPct) : undefined;

    setSaving(true);
    setError(null);
    try {
      await dealsApi.create({
        prospectName: prospectName.trim(),
        prospectPhone: prospectPhone.trim() || undefined,
        dealValue: parsedValue,
        commissionPct: parsedPct,
        notes: notes.trim() || undefined,
      });
      toast.push({ tone: "success", message: "Deal created — starts as a Lead." });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save the deal.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="New deal"
      description="Add a prospect to your pipeline. Link the property + assign an agent from the deal page after."
      size="md"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={close} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="new-deal-form" disabled={saving}>
            {saving ? "Saving…" : "Add to pipeline"}
          </Button>
        </>
      }
    >
      <form id="new-deal-form" onSubmit={submit} className="space-y-4">
        <Field label="Prospect name" htmlFor="d-name" required error={error ?? undefined}>
          <TextInput
            id="d-name"
            value={prospectName}
            onChange={(e) => setProspectName(e.target.value)}
            placeholder="Amaka Adekunle"
            autoFocus
          />
        </Field>

        <Field label="Phone" htmlFor="d-phone" hint="Optional — WhatsApp works best">
          <TextInput
            id="d-phone"
            value={prospectPhone}
            onChange={(e) => setProspectPhone(e.target.value)}
            placeholder="+234 812 345 6789"
            inputMode="tel"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Deal value (₦)" htmlFor="d-value" hint="Estimated close price">
            <TextInput
              id="d-value"
              value={dealValue}
              inputMode="decimal"
              onChange={(e) => setDealValue(e.target.value)}
              placeholder="45,000,000"
            />
          </Field>
          <Field label="Commission %" htmlFor="d-pct">
            <TextInput
              id="d-pct"
              value={commissionPct}
              inputMode="decimal"
              onChange={(e) => setCommissionPct(e.target.value)}
              placeholder="7.5"
            />
          </Field>
        </div>

        <Field label="Notes" htmlFor="d-notes" hint="Optional intake context">
          <TextArea
            id="d-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Referred by Chinedu. Wants a 3-bed in Lekki, budget flexible."
          />
        </Field>
      </form>
    </Modal>
  );
}
