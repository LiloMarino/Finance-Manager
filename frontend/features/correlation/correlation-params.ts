import type { paths } from "@/types/openapi.generated";

export type CorrelationQuery = NonNullable<
  paths["/api/correlation"]["get"]["parameters"]["query"]
>;
export type CorrelationWindow = CorrelationQuery["window"];
export type Benchmark = "ibov" | "cdi";

export const windowLabels: Record<CorrelationWindow, string> = {
  "6m": "6 meses",
  "1y": "1 ano",
  "3y": "3 anos",
  "5y": "5 anos",
};

export const benchmarkLabels: Record<Benchmark, string> = { ibov: "IBOV", cdi: "CDI" };

export function isCorrelationWindow(value: string): value is CorrelationWindow {
  return value in windowLabels;
}

export function isBenchmark(value: string): value is Benchmark {
  return value in benchmarkLabels;
}

/** Nula enquanto a URL não tem o que comparar. */
export function readCorrelation(params: URLSearchParams): CorrelationQuery | null {
  const first = params.get("first");
  const second = params.get("second");
  const benchmark = params.get("benchmark");
  const window = params.get("window") ?? "1y";
  if (!first || !isCorrelationWindow(window)) return null;
  if (benchmark && isBenchmark(benchmark)) return { first, benchmark, window };
  if (second) return { first, second, window };
  return null;
}

export function writeCorrelation(
  params: URLSearchParams,
  query: CorrelationQuery,
): URLSearchParams {
  params.set("first", query.first);
  params.set("window", query.window);
  if (query.benchmark) {
    params.set("benchmark", query.benchmark);
    params.delete("second");
  } else if (query.second) {
    params.set("second", query.second);
    params.delete("benchmark");
  }
  return params;
}
