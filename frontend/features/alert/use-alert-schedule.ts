import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { del, get, getApiErrorMessage, post, put } from "@/shared/lib/api";
import { invalidateKeys, queryKeys } from "@/shared/lib/query-keys";

export function useAlertSchedule() {
  return useQuery({
    queryKey: queryKeys.alertSchedule,
    queryFn: () => get("/api/alert/schedule"),
  });
}

function useWrite<T, R>(write: (input: T) => Promise<R>, success: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: write,
    onSuccess: () => {
      toast.success(success);
      return invalidateKeys(queryClient, [queryKeys.alertSchedule]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useSaveSchedule() {
  return useWrite(
    (time: string) => put("/api/alert/schedule", { body: { time } }),
    "Alerta agendado.",
  );
}

export function useRemoveSchedule() {
  return useWrite<void, void>(() => del("/api/alert/schedule"), "Alerta removido.");
}

export function useRunAlert() {
  return useWrite<void, void>(
    () => post("/api/alert/run"),
    "Alerta rodando: a janela aparece se houver algo a avisar.",
  );
}
