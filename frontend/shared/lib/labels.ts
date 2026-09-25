import { type DecimalString, formatQuantity } from "@/types/decimal";
import type { components } from "@/types/openapi.generated";

export type AssetClass = components["schemas"]["AssetClass"];
export type OperationType = components["schemas"]["OperationType"];
export type Indexer = components["schemas"]["Indexer"];
export type FixedIncomeType = components["schemas"]["FixedIncomeType"];

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

export const fixedIncomeTypeLabels: Record<FixedIncomeType, string> = {
  cdb: "CDB",
  rdb: "RDB",
  lc: "LC",
  lci: "LCI",
  lca: "LCA",
  cri: "CRI",
  cra: "CRA",
  debenture: "Debênture",
  incentivized_debenture: "Debênture incentivada",
  treasury_selic: "Tesouro Selic",
  treasury_prefixed: "Tesouro Prefixado",
  treasury_ipca: "Tesouro IPCA+",
};

// O Tesouro tem o indexador no nome; os outros tipos aceitam qualquer um
export const treasuryIndexers: Partial<Record<FixedIncomeType, Indexer>> = {
  treasury_selic: "selic",
  treasury_prefixed: "prefixed",
  treasury_ipca: "ipca",
};

// A taxa do título significa uma coisa por indexador
const rateDescriptions: Record<Indexer, (rate: string) => string> = {
  cdi: (rate) => `${rate}% do CDI`,
  selic: (rate) => (rate.startsWith("-") ? `Selic − ${rate.slice(1)}% a.a.` : `Selic + ${rate}% a.a.`),
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

export function isFixedIncomeType(value: string): value is FixedIncomeType {
  return value in fixedIncomeTypeLabels;
}

export const assetClasses = Object.keys(assetClassLabels).filter(isAssetClass);
export const indexers = Object.keys(indexerLabels).filter(isIndexer);
export const fixedIncomeTypes = Object.keys(fixedIncomeTypeLabels).filter(isFixedIncomeType);
