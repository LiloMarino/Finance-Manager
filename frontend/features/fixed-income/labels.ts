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
