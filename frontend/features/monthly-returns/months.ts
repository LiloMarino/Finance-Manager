import { type DecimalString, decimalSign } from "@/types/decimal";

export const monthLabels = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function monthLabel(year: number, month: number): string {
  return `${monthLabels[month - 1] ?? month}/${year}`;
}

/** A cor do texto pelo sinal: alta, baixa ou neutro no zero. */
export function signClass(value: DecimalString): string {
  const sign = decimalSign(value);
  return sign > 0 ? "text-gain" : sign < 0 ? "text-loss" : "";
}
