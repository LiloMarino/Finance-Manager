import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { get, getApiErrorMessage, post } from "@/shared/lib/api";
import type { Suggestion } from "@/shared/lib/classification";
import { invalidateKeys, invalidatePortfolioData, queryKeys } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

export type PendingItem = components["schemas"]["PendingItemDTO"];
type AcceptItem = components["schemas"]["AcceptItemDTO"];

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

/** Os ativos sem segmento, cada um com o que o Yahoo diz dele e a sugestão. */
export function usePendingClassification() {
  return useQuery({
    queryKey: [...queryKeys.classification, "pending"],
    queryFn: () => get("/api/classification/pending"),
  });
}

/** Grava o segmento de cada ativo, tudo numa transação. */
export function useAcceptClassification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: AcceptItem[]) => post("/api/classification/accept", { body: { items } }),
    onSuccess: (_, items) => {
      toast.success(
        items.length === 1 ? "Ativo classificado." : `${items.length} ativos classificados.`,
      );
      // A contagem de ativos por segmento mora nos setores
      return Promise.all([
        invalidatePortfolioData(queryClient),
        invalidateKeys(queryClient, [queryKeys.sectors]),
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
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
      const sector = sectorId ?? (await post("/api/sectors", { body: { name: sectorName } })).id;
      return post("/api/sectors/{sector_id}/segments", {
        path: { sector_id: sector },
        body: { name: segmentName },
      });
    },
    onSuccess: (segment) => toast.success(`Segmento ${segment.name} criado.`),
    onError: (error) => toast.error(getApiErrorMessage(error)),
    // O setor novo fica mesmo quando o segmento falha
    onSettled: () => invalidateKeys(queryClient, [queryKeys.sectors, queryKeys.classification]),
  });
}

/** O segmento a criar que a sugestão já descreve inteiro: o nome dele e o setor, existente
ou novo. Nulo quando a sugestão aponta para um segmento existente ou não diz o setor. */
export function suggestionDraft(suggestion: Suggestion): SegmentDraft | null {
  const { segment_id, sector_id, new_sector_name, new_segment_name } = suggestion;
  if (segment_id !== null || !new_segment_name) return null;
  if (sector_id === null && !new_sector_name) return null;
  return { sectorId: sector_id, sectorName: new_sector_name ?? "", segmentName: new_segment_name };
}
