import type { CurrentRates } from "@/shared/hooks/use-current-rates";
import { type DecimalString, parseSignedDecimalInput } from "@/types/decimal";
import type { components } from "@/types/openapi.generated";

export type Projection = components["schemas"]["ProjectionInDTO"];

export const projectionKeys = ["cdi", "selic", "ipca"] as const;

function readRate(params: URLSearchParams, key: string): DecimalString | null {
  const value = params.get(key);
  return value === null ? null : parseSignedDecimalInput(value);
}

export type ProjectionDraft = Record<(typeof projectionKeys)[number], DecimalString | null>;

/** A projeção editada fica na URL; o que não foi editado parte do último valor real.
Cada taxa é nula quando a série não tem dado no cache nem valor digitado. */
export function projectionDraft(
  params: URLSearchParams,
  current: CurrentRates,
): ProjectionDraft {
  return {
    cdi: readRate(params, "cdi") ?? current.cdi,
    selic: readRate(params, "selic") ?? current.selic,
    ipca: readRate(params, "ipca") ?? current.ipca,
  };
}

/** A projeção completa, ou nula enquanto falta alguma taxa. */
export function completeProjection({ cdi, selic, ipca }: ProjectionDraft): Projection | null {
  return cdi && selic && ipca ? { cdi, selic, ipca } : null;
}

export function isProjectionEdited(params: URLSearchParams): boolean {
  return projectionKeys.some((key) => params.has(key));
}

/** Grava só o que difere do último valor real; sem projeção, volta a ele. */
export function writeProjection(
  params: URLSearchParams,
  projection: Projection | null,
  current: CurrentRates,
): URLSearchParams {
  for (const key of projectionKeys) {
    const value = projection?.[key];
    if (value === undefined || value === current[key]) params.delete(key);
    else params.set(key, value);
  }
  return params;
}
