import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Subportfolio } from "@/shared/hooks/use-subportfolios";
import { del, getApiErrorMessage, post, put } from "@/shared/lib/api";
import { invalidateKeys, queryKeys } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

type MembersInput = components["schemas"]["MembersInDTO"];

// A filiação aparece no ativo, no título e em toda visão da carteira
function useWrite<T, R>(write: (input: T) => Promise<R>, success: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: write,
    onSuccess: () => {
      toast.success(success);
      return invalidateKeys(queryClient, [
        queryKeys.subportfolios,
        queryKeys.assets,
        queryKeys.fixedIncome,
        queryKeys.portfolio,
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useCreateSubportfolio() {
  return useWrite(
    (name: string) => post("/api/subportfolios", { body: { name } }),
    "Subcarteira criada.",
  );
}

export function useRenameSubportfolio(subportfolio: Subportfolio) {
  return useWrite(
    (name: string) =>
      put("/api/subportfolios/{subportfolio_id}", {
        path: { subportfolio_id: subportfolio.id },
        body: { name },
      }),
    "Subcarteira renomeada.",
  );
}

export function useDeleteSubportfolio(subportfolio: Subportfolio) {
  return useWrite<void, void>(
    () =>
      del("/api/subportfolios/{subportfolio_id}", {
        path: { subportfolio_id: subportfolio.id },
      }),
    `${subportfolio.name} apagada.`,
  );
}

export function useSetMembers(subportfolio: Subportfolio) {
  return useWrite(
    (body: MembersInput) =>
      put("/api/subportfolios/{subportfolio_id}/members", {
        path: { subportfolio_id: subportfolio.id },
        body,
      }),
    "Subcarteira atualizada.",
  );
}
