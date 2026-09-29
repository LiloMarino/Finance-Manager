export interface Period {
  year: number;
  month: number;
}

export const taxTabs = ["monthly", "yearly", "all", "irpf"] as const;
export type TaxTab = (typeof taxTabs)[number];

export function isTaxTab(value: string): value is TaxTab {
  return taxTabs.some((tab) => tab === value);
}

export interface TaxParams extends Period {
  tab: TaxTab;
}

/** A aba e o período que a URL descreve; o que falta ou é inválido vira a aba
Mensal e o mês de hoje. */
export function readTaxParams(params: URLSearchParams, today: Date): TaxParams {
  const tab = params.get("tab") ?? "";
  const year = Number(params.get("year"));
  const month = Number(params.get("month"));
  return {
    tab: isTaxTab(tab) ? tab : "monthly",
    year: Number.isInteger(year) && year >= 1900 && year <= 9999 ? year : today.getFullYear(),
    month: Number.isInteger(month) && month >= 1 && month <= 12 ? month : today.getMonth() + 1,
  };
}

export function writeTaxParams(params: URLSearchParams, next: TaxParams): URLSearchParams {
  params.set("tab", next.tab);
  params.set("year", String(next.year));
  params.set("month", String(next.month));
  return params;
}
