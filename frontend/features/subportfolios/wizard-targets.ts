import type { Asset } from "@/shared/hooks/use-assets";
import { parseDecimalInput, toChartNumber } from "@/types/decimal";

/** O texto digitado de cada meta e dos limites, em percentual e pontos percentuais. */
export interface TargetsDraft {
  assets: Record<number, string>;
  fixedIncome: string;
  maxItem: string;
  maxTotal: string;
}

export const emptyTargets: TargetsDraft = {
  assets: {},
  fixedIncome: "",
  maxItem: "5",
  maxTotal: "10",
};

// O percentual digitado como número, só para somar na tela; quem confere a soma exata é o
// servidor
export function typedPercent(value: string): number {
  const parsed = parseDecimalInput(value);
  return parsed === null ? 0 : toChartNumber(parsed);
}

/** A soma das metas digitadas, para o rótulo e a barra do passo. */
export function targetsSum(targets: TargetsDraft, assets: Asset[], hasFixedIncome: boolean) {
  const total = assets.reduce(
    (sum, asset) => sum + typedPercent(targets.assets[asset.id] ?? ""),
    0,
  );
  return hasFixedIncome ? total + typedPercent(targets.fixedIncome) : total;
}
