// Daily Business Brief — the AI-generated one-paragraph morning briefing that
// greets every owner on dashboard open. Backed by GET /api/v1/me/brief.

import { api } from "./client";

export type DailyBrief = {
  state: "ready" | "verify-email";
  headline: string;
  body: string;
  generatedAt?: string | null;
};

export async function getDailyBrief(): Promise<DailyBrief> {
  const { data } = await api.get<DailyBrief>("/me/brief");
  return data;
}

/** As a Result for useApiQuery. */
export const briefQuery = () => api.get<DailyBrief>("/me/brief");
