import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Sector, Segment } from "@/shared/hooks/use-sectors";
import { del, getApiErrorMessage, post, put } from "@/shared/lib/api";
import { invalidateKeys, queryKeys } from "@/shared/lib/query-keys";

// O nome do setor e do segmento aparece no ativo, na Carteira e no painel
function useWrite<T, R>(write: (input: T) => Promise<R>, success: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: write,
    onSuccess: () => {
      toast.success(success);
      return invalidateKeys(queryClient, [
        queryKeys.sectors,
        queryKeys.assets,
        queryKeys.portfolio,
        queryKeys.dataHealth,
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useCreateSector() {
  return useWrite(
    (name: string) => post("/api/sectors", { body: { name } }),
    "Setor criado.",
  );
}

export function useRenameSector(sector: Sector) {
  return useWrite(
    (name: string) =>
      put("/api/sectors/{sector_id}", { path: { sector_id: sector.id }, body: { name } }),
    "Setor renomeado.",
  );
}

export function useDeleteSector(sector: Sector) {
  return useWrite<void, void>(
    () => del("/api/sectors/{sector_id}", { path: { sector_id: sector.id } }),
    `${sector.name} apagado.`,
  );
}

export function useCreateSegment(sector: Sector) {
  return useWrite(
    (name: string) =>
      post("/api/sectors/{sector_id}/segments", {
        path: { sector_id: sector.id },
        body: { name },
      }),
    "Segmento criado.",
  );
}

export function useRenameSegment(segment: Segment) {
  return useWrite(
    (name: string) =>
      put("/api/sectors/segments/{segment_id}", {
        path: { segment_id: segment.id },
        body: { name },
      }),
    "Segmento renomeado.",
  );
}

export function useDeleteSegment(segment: Segment) {
  return useWrite<void, void>(
    () =>
      del("/api/sectors/segments/{segment_id}", { path: { segment_id: segment.id } }),
    `${segment.name} apagado.`,
  );
}
