import type { GradingCriterion } from "@/src/domain";

function newCriterionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `crit_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createDraftCriterion(): GradingCriterion {
  return {
    id: newCriterionId(),
    title: "",
    description: "",
    mark: 0,
  };
}
