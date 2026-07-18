"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { bookingsApi, type Availability, type DayHours, type DayKey } from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/client";

const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DOW: Record<DayKey, string> = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };
const DEFAULT_DAY: DayHours = { start: "09:00", end: "17:00", open: true };

/** Edit working hours + slot duration + buffer (PUT /bookings/availability). */
export function AvailabilityModal({
  open,
  onClose,
  current,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  current: Availability | null;
  onSaved?: () => void;
}) {
  const toast = useToast();
  const [hours, setHours] = useState<Record<DayKey, DayHours>>(() => buildHours(current));
  const [slot, setSlot] = useState(current?.slotDurationMinutes ?? 60);
  const [buffer, setBuffer] = useState(current?.bufferMinutes ?? 0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setHours(buildHours(current));
      setSlot(current?.slotDurationMinutes ?? 60);
      setBuffer(current?.bufferMinutes ?? 0);
    }
  }, [open, current]);

  function setDay(k: DayKey, patch: Partial<DayHours>) {
    setHours((prev) => ({ ...prev, [k]: { ...prev[k], ...patch } }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await bookingsApi.updateAvailability({ workingHours: hours, slotDurationMinutes: slot, bufferMinutes: buffer });
      toast.success("Availability updated");
      onClose();
      onSaved?.();
    } catch (err) {
      toast.error("Couldn't update availability", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      title="Availability"
      description="Set your working hours, slot length, and buffer between bookings."
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={() => !saving && onClose()} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="availability-form" disabled={saving}>
            {saving ? "Saving…" : "Save availability"}
          </Button>
        </>
      }
    >
      <form id="availability-form" onSubmit={submit} className="space-y-5">
        <div className="space-y-2">
          {DAY_KEYS.map((k) => {
            const d = hours[k];
            return (
              <div key={k} className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-border px-3 py-2.5">
                <label className="flex w-28 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={d.open}
                    onChange={(e) => setDay(k, { open: e.target.checked })}
                    className="h-4 w-4 rounded border-neutral-border text-primary focus:ring-primary"
                  />
                  <span className="text-[14px] font-medium text-ink">{DOW[k]}</span>
                </label>
                {d.open ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={d.start}
                      onChange={(e) => setDay(k, { start: e.target.value })}
                      className="rounded-md border border-neutral-border bg-white px-2 py-1.5 text-[13px] text-ink focus:border-primary focus:outline-none"
                    />
                    <span className="text-content-muted">–</span>
                    <input
                      type="time"
                      value={d.end}
                      onChange={(e) => setDay(k, { end: e.target.value })}
                      className="rounded-md border border-neutral-border bg-white px-2 py-1.5 text-[13px] text-ink focus:border-primary focus:outline-none"
                    />
                  </div>
                ) : (
                  <span className="text-[13px] text-content-muted">Closed</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Slot duration" htmlFor="av-slot">
            <Select id="av-slot" value={String(slot)} onChange={(e) => setSlot(Number(e.target.value))}>
              {[15, 30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} minutes</option>)}
            </Select>
          </Field>
          <Field label="Buffer between bookings" htmlFor="av-buffer">
            <Select id="av-buffer" value={String(buffer)} onChange={(e) => setBuffer(Number(e.target.value))}>
              {[0, 5, 10, 15, 30].map((m) => <option key={m} value={m}>{m === 0 ? "No buffer" : `${m} minutes`}</option>)}
            </Select>
          </Field>
        </div>
      </form>
    </Modal>
  );
}

function buildHours(a: Availability | null): Record<DayKey, DayHours> {
  const out = {} as Record<DayKey, DayHours>;
  for (const k of DAY_KEYS) out[k] = a?.workingHours?.[k] ?? { ...DEFAULT_DAY };
  return out;
}
