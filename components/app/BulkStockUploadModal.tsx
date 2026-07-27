"use client";

import { useRef, useState } from "react";
import {
  Upload, FileText, X, Loader2, Download, AlertCircle, CheckCircle2,
  ArrowRight, Trash2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";
import { naira } from "@/lib/format";
import {
  pharmacyInventoryApi,
  BULK_UPLOAD_ALL_HEADERS,
  type BulkUploadSummary,
  type BulkUploadPreviewRow,
} from "@/lib/api/pharmacyInventory";
import { ApiError } from "@/lib/api/client";

type Stage = "pick" | "previewing" | "preview" | "committing" | "done";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB — BE-side limit is higher but
                                       // 10 MB of CSV is ~100K rows; plenty.

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function actionTone(a?: string): "success" | "warning" | "neutral" | "danger" {
  switch ((a ?? "").toUpperCase()) {
    case "CREATE": return "success";
    case "UPDATE": return "warning";
    case "SKIP":   return "neutral";
    case "ERROR":  return "danger";
    default:       return "neutral";
  }
}

function templateCsv(): string {
  // Header row + 3 representative examples covering all the optional columns.
  // Tenants edit/extend this in their spreadsheet of choice.
  const header = BULK_UPLOAD_ALL_HEADERS.join(",");
  const rows = [
    "PARA-500,Paracetamol 500mg,100,150.00,20,B2026-06,2027-12-31",
    "AMOX-250,Amoxicillin 250mg,50,250.00,10,,2026-12-31",
    "VITC-1000,Vitamin C 1000mg,200,300.00,40,,",
  ];
  return [header, ...rows].join("\n");
}

function downloadTemplate() {
  const blob = new Blob([templateCsv()], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "conddo-bulk-stock-template.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Bulk stock upload wizard. Three stages: pick a CSV → dry-run preview →
 *  commit. Drag-drop or click to browse. The preview shows what would
 *  change before the pharmacist commits; errors block commit until the
 *  source CSV is fixed and re-uploaded. */
export function BulkStockUploadModal({
  open,
  onClose,
  onCommitted,
}: {
  open: boolean;
  onClose: () => void;
  /** Called after a successful commit (not a dry-run) so the parent can
   *  refresh its products list. */
  onCommitted?: () => void;
}) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [stage, setStage] = useState<Stage>("pick");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<BulkUploadSummary | null>(null);
  const [committed, setCommitted] = useState<BulkUploadSummary | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function reset() {
    setStage("pick");
    setFile(null);
    setPreview(null);
    setCommitted(null);
  }

  function close() {
    if (stage === "previewing" || stage === "committing") return;
    reset();
    onClose();
  }

  async function takeFile(picked: File) {
    if (!/\.csv$/i.test(picked.name) && picked.type !== "text/csv" && picked.type !== "application/vnd.ms-excel") {
      toast.error("CSV only", "Save your spreadsheet as CSV and try again.");
      return;
    }
    if (picked.size > MAX_FILE_SIZE) {
      toast.error("File too large", `Cap is ${fmtSize(MAX_FILE_SIZE)}.`);
      return;
    }
    setFile(picked);
    setStage("previewing");
    try {
      const { data } = await pharmacyInventoryApi.bulkUpload(picked, true);
      setPreview(data);
      setStage("preview");
    } catch (err) {
      toast.error(
        "Couldn't preview",
        err instanceof ApiError ? err.message : "Check the CSV and try again.",
      );
      setFile(null);
      setStage("pick");
    }
  }

  async function commit() {
    if (!file) return;
    setStage("committing");
    try {
      const { data } = await pharmacyInventoryApi.bulkUpload(file, false);
      setCommitted(data);
      setStage("done");
      onCommitted?.();
    } catch (err) {
      toast.error(
        "Couldn't apply changes",
        err instanceof ApiError ? err.message : "Please try again.",
      );
      setStage("preview");
    }
  }

  function onDragEnter(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) takeFile(f);
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Bulk stock upload"
      description={
        stage === "pick"     ? "Upload a CSV to replace your stock levels in one go." :
        stage === "preview"  ? "Review the preview, then commit when it looks right." :
        stage === "done"     ? "Changes applied to your inventory." :
        undefined
      }
      footer={
        stage === "pick" ? (
          <Button variant="secondary" size="md" onClick={close}>Cancel</Button>
        ) : stage === "preview" && preview ? (
          <>
            <Button variant="secondary" size="md" onClick={reset}>Pick another file</Button>
            <Button
              variant="primary"
              size="md"
              onClick={commit}
              disabled={preview.errors.length > 0 || (preview.created + preview.updated) === 0}
              title={
                preview.errors.length > 0 ? "Fix the errors in your CSV first" :
                (preview.created + preview.updated) === 0 ? "Nothing to commit" :
                undefined
              }
            >
              Commit {preview.created + preview.updated} change{(preview.created + preview.updated) === 1 ? "" : "s"} <ArrowRight size={14} />
            </Button>
          </>
        ) : stage === "done" ? (
          <Button variant="primary" size="md" onClick={close}>Done</Button>
        ) : null
      }
    >
      {stage === "pick" && (
        <PickStage
          fileInputRef={fileInputRef}
          isDragging={isDragging}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onFile={takeFile}
        />
      )}

      {stage === "previewing" && (
        <BusyStage label="Parsing and validating…" />
      )}

      {stage === "preview" && preview && file && (
        <PreviewStage file={file} preview={preview} onClear={() => { setFile(null); setPreview(null); setStage("pick"); }} />
      )}

      {stage === "committing" && (
        <BusyStage label="Applying changes to your inventory…" />
      )}

      {stage === "done" && committed && (
        <DoneStage committed={committed} />
      )}
    </Modal>
  );
}

function PickStage({
  fileInputRef,
  isDragging,
  onDragEnter,
  onDragLeave,
  onDrop,
  onFile,
}: {
  fileInputRef: React.RefObject<HTMLInputElement>;
  isDragging: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFile: (f: File) => void;
}) {
  return (
    <div className="space-y-4">
      <div
        onDragEnter={onDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/15"
            : "border-white/[0.10] bg-white/[0.04] hover:border-primary hover:bg-primary/10"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={28} className="text-primary" />
        <p className="text-[14px] font-medium text-white">Drop a CSV here, or click to browse</p>
        <p className="text-[12px] text-white/45">Up to {fmtSize(MAX_FILE_SIZE)}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) onFile(f);
          }}
        />
      </div>

      <div className="rounded-md border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-[12px]">
        <p className="mb-2 font-medium text-white">CSV format</p>
        <ul className="space-y-1 text-white/65">              <li className="flex items-start gap-2 text-white/80">
            <Chip tone="primary">Required</Chip>
            <code className="rounded bg-cinema-elev px-1 font-mono">sku</code>
            <code className="rounded bg-cinema-elev px-1 font-mono">stock</code>
          </li>              <li className="flex items-start gap-2 text-white/80">
            <Chip tone="neutral">Optional</Chip>
            <span className="font-mono text-[11px] text-white/60">
              name · price · reorder_threshold · batch_number · expiry_date (yyyy-MM-dd)
            </span>
          </li>
        </ul>
        <button
          type="button"
          onClick={downloadTemplate}
          className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline"
        >
          <Download size={11} /> Download template
        </button>
      </div>

      <p className="flex items-start gap-1.5 rounded-md bg-amber-500/15 px-3 py-2.5 text-[12px] text-amber-200">
        <AlertCircle size={12} className="mt-0.5 shrink-0" />
        Existing SKUs have their stock <strong>set absolute</strong> (not added — it's a replacement). New SKUs create a Product. Every change is logged in the movement log so you can audit later.
      </p>
    </div>
  );
}

function BusyStage({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <Loader2 size={28} className="animate-spin text-primary" />
      <p className="text-[13px] text-white/65">{label}</p>
    </div>
  );
}

function PreviewStage({
  file,
  preview,
  onClear,
}: {
  file: File;
  preview: BulkUploadSummary;
  onClear: () => void;
}) {
  const totalChanges = preview.created + preview.updated;
  const hasErrors = preview.errors.length > 0;

  return (
    <div className="space-y-4">
      {/* File chip */}
      <div className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2">
        <span className="flex min-w-0 items-center gap-2 text-[13px] text-white">
          <FileText size={14} className="shrink-0 text-white/55" />
          <span className="truncate">{file.name}</span>
          <span className="font-mono text-[11px] text-white/45">· {fmtSize(file.size)}</span>
        </span>
        <button
          type="button"
          onClick={onClear}
          aria-label="Remove"
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-white/45 hover:bg-rose-500/[0.06] hover:text-rose-200"
        >
          <Trash2 size={11} />
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total rows" value={preview.totalRows} tone="neutral" />
        <StatTile label="Create" value={preview.created} tone="success" />
        <StatTile label="Update" value={preview.updated} tone="warning" />
        <StatTile label="Skip" value={preview.skipped} tone="neutral" />
      </div>

      {/* Errors */}
      {hasErrors && (
        <div className="overflow-hidden rounded-lg border border-danger/30">
          <div className="border-b border-danger/30 bg-rose-500/[0.06] px-3 py-2 text-[12px] font-medium text-rose-200">
            {preview.errors.length} error{preview.errors.length === 1 ? "" : "s"} — fix and re-upload
          </div>
          <ul className="max-h-40 divide-y divide-danger/15 overflow-y-auto bg-cinema-elev">
            {preview.errors.slice(0, 20).map((e, i) => (
              <li key={i} className="flex items-start gap-2 px-3 py-2 text-[12px]">
                <span className="inline-flex h-5 shrink-0 items-center rounded bg-rose-500/[0.06] px-1.5 font-mono text-[10px] text-rose-200">
                  L{e.line}
                </span>
                <div className="min-w-0">
                  {e.sku && <p className="font-mono text-[11px] text-white/45">{e.sku}</p>}
                  <p className="text-white/65">{e.message}</p>
                </div>
              </li>
            ))}
            {preview.errors.length > 20 && (
              <li className="px-3 py-2 text-center text-[11px] text-white/45">
                + {preview.errors.length - 20} more
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Preview rows */}
      {preview.preview.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-white/[0.06]">
          <div className="border-b border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[12px] font-medium text-white">
            Preview ({preview.preview.length} of {preview.totalRows} rows)
          </div>
          <PreviewTable rows={preview.preview} />
        </div>
      )}

      {!hasErrors && totalChanges === 0 && (
        <p className="flex items-start gap-1.5 rounded-md bg-white/[0.02] px-3 py-2 text-[12px] text-white/45">
          <AlertCircle size={11} className="mt-0.5 shrink-0" />
          Nothing to commit — every row was skipped (already at the right stock level). Re-upload if that's wrong.
        </p>
      )}
    </div>
  );
}

function PreviewTable({ rows }: { rows: BulkUploadPreviewRow[] }) {
  // Pick the columns to render in priority order — only show columns present
  // in the preview to keep the table tight.
  const allKeys = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const priorityOrder = ["action", "sku", "name", "stock", "price", "reorder_threshold", "expiry_date"];
  const cols = priorityOrder.filter((k) => allKeys.includes(k));

  function formatCell(col: string, value: unknown): React.ReactNode {
    if (value == null || value === "") return <span className="text-white/45">—</span>;
    if (col === "action" && typeof value === "string") {
      return <Chip tone={actionTone(value)}>{value}</Chip>;
    }
    if (col === "price" && typeof value === "number") {
      return <span className="font-mono">{naira(value)}</span>;
    }
    if (typeof value === "number") {
      return <span className="font-mono">{value}</span>;
    }
    return <span>{String(value)}</span>;
  }

  return (
    <div className="max-h-72 overflow-auto">
      <table className="w-full text-left text-[12px]">
        <thead>
          <tr className="bg-white/[0.02] text-[10px] uppercase tracking-[0.05em] text-white/45">
            {cols.map((c) => (
              <th key={c} className="whitespace-nowrap px-3 py-2 font-medium">
                {c.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-white/[0.02]">
              {cols.map((c) => (
                <td key={c} className="whitespace-nowrap px-3 py-1.5 text-white">
                  {formatCell(c, r[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatTile({ label, value, tone }: { label: string; value: number; tone: "success" | "warning" | "neutral" }) {
  const toneText: Record<typeof tone, string> = {
    success: "text-emerald-300",
    warning: "text-amber-300",
    neutral: "text-white",
  };
  return (      <div className="rounded-lg border border-white/[0.08] bg-cinema-elev2 p-3">
      <p className="text-[10px] uppercase tracking-[0.05em] text-white/55">{label}</p>
      <p className={`mt-0.5 font-mono text-[18px] font-medium leading-none ${toneText[tone]}`}>{value}</p>
    </div>
  );
}

function DoneStage({ committed }: { committed: BulkUploadSummary }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
          <CheckCircle2 size={26} />
        </span>
        <p className="text-[15px] font-medium text-white">Inventory updated</p>
        <p className="text-[13px] text-white/65">
          {committed.created} created · {committed.updated} updated · {committed.skipped} skipped
        </p>
      </div>        <p className="flex items-start gap-1.5 rounded-md bg-white/[0.06] px-3 py-2 text-[12px] text-white/60">
        <AlertCircle size={12} className="mt-0.5 shrink-0 text-primary-light" />
        Each row generated a movement-log entry (RESTOCK for new products, ADJUSTMENT for stock changes) — audit them on the Movements page anytime.
      </p>
    </div>
  );
}
