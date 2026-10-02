import type { InvestmentTermsInput } from "@/shared/lib/investment-terms";
import { isFixedIncomeType, isIndexer } from "@/shared/lib/labels";
import { isoDate } from "@/shared/lib/period";
import { projectionKeys } from "@/shared/lib/projection";
import { parseDecimalText, parseSignedDecimalText } from "@/types/decimal";
import type { components } from "@/types/openapi.generated";

type Investment = components["schemas"]["InvestmentInDTO"];
type BankDiscount = components["schemas"]["AdvanceInDTO"]["bank_discount"];

/** À vista × parcelado com investimento, sem a projeção nem o dia da decisão. */
export type PurchaseParams = Omit<
  components["schemas"]["InstallmentsInDTO"],
  "start_date" | "projection"
>;

/** Parcelar e adiantar × à vista. */
export type CashOrAdvanceParams = components["schemas"]["CashOrAdvanceInDTO"];

/** Adiantar × deixar aplicado, sem a projeção nem o dia da decisão. */
export type AdvanceParams = Omit<
  components["schemas"]["AdvanceInDTO"],
  "start_date" | "projection"
>;

export const MAX_INSTALLMENTS = 60;

/** O mesmo dia do mês seguinte: o vencimento mais comum da primeira parcela. */
export function nextMonth(): string {
  const today = new Date();
  return isoDate(new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()));
}

export const installmentsTabs = ["buy", "vista", "pre"] as const;
export type InstallmentsTab = (typeof installmentsTabs)[number];

export function isInstallmentsTab(value: string | null): value is InstallmentsTab {
  return installmentsTabs.some((tab) => tab === value);
}

export function readTab(params: URLSearchParams): InstallmentsTab {
  const tab = params.get("tab");
  return isInstallmentsTab(tab) ? tab : "buy";
}

/** Os campos de cada aba têm sentido próprio, e só a projeção segue para a outra. */
export function writeTab(params: URLSearchParams, tab: InstallmentsTab): URLSearchParams {
  const next = new URLSearchParams();
  for (const key of projectionKeys) {
    const value = params.get(key);
    if (value !== null) next.set(key, value);
  }
  if (tab !== "buy") next.set("tab", tab);
  return next;
}

// O investimento mais comum é o ponto de partida
export const defaultInvestment: InvestmentTermsInput = {
  product_type: "cdb",
  indexer: "cdi",
  rate: "100",
};

function readInvestment(params: URLSearchParams): Investment | null {
  const type = params.get("type") ?? defaultInvestment.product_type;
  const indexer = params.get("indexer") ?? defaultInvestment.indexer;
  const rate = parseSignedDecimalText(params.get("rate") ?? defaultInvestment.rate);
  if (!isFixedIncomeType(type) || !isIndexer(indexer) || !rate) return null;
  return { product_type: type, indexer, rate };
}

function writeInvestment(params: URLSearchParams, investment: Investment) {
  params.set("type", investment.product_type);
  params.set("indexer", investment.indexer);
  params.set("rate", investment.rate);
}

function readCount(params: URLSearchParams): number | null {
  const count = Number(params.get("n"));
  return Number.isInteger(count) && count >= 1 ? count : null;
}

/** Nula enquanto a URL não descreve uma simulação completa. */
export function readPurchase(params: URLSearchParams): PurchaseParams | null {
  const amount = parseDecimalText(params.get("amount") ?? "");
  const installments = readCount(params);
  const firstDue = params.get("first_due");
  const discountText = params.get("discount");
  const discount = discountText === null ? null : parseDecimalText(discountText);
  const investment = readInvestment(params);
  if (
    !amount ||
    !installments ||
    !firstDue ||
    (discountText !== null && !discount) ||
    !investment
  ) {
    return null;
  }
  return {
    amount,
    installments,
    first_due_date: firstDue,
    cash_discount: discount,
    investment,
  };
}

export function writePurchase(params: URLSearchParams, purchase: PurchaseParams): URLSearchParams {
  params.set("amount", purchase.amount);
  params.set("n", String(purchase.installments));
  params.set("first_due", purchase.first_due_date);
  if (purchase.cash_discount) params.set("discount", purchase.cash_discount);
  else params.delete("discount");
  writeInvestment(params, purchase.investment);
  return params;
}

export function readCashOrAdvance(params: URLSearchParams): CashOrAdvanceParams | null {
  const price = parseDecimalText(params.get("price") ?? "");
  const installments = readCount(params);
  const firstDue = params.get("first_due");
  const discount = parseDecimalText(params.get("discount") ?? "");
  const rate = parseDecimalText(params.get("bank_rate") ?? "");
  if (!price || !installments || !firstDue || !discount || !rate) return null;
  return {
    price,
    installments,
    first_due_date: firstDue,
    cash_discount: discount,
    monthly_rate: rate,
  };
}

export function writeCashOrAdvance(
  params: URLSearchParams,
  value: CashOrAdvanceParams,
): URLSearchParams {
  params.set("price", value.price);
  params.set("n", String(value.installments));
  params.set("first_due", value.first_due_date);
  params.set("discount", value.cash_discount);
  params.set("bank_rate", value.monthly_rate);
  return params;
}

function readBankDiscount(params: URLSearchParams): BankDiscount | null {
  const rate = parseDecimalText(params.get("bank_rate") ?? "");
  if (rate) return { kind: "rate", monthly_rate: rate };
  const total = parseDecimalText(params.get("bank_total") ?? "");
  return total ? { kind: "total", bank_total: total } : null;
}

// As parcelas escolhidas viajam como posições separadas por vírgula; sem a chave,
// o backend escolhe as em que o desconto vence
function readChosen(params: URLSearchParams): number[] | null {
  const text = params.get("pick");
  if (text === null) return null;
  return text
    .split(",")
    .filter(Boolean)
    .map(Number)
    .filter((position) => Number.isInteger(position));
}

export function readAdvance(params: URLSearchParams): AdvanceParams | null {
  const amount = parseDecimalText(params.get("amount") ?? "");
  const installments = readCount(params);
  const nextDue = params.get("next_due");
  const bankDiscount = readBankDiscount(params);
  const investment = readInvestment(params);
  if (!amount || !installments || !nextDue || !bankDiscount || !investment) return null;
  return {
    amount,
    installments,
    next_due_date: nextDue,
    bank_discount: bankDiscount,
    chosen: readChosen(params),
    investment,
  };
}

/** Uma conta nova volta à escolha do backend. */
export function writeAdvance(params: URLSearchParams, value: AdvanceParams): URLSearchParams {
  params.set("amount", value.amount);
  params.set("n", String(value.installments));
  params.set("next_due", value.next_due_date);
  if (value.bank_discount.kind === "rate") {
    params.set("bank_rate", value.bank_discount.monthly_rate);
    params.delete("bank_total");
  } else {
    params.set("bank_total", value.bank_discount.bank_total);
    params.delete("bank_rate");
  }
  writeInvestment(params, value.investment);
  params.delete("pick");
  return params;
}

export function writeChosen(params: URLSearchParams, positions: number[]): URLSearchParams {
  params.set("pick", positions.join(","));
  return params;
}
