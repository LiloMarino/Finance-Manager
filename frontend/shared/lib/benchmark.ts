import type { ChartConfig } from "@/shared/components/ui/chart";
import type { components } from "@/types/openapi.generated";

type IndexSeries = components["schemas"]["IndexSeries"];

export const benchmarks = ["cdi", "ipca", "ibov"] as const satisfies readonly IndexSeries[];

export type Benchmark = (typeof benchmarks)[number];

export function isBenchmark(value: string): value is Benchmark {
  return benchmarks.some((benchmark) => benchmark === value);
}

// A carteira fica com o --chart-1; cada referência tem o seu slot na sequência
export const benchmarkConfig = {
  cdi: { label: "CDI", color: "var(--chart-2)" },
  ipca: { label: "IPCA", color: "var(--chart-3)" },
  ibov: { label: "IBOV", color: "var(--chart-4)" },
} satisfies ChartConfig & Record<Benchmark, { label: string; color: string }>;
