import type { components } from "@/types/openapi.generated";

export type MovementType = components["schemas"]["FixedIncomeMovementType"];

export const movementTypeLabels: Record<MovementType, string> = {
  application: "Aplicação",
  redemption: "Resgate",
};

export function isMovementType(value: string): value is MovementType {
  return value in movementTypeLabels;
}

export const movementTypes = Object.keys(movementTypeLabels).filter(isMovementType);

export type RedemptionOrder = components["schemas"]["RedemptionOrder"];

export const redemptionOrderLabels: Record<RedemptionOrder, string> = {
  oldest_first: "Das aplicações mais antigas",
  newest_first: "Das aplicações mais novas",
};

export function isRedemptionOrder(value: string): value is RedemptionOrder {
  return value in redemptionOrderLabels;
}

export const redemptionOrders = Object.keys(redemptionOrderLabels).filter(isRedemptionOrder);
