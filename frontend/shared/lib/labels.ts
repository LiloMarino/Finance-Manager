import { type DecimalString, formatQuantity } from "@/types/decimal";
import type { components } from "@/types/openapi.generated";

export type AssetClass = components["schemas"]["AssetClass"];
export type OperationType = components["schemas"]["OperationType"];
export type Indexer = components["schemas"]["Indexer"];

export const assetClassLabels: Record<AssetClass, string> = {
  stock: "Ação",
  fii: "FII",
  etf: "ETF",
  bdr: "BDR",
};

export const operationTypeLabels: Record<OperationType, string> = {
  buy: "Compra",
  sell: "Venda",
  bonus: "Bonificação",
  split: "Desdobro",
  reverse_split: "Grupamento",
};

export const indexerLabels: Record<Indexer, string> = {
  cdi: "CDI",
  selic: "Selic",
  ipca: "IPCA",
  prefixed: "Prefixado",
};

// A taxa do título significa uma coisa por indexador
const rateDescriptions: Record<Indexer, (rate: string) => string> = {
  cdi: (rate) => `${rate}% do CDI`,
  selic: (rate) => `${rate}% da Selic`,
  ipca: (rate) => `IPCA + ${rate}% a.a.`,
  prefixed: (rate) => `${rate}% a.a.`,
};

export function describeRate(indexer: Indexer, rate: DecimalString): string {
  return rateDescriptions[indexer](formatQuantity(rate));
}

export function isAssetClass(value: string): value is AssetClass {
  return value in assetClassLabels;
}

export function isOperationType(value: string): value is OperationType {
  return value in operationTypeLabels;
}

export function isIndexer(value: string): value is Indexer {
  return value in indexerLabels;
}

export const assetClasses = Object.keys(assetClassLabels).filter(isAssetClass);
export const indexers = Object.keys(indexerLabels).filter(isIndexer);
