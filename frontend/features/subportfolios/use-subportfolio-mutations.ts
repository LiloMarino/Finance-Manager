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

type SubportfolioInput = components["schemas"]["SubportfolioInDTO"];
type TargetsInput = components["schemas"]["TargetsInDTO"];

interface NewSubportfolio {
  identity: SubportfolioInput;
  members: MembersInput;
  /** Sem metas, a subcarteira nasce sem desvio nem divisão de aporte. */
  targets: TargetsInput | null;
}

/** Cria a subcarteira e, em seguida, a filiação e as metas: os dois passos finais precisam
do id que a criação devolve. */
export function useCreateSubportfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ identity, members, targets }: NewSubportfolio) => {
      const created = await post("/api/subportfolios", { body: identity });
      const path = { subportfolio_id: created.id };
      await put("/api/subportfolios/{subportfolio_id}/members", { path, body: members });
      if (targets) await put("/api/rebalance/{subportfolio_id}/targets", { path, body: targets });
      return created;
    },
    onSuccess: (created) => {
      toast.success(`${created.name} criada.`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
    // A criação pode ter ido até o meio: as telas se atualizam com o que ficou gravado
    onSettled: () =>
      invalidateKeys(queryClient, [
        queryKeys.subportfolios,
        queryKeys.assets,
        queryKeys.fixedIncome,
        queryKeys.portfolio,
        queryKeys.dataHealth,
      ]),
  });
}

export function useRenameSubportfolio(subportfolio: Subportfolio) {
  return useWrite(
    (name: string) =>
      put("/api/subportfolios/{subportfolio_id}", {
        path: { subportfolio_id: subportfolio.id },
        body: { name, icon: subportfolio.icon, color: subportfolio.color },
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
