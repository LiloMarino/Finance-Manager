import type { Asset } from "@/shared/hooks/use-assets";
import {
  type DecimalString,
  parseDecimalInput,
  toChartNumber,
  toDecimalInput,
  toDecimalString,
} from "@/types/decimal";
import type { components } from "@/types/openapi.generated";

type Targets = components["schemas"]["TargetsDTO"];
type TargetsInput = components["schemas"]["TargetsInDTO"];

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

/** As metas salvas como o editor as mostra. */
export function targetsDraft(targets: Targets): TargetsDraft {
  return {
    assets: Object.fromEntries(
      targets.assets.map((asset) => [asset.asset_id, toDecimalInput(asset.target)]),
    ),
    fixedIncome: toDecimalInput(targets.fixed_income_target),
    maxItem: toDecimalInput(targets.max_item_deviation),
    maxTotal: toDecimalInput(targets.max_total_deviation),
  };
}

/** As metas como o servidor as recebe: o que não foi digitado fica em zero. */
export function toTargetsInput(
  targets: TargetsDraft,
  chosen: Asset[],
  hasFixedIncome: boolean,
): TargetsInput {
  const percent = (value: string): DecimalString =>
    parseDecimalInput(value) ?? toDecimalString("0");
  return {
    assets: chosen.map((asset) => ({
      asset_id: asset.id,
      target: percent(targets.assets[asset.id] ?? ""),
    })),
    fixed_income_target: percent(hasFixedIncome ? targets.fixedIncome : ""),
    max_item_deviation: percent(targets.maxItem),
    max_total_deviation: percent(targets.maxTotal),
  };
}

// O percentual digitado como número, só para somar na tela; quem confere a soma exata é o
// servidor
export function typedPercent(value: string): number {
  const parsed = parseDecimalInput(value);
  return parsed === null ? 0 : toChartNumber(parsed);
}

/** A soma das metas digitadas, para o rótulo e a barra do editor. */
export function targetsSum(targets: TargetsDraft, assets: Asset[], hasFixedIncome: boolean) {
  const total = assets.reduce(
    (sum, asset) => sum + typedPercent(targets.assets[asset.id] ?? ""),
    0,
  );
  return hasFixedIncome ? total + typedPercent(targets.fixedIncome) : total;
}

/** A soma fecha 100%, a condição para salvar as metas. */
export function targetsComplete(sum: number) {
  return Math.abs(sum - 100) < 0.005;
}
