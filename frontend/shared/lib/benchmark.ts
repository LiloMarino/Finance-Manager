import type { ChartConfig } from "@/shared/components/ui/chart";
import type { components } from "@/types/openapi.generated";

type IndexSeries = components["schemas"]["IndexSeries"];

export const benchmarks = ["cdi", "ipca", "ibov"] as const satisfies readonly IndexSeries[];

export type Benchmark = (typeof benchmarks)[number];

export function isBenchmark(value: string): value is Benchmark {
  return benchmarks.some((benchmark) => benchmark === value);
}

// A carteira é a linha na cor do texto; cada referência tem a cor própria, fora da
// paleta das categorias, e é tracejada quando vira linha
export const benchmarkConfig = {
  cdi: { label: "CDI", color: "var(--ref-cdi)" },
  ipca: { label: "IPCA", color: "var(--ref-ipca)" },
  ibov: { label: "IBOV", color: "var(--ref-ibov)" },
} satisfies ChartConfig & Record<Benchmark, { label: string; color: string }>;
