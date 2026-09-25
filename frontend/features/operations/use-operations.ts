import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { del, get, getApiErrorMessage, post, put } from "@/shared/lib/api";
import { invalidatePortfolioData, queryKeys } from "@/shared/lib/query-keys";
import type { components, paths } from "@/types/openapi.generated";

export type Operation = components["schemas"]["OperationDTO"];
export type OperationFilters = NonNullable<
  paths["/api/operations"]["get"]["parameters"]["query"]
>;
type OperationInput = components["schemas"]["OperationInDTO"];

export function useOperations(filters: OperationFilters = {}) {
  return useQuery({
    queryKey: [...queryKeys.operations, filters],
    queryFn: () => get("/api/operations", { query: filters }),
  });
}

function useWrite<T, R>(write: (input: T) => Promise<R>, success: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: write,
    onSuccess: () => {
      toast.success(success);
      return invalidatePortfolioData(queryClient);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useSaveOperation(operationId?: number) {
  return useWrite(
    (body: OperationInput) =>
      operationId === undefined
        ? post("/api/operations", { body })
        : put("/api/operations/{operation_id}", {
            path: { operation_id: operationId },
            body,
          }),
    "Operação salva.",
  );
}

export function useDeleteOperation() {
  return useWrite(
    (operation: Operation) =>
      del("/api/operations/{operation_id}", {
        path: { operation_id: operation.id },
      }),
    "Operação apagada.",
  );
}
