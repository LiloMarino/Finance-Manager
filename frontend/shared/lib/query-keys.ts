import type { QueryClient, QueryKey } from "@tanstack/react-query";

export const queryKeys = {
  assets: ["assets"] as const,
  operations: ["operations"] as const,
  portfolio: ["portfolio"] as const,
  // Debaixo da carteira: toda escrita que a invalida muda também o passado dela
  performance: ["portfolio", "performance"] as const,
  evolution: ["portfolio", "evolution"] as const,
  prices: ["market", "prices"] as const,
  indexes: ["market", "indexes"] as const,
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
