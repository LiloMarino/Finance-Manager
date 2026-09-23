import type { QueryClient, QueryKey } from "@tanstack/react-query";

export const queryKeys = {
  assets: ["assets"] as const,
  operations: ["operations"] as const,
  portfolio: ["portfolio"] as const,
  prices: ["market", "prices"] as const,
  indexes: ["market", "indexes"] as const,
  fixedIncome: ["fixed-income"] as const,
  tax: ["tax"] as const,
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

/** Toda escrita em ativo ou operação muda a carteira, as listas, os ativos a cotar
e a apuração fiscal. */
export function invalidatePortfolioData(queryClient: QueryClient): Promise<void> {
  return invalidateKeys(queryClient, [
    queryKeys.assets,
    queryKeys.operations,
    queryKeys.portfolio,
    queryKeys.prices,
    queryKeys.tax,
  ]);
}
