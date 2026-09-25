import type { components } from "@/types/openapi.generated";

export type CorrelationWindow = components["schemas"]["CorrelationWindow"];
export type Benchmark = "IBOV" | "CDI";

export const MAX_SYMBOLS = 12;

export const windowLabels: Record<CorrelationWindow, string> = {
  "6m": "6 meses",
  "1y": "1 ano",
  "3y": "3 anos",
  "5y": "5 anos",
};

// As referências entram na lista pelo nome, como os tickers
export const benchmarks: Benchmark[] = ["IBOV", "CDI"];

export function isCorrelationWindow(value: string): value is CorrelationWindow {
  return value in windowLabels;
}

export function isBenchmark(value: string): value is Benchmark {
  return value === "IBOV" || value === "CDI";
}

/** O que a tela compara: os itens da matriz, a janela e o par aberto embaixo. */
export interface CorrelationState {
  symbols: string[];
  window: CorrelationWindow;
  pair: [string, string] | null;
}

function list(value: string | null): string[] {
  const items = (value ?? "")
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
  return [...new Set(items)];
}

export function readCorrelation(params: URLSearchParams): CorrelationState {
  const symbols = list(params.get("symbols")).slice(0, MAX_SYMBOLS);
  const window = params.get("window") ?? "1y";
  const [first, second] = list(params.get("pair"));
  // O par aberto é um dos da matriz; sem ele, o primeiro par da lista
  const pair: [string, string] | null =
    first && second && symbols.includes(first) && symbols.includes(second)
      ? [first, second]
      : symbols.length >= 2 && symbols[0] && symbols[1]
        ? [symbols[0], symbols[1]]
        : null;
  return {
    symbols,
    window: isCorrelationWindow(window) ? window : "1y",
    pair,
  };
}

export function writeSymbols(
  params: URLSearchParams,
  symbols: string[],
  window: CorrelationWindow,
): URLSearchParams {
  params.set("symbols", symbols.join(","));
  params.set("window", window);
  params.delete("pair");
  return params;
}

export function writePair(params: URLSearchParams, pair: [string, string]): URLSearchParams {
  params.set("pair", pair.join(","));
  return params;
}
