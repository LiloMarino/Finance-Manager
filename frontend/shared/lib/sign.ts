import { type DecimalString, decimalSign } from "@/types/decimal";

/** O tom pelo sinal: alta, baixa ou neutro no zero. É a variante de cor das células. */
export function signTone(value: DecimalString): "gain" | "loss" | "default" {
  const sign = decimalSign(value);
  return sign > 0 ? "gain" : sign < 0 ? "loss" : "default";
}

/** A cor do texto pelo sinal, para o que não é componente do design system. */
export function signClass(value: DecimalString): string {
  const tone = signTone(value);
  return tone === "gain" ? "text-gain" : tone === "loss" ? "text-loss" : "";
}
