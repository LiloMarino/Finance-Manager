import { monthLabel } from "@/shared/lib/months";

const correlationFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

/** A correlação com duas casas e o sinal: "+0,78", "−0,04". Vem em float: é estatística. */
export function formatCorrelation(value: number): string {
  return correlationFormatter.format(value);
}

/** `2026-03-15` vira "Mar/2026", o rótulo dos eixos de tempo. */
export function formatMonth(day: string): string {
  const [year, month] = day.split("-");
  return monthLabel(Number(year), Number(month));
}
