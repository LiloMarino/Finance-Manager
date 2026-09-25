import { type DecimalString, decimalSign } from "@/types/decimal";

/** A cor do texto pelo sinal: alta, baixa ou neutro no zero. */
export function signClass(value: DecimalString): string {
  const sign = decimalSign(value);
  return sign > 0 ? "text-gain" : sign < 0 ? "text-loss" : "";
}
