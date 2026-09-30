import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { get, getApiErrorMessage, post } from "@/shared/lib/api";
import { invalidateKeys, invalidatePortfolioData, queryKeys } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

export type PendingClassification = components["schemas"]["PendingItemDTO"];
type AcceptItem = components["schemas"]["AcceptItemDTO"];

/** A sugestão de cada ativo em carteira sem segmento. */
export function usePendingClassifications() {
  return useQuery({
    queryKey: [...queryKeys.classification, "pending"],
    queryFn: () => get("/api/classification/pending"),
  });
}

export function useAcceptClassifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: AcceptItem[]) => post("/api/classification/accept", { body: { items } }),
    onSuccess: async (_, items) => {
      toast.success(
        items.length === 1 ? "1 ativo classificado." : `${items.length} ativos classificados.`,
      );
      // O segmento ganha ativos: a contagem dele na tela Setores muda
      await invalidateKeys(queryClient, [queryKeys.sectors]);
      return invalidatePortfolioData(queryClient);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
