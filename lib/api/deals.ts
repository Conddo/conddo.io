// Real Estate — deals module. Kanban pipeline for property sales/rentals.
// Backed by /api/v1/deals.

import { api } from "./client";

export type DealStage =
  | "lead"
  | "viewing_scheduled"
  | "viewed"
  | "offer_made"
  | "deposit_paid"
  | "documentation"
  | "signed"
  | "closed"
  | "lost";

/** Canonical column order for the kanban — matches the Nigerian cadence
 *  in real-estate.yml. `deposit_paid` is the pivotal moment. */
export const DEAL_STAGES: DealStage[] = [
  "lead",
  "viewing_scheduled",
  "viewed",
  "offer_made",
  "deposit_paid",
  "documentation",
  "signed",
  "closed",
  "lost",
];

const STAGE_LABELS: Record<DealStage, string> = {
  lead: "Lead",
  viewing_scheduled: "Viewing scheduled",
  viewed: "Viewed",
  offer_made: "Offer made",
  deposit_paid: "Deposit paid",
  documentation: "Documentation",
  signed: "Signed",
  closed: "Closed",
  lost: "Lost",
};

const STAGE_TONES: Record<DealStage, "success" | "warning" | "info" | "danger" | "neutral"> = {
  lead: "neutral",
  viewing_scheduled: "info",
  viewed: "info",
  offer_made: "warning",
  deposit_paid: "success",
  documentation: "info",
  signed: "success",
  closed: "success",
  lost: "danger",
};

export const dealStageLabel = (s: DealStage) => STAGE_LABELS[s] ?? s;
export const dealStageTone = (s: DealStage) => STAGE_TONES[s] ?? "neutral";

export type DealRow = {
  id: string;
  prospectName: string;
  propertyId: string | null;
  stage: DealStage;
  dealValue: number | null;
  commissionAmount: number | null;
  primaryAgentId: string | null;
  stageChangedAt: string;
};

export type DealDetail = {
  id: string;
  propertyId: string | null;
  customerId: string | null;
  prospectName: string;
  prospectPhone: string | null;
  prospectEmail: string | null;
  stage: DealStage;
  stageChangedAt: string;
  dealValue: number | null;
  currency: string;
  commissionPct: number | null;
  commissionAmount: number | null;
  depositAmount: number | null;
  depositPaidAt: string | null;
  primaryAgentId: string | null;
  introducerAgentId: string | null;
  notes: string | null;
  lostReason: string | null;
  expectedCloseAt: string | null;
};

export type CreateDealInput = {
  prospectName: string;
  prospectPhone?: string;
  prospectEmail?: string;
  propertyId?: string;
  customerId?: string;
  dealValue?: number;
  commissionPct?: number;
  depositAmount?: number;
  primaryAgentId?: string;
  introducerAgentId?: string;
  notes?: string;
  expectedCloseAt?: string;
};

export type PipelineRow = {
  stage: DealStage;
  count: number;
  pipelineValue: number;
};

// ----- API ------------------------------------------------------------------

export const dealsApi = {
  board: async () => {
    const { data } = await api.get<Record<DealStage, DealRow[]>>("/deals/board");
    return data;
  },
  pipeline: async () => {
    const { data } = await api.get<PipelineRow[]>("/deals/pipeline");
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get<DealDetail>(`/deals/${id}`);
    return data;
  },
  create: async (input: CreateDealInput) => {
    const { data } = await api.post<DealDetail>("/deals", input);
    return data;
  },
  moveStage: async (id: string, stage: DealStage, reason?: string) => {
    const { data } = await api.patch<DealDetail>(`/deals/${id}/stage`, { stage, reason });
    return data;
  },
};

export const dealsBoardQuery = () =>
  api.get<Record<DealStage, DealRow[]>>("/deals/board");
