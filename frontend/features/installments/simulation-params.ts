import type { InvestmentTermsInput } from "@/shared/lib/investment-terms";
import { isFixedIncomeType, isIndexer } from "@/shared/lib/labels";
import { type DecimalString, parseDecimalInput, parseSignedDecimalInput } from "@/types/decimal";
import type { components } from "@/types/openapi.generated";

export type InstallmentMode = components["schemas"]["InstallmentMode"];
type Investment = components["schemas"]["InvestmentInDTO"];

/** A simulação que a URL descreve, sem a projeção nem o dia da decisão. */
export interface SimulationParams {
  mode: InstallmentMode;
  amount: DecimalString;
  installments: number;
  first_due_date: string;
  cash_discount: DecimalString | null;
  investment: Investment;
}

export const modeLabels: Record<InstallmentMode, string> = {
  purchase: "Compra",
  prepayment: "Adiantar a fatura",
};

export function isInstallmentMode(value: string): value is InstallmentMode {
  return value in modeLabels;
}

// O investimento mais comum é o ponto de partida
export const defaultInvestment: InvestmentTermsInput = {
  product_type: "cdb",
  indexer: "cdi",
  rate: "100",
};

/** Nula enquanto a URL não descreve uma simulação completa. */
export function readSimulation(params: URLSearchParams): SimulationParams | null {
  const mode = params.get("mode") ?? "purchase";
  const amount = parseDecimalInput(params.get("amount") ?? "");
  const installments = Number(params.get("n"));
  const firstDue = params.get("first_due");
  const discountText = params.get("discount");
  const discount = discountText === null ? null : parseDecimalInput(discountText);
  const type = params.get("type") ?? defaultInvestment.product_type;
  const indexer = params.get("indexer") ?? defaultInvestment.indexer;
  const rate = parseSignedDecimalInput(params.get("rate") ?? defaultInvestment.rate);
  if (
    !isInstallmentMode(mode) ||
    !amount ||
    !Number.isInteger(installments) ||
    installments < 1 ||
    !firstDue ||
    (discountText !== null && !discount) ||
    !isFixedIncomeType(type) ||
    !isIndexer(indexer) ||
    !rate
  ) {
    return null;
  }
  return {
    mode,
    amount,
    installments,
    first_due_date: firstDue,
    cash_discount: discount,
    investment: { product_type: type, indexer, rate },
  };
}

export function writeSimulation(
  params: URLSearchParams,
  simulation: SimulationParams,
): URLSearchParams {
  params.set("mode", simulation.mode);
  params.set("amount", simulation.amount);
  params.set("n", String(simulation.installments));
  params.set("first_due", simulation.first_due_date);
  if (simulation.cash_discount === null) params.delete("discount");
  else params.set("discount", simulation.cash_discount);
  params.set("type", simulation.investment.product_type);
  params.set("indexer", simulation.investment.indexer);
  params.set("rate", simulation.investment.rate);
  return params;
}
