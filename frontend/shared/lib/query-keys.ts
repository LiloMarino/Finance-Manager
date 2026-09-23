import type { QueryClient } from "@tanstack/react-query";

export const queryKeys = {
  assets: ["assets"] as const,
  operations: ["operations"] as const,
  positions: ["portfolio", "positions"] as const,
  prices: ["market", "prices"] as const,
};

/** Toda escrita em ativo ou operação muda posição, listas e os ativos a cotar. */
export function invalidatePortfolioData(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({
    predicate: ({ queryKey }) =>
      [queryKeys.assets, queryKeys.operations, queryKeys.positions, queryKeys.prices]
        .some((key) => key.every((part, index) => queryKey[index] === part)),
  });
}
