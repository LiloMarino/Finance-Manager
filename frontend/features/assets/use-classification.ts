import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { get, getApiErrorMessage, post } from "@/shared/lib/api";
import { invalidateKeys, queryKeys } from "@/shared/lib/query-keys";

// Quatro letras ou dígitos e o número da classe: o ticker da B3 no lote padrão
const B3_TICKER = /^[A-Z0-9]{4}\d{1,2}$/;

/** A sugestão de setor e segmento para o ticker digitado. A fonte só é consultada
quando o texto para de mudar e tem forma de ticker. */
export function useClassificationSuggestion(ticker: string) {
  const query = useDebouncedValue(ticker.trim(), 500);

  return useQuery({
    queryKey: [...queryKeys.classification, "suggestion", query],
    queryFn: () => get("/api/classification/suggestion", { query: { ticker: query } }),
    enabled: B3_TICKER.test(query),
    staleTime: Infinity,
    retry: false,
  });
}

export interface SegmentDraft {
  /** Setor que já existe; nulo cria um com `sectorName`. */
  sectorId: number | null;
  sectorName: string;
  segmentName: string;
}

/** Cria o segmento, e antes o setor quando ele é novo. Devolve o segmento criado. */
export function useCreateClassification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sectorId, sectorName, segmentName }: SegmentDraft) => {
      const sector =
        sectorId ?? (await post("/api/sectors", { body: { name: sectorName } })).id;
      return post("/api/sectors/{sector_id}/segments", {
        path: { sector_id: sector },
        body: { name: segmentName },
      });
    },
    onSuccess: (segment) => toast.success(`Segmento ${segment.name} criado.`),
    onError: (error) => toast.error(getApiErrorMessage(error)),
    // O setor novo fica mesmo quando o segmento falha
    onSettled: () =>
      invalidateKeys(queryClient, [queryKeys.sectors, queryKeys.classification]),
  });
}
