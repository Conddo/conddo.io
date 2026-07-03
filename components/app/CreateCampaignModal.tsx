"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { VerifiedOnly } from "@/components/app/VerifiedOnly";
import { Field, TextInput, TextArea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { marketingApi, type Campaign } from "@/lib/api/marketing";
import { ApiError } from "@/lib/api/client";

/** Create an email or SMS campaign (POST /marketing/campaigns). Starts as a draft. */
export function CreateCampaignModal({
  open,
  onClose,
  type,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  type: "email" | "sms";
  onCreated?: (c: Campaign) => void;
}) {
  const toast = useToast();
  const label = type === "email" ? "email campaign" : "SMS blast";
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  function close() {
    if (saving) return;
    setName(""); setContent(""); setAudience(""); setScheduledAt(""); setError(undefined);
    onClose();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Give your campaign a name."); return; }
    setSaving(true);
    try {
      const { data } = await marketingApi.createCampaign({
        name: name.trim(),
        type,
        content: content.trim() || undefined,
        audienceSize: audience ? Number(audience) : undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      });
      toast.success(`${type === "email" ? "Email campaign" : "SMS blast"} created`, data.name);
      close();
      onCreated?.(data);
    } catch (err) {
      toast.error(`Couldn't create ${label}`, err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={type === "email" ? "New email campaign" : "New SMS blast"}
      description={`Draft a ${label}. You can review before it sends.`}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={close} disabled={saving}>Cancel</Button>
          <VerifiedOnly message="Verify your email before creating campaigns — check the banner at the top.">
            <Button variant="primary" size="md" type="submit" form="create-campaign-form" disabled={saving}>
              {saving ? "Creating…" : "Create draft"}
            </Button>
          </VerifiedOnly>
        </>
      }
    >
      <form id="create-campaign-form" onSubmit={submit} className="space-y-4">
        <Field label="Campaign name" htmlFor="cc-name" required error={error}>
          <TextInput id="cc-name" value={name} error={error} onChange={(e) => setName(e.target.value)} placeholder={type === "email" ? "e.g. May Promo" : "e.g. Flash Sale Alert"} autoFocus />
        </Field>
        <Field label={type === "email" ? "Message" : "SMS text"} htmlFor="cc-content" hint={type === "sms" ? "Keep it short — SMS is charged per segment." : undefined}>
          <TextArea id="cc-content" value={content} onChange={(e) => setContent(e.target.value)} rows={type === "sms" ? 2 : 4} placeholder="What do you want to say?" />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Audience size" htmlFor="cc-audience" hint="Optional estimate.">
            <TextInput id="cc-audience" inputMode="numeric" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="0" />
          </Field>
          <Field label="Schedule for" htmlFor="cc-when" hint="Leave blank to keep as draft.">
            <TextInput id="cc-when" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          </Field>
        </div>
      </form>
    </Modal>
  );
}
