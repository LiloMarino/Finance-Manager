import type { QueryClient, QueryKey } from "@tanstack/react-query";

export const queryKeys = {
  assets: ["assets"] as const,
  operations: ["operations"] as const,
  portfolio: ["portfolio"] as const,
  // Debaixo da carteira: toda escrita que a invalida muda também o passado dela
  performance: ["portfolio", "performance"] as const,
  evolution: ["portfolio", "evolution"] as const,
  monthlyReturns: ["portfolio", "monthly-returns"] as const,
  income: ["portfolio", "income"] as const,
  prices: ["market", "prices"] as const,
  indexes: ["market", "indexes"] as const,
  // Debaixo das séries: o refresh delas muda o ponto de partida da projeção
  currentRates: ["market", "indexes", "current"] as const,
  simulation: ["simulation"] as const,
  correlation: ["market", "correlation"] as const,
  fixedIncome: ["fixed-income"] as const,
  tax: ["tax"] as const,
  dataHealth: ["data-health"] as const,
  sectors: ["sectors"] as const,
};

/** Invalida toda query cuja chave começa por uma das `keys`. */
export function invalidateKeys(
  queryClient: QueryClient,
  keys: readonly QueryKey[],
): Promise<void> {
  return queryClient.invalidateQueries({
    predicate: ({ queryKey }) =>
      keys.some((key) => key.every((part, index) => queryKey[index] === part)),
  });
}

/** Todo provento muda a rentabilidade da carteira e o relatório do IRPF. */
export function invalidateIncomeData(queryClient: QueryClient): Promise<void> {
  return invalidateKeys(queryClient, [queryKeys.portfolio, queryKeys.tax]);
}

/** Toda escrita em ativo ou operação muda a carteira, as listas, os ativos a cotar,
a apuração fiscal e os problemas de dado. */
export function invalidatePortfolioData(queryClient: QueryClient): Promise<void> {
  return invalidateKeys(queryClient, [
    queryKeys.assets,
    queryKeys.operations,
    queryKeys.portfolio,
    queryKeys.prices,
    queryKeys.tax,
    queryKeys.dataHealth,
  ]);
}
