"use client";

import { useCallback, useState } from "react";
import { GitPullRequest, Plus, MoveRight, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";
import { CreateDealModal } from "@/components/app/CreateDealModal";
import {
  DEAL_STAGES,
  dealStageLabel,
  dealsApi,
  dealsBoardQuery,
  type DealRow,
  type DealStage,
} from "@/lib/api/deals";

/**
 * Real Estate — deals kanban. Column per stage, drag-to-move.
 *
 * <p>Native HTML5 drag & drop keeps this dependency-free. When you drop
 * a card onto a different column, the FE optimistically updates the
 * board while the PATCH /stage request fires. On failure it reverts.
 * The BE auto-accrues commission when moving to `deposit_paid`.
 */
export default function DealsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const q = useApiQuery<Record<DealStage, DealRow[]>>(dealsBoardQuery);
  const [board, setBoard] = useState<Record<DealStage, DealRow[]> | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  // Sync local optimistic board with server data on every fetch.
  if (q.data && board === null) {
    setBoard(q.data);
  }

  const move = useCallback(
    async (dealId: string, fromStage: DealStage, toStage: DealStage) => {
      if (fromStage === toStage) return;
      if (!board) return;

      // Optimistic — snapshot for rollback.
      const snapshot = board;
      const next: Record<DealStage, DealRow[]> = { ...board };
      const src = next[fromStage].filter((d) => d.id !== dealId);
      const moved = board[fromStage].find((d) => d.id === dealId);
      if (!moved) return;
      const moving: DealRow = { ...moved, stage: toStage };
      next[fromStage] = src;
      next[toStage] = [moving, ...next[toStage]];
      setBoard(next);

      setSaving(dealId);
      try {
        await dealsApi.moveStage(dealId, toStage);
        // Sync from server to pick up any auto-changes (deposit_paid stamps
        // depositPaidAt; commission_amount is recomputed).
        q.refetch();
      } catch {
        setBoard(snapshot);
      } finally {
        setSaving(null);
      }
    },
    [board, q],
  );

  return (
    <AppShell
      title="Deals"
      subtitle="Drag between columns to move a deal through the pipeline"
      actions={
        <Button onClick={() => setCreateOpen(true)} variant="primary" size="md">
          <Plus size={16} strokeWidth={2.25} />
          New deal
        </Button>
      }
    >
      {q.loading && !board && <BoardSkeleton />}

      {board && Object.values(board).every((col) => col.length === 0) && (
        <EmptyState
          icon={GitPullRequest}
          title="Empty pipeline"
          message="Add your first deal and it'll appear in the Lead column. Drag it right as it progresses — commission accrues automatically at Deposit paid."
          action={
            <Button onClick={() => setCreateOpen(true)} variant="primary" size="md">
              <Plus size={16} strokeWidth={2.25} />
              New deal
            </Button>
          }
        />
      )}

      {board && Object.values(board).some((col) => col.length > 0) && (
        <div className="-mx-4 overflow-x-auto pb-4 md:-mx-8">
          <div className="flex min-w-max gap-3 px-4 md:px-8">
            {DEAL_STAGES.map((stage) => (
              <StageColumn
                key={stage}
                stage={stage}
                deals={board[stage] ?? []}
                savingId={saving}
                onDrop={(dealId, fromStage) => move(dealId, fromStage, stage)}
              />
            ))}
          </div>
        </div>
      )}

      <CreateDealModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          setBoard(null); // reset optimistic; refetch on next render
          q.refetch();
        }}
      />
    </AppShell>
  );
}

// ----- Column ---------------------------------------------------------------

function StageColumn({
  stage,
  deals,
  savingId,
  onDrop,
}: {
  stage: DealStage;
  deals: DealRow[];
  savingId: string | null;
  onDrop: (dealId: string, fromStage: DealStage) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const totalValue = deals.reduce((sum, d) => sum + (d.dealValue ?? 0), 0);

  const isPivotal = stage === "deposit_paid";
  const isLost = stage === "lost";

  return (
    <div
      className={`flex w-72 shrink-0 flex-col rounded-xl border transition-colors ${
        dragOver
          ? "border-primary-light/60 bg-primary/[0.06]"
          : "border-white/[0.08] bg-cinema-elev"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const payload = e.dataTransfer.getData("application/x-deal");
        if (!payload) return;
        try {
          const parsed = JSON.parse(payload) as { id: string; fromStage: DealStage };
          onDrop(parsed.id, parsed.fromStage);
        } catch {
          /* noop */
        }
      }}
    >
      <div className="border-b border-white/[0.06] px-3 py-2.5">
        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.06em] text-white/55">
          <span className={isPivotal ? "text-emerald-300" : isLost ? "text-rose-300" : ""}>
            {dealStageLabel(stage)}
          </span>
          <span>{deals.length}</span>
        </div>
        {totalValue > 0 && (
          <p className="mt-1 text-[13px] text-white/70">{naira(totalValue)}</p>
        )}
      </div>

      <div className="flex-1 space-y-2 p-2">
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} saving={savingId === d.id} />
        ))}
        {deals.length === 0 && (
          <p className="px-2 py-8 text-center text-[12.5px] italic text-white/35">
            Drag a deal here
          </p>
        )}
      </div>
    </div>
  );
}

// ----- Card -----------------------------------------------------------------

function DealCard({ deal, saving }: { deal: DealRow; saving: boolean }) {
  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(
          "application/x-deal",
          JSON.stringify({ id: deal.id, fromStage: deal.stage }),
        );
        e.dataTransfer.effectAllowed = "move";
      }}
      className={`group cursor-grab rounded-lg border border-white/[0.08] bg-cinema-base p-3 transition-colors hover:border-white/[0.15] active:cursor-grabbing ${
        saving ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-1 text-[14px] font-medium text-white">{deal.prospectName}</p>
        {saving && <Loader2 size={13} className="mt-0.5 animate-spin text-white/45" />}
      </div>
      {deal.dealValue != null && (
        <p className="mt-1 text-[13px] text-white/70">{naira(deal.dealValue)}</p>
      )}
      {deal.commissionAmount != null && deal.commissionAmount > 0 && (
        <p className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] text-emerald-300/85">
          <MoveRight size={11} strokeWidth={2.25} />
          Commission {naira(deal.commissionAmount)}
        </p>
      )}
    </article>
  );
}

function BoardSkeleton() {
  return (
    <div className="-mx-4 overflow-x-auto pb-4 md:-mx-8">
      <div className="flex min-w-max gap-3 px-4 md:px-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-72 shrink-0 rounded-xl border border-white/[0.08] bg-cinema-elev">
            <div className="border-b border-white/[0.06] px-3 py-2.5">
              <div className="h-3 w-20 animate-pulse rounded bg-white/[0.06]" />
            </div>
            <div className="space-y-2 p-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-16 animate-pulse rounded-lg bg-white/[0.04]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
