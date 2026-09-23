import type { components } from "@/types/openapi.generated";

export type AssetClass = components["schemas"]["AssetClass"];
export type OperationType = components["schemas"]["OperationType"];

export const assetClassLabels: Record<AssetClass, string> = {
  stock: "Ação",
  fii: "FII",
  etf: "ETF",
  bdr: "BDR",
  fixed_income: "Renda fixa",
};

export const operationTypeLabels: Record<OperationType, string> = {
  buy: "Compra",
  sell: "Venda",
  bonus: "Bonificação",
  split: "Desdobro",
  reverse_split: "Grupamento",
  transfer_in: "Transferência (entrada)",
  transfer_out: "Transferência (saída)",
};

export function isAssetClass(value: string): value is AssetClass {
  return value in assetClassLabels;
}

export function isOperationType(value: string): value is OperationType {
  return value in operationTypeLabels;
}

export const assetClasses = Object.keys(assetClassLabels).filter(isAssetClass);
