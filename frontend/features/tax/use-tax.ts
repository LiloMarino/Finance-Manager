import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { del, get, getApiErrorMessage, put } from "@/shared/lib/api";
import { invalidateKeys, queryKeys } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

export type MonthlyTax = components["schemas"]["MonthlyTaxDTO"];
export type PeriodReport = components["schemas"]["PeriodReportDTO"];
export type IrpfReport = components["schemas"]["IrpfReportDTO"];
type DarfPaymentInput = components["schemas"]["DarfPaymentInDTO"];

export function useTaxMonths() {
  return useQuery({
    queryKey: [...queryKeys.tax, "months"],
    queryFn: () => get("/api/tax/months"),
  });
}

/** Sem `month`, o recorte é o ano inteiro. */
export function useTaxPeriod(year: number, month?: number) {
  return useQuery({
    queryKey: [...queryKeys.tax, "period", year, month ?? null],
    queryFn: () => get("/api/tax/period", { query: { year, month } }),
  });
}

export function useIrpfReport(year: number) {
  return useQuery({
    queryKey: [...queryKeys.tax, "irpf", year],
    queryFn: () => get("/api/tax/irpf/{year}", { path: { year } }),
  });
}

function useWrite<T, R>(write: (input: T) => Promise<R>, success: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: write,
    onSuccess: () => {
      toast.success(success);
      return invalidateKeys(queryClient, [queryKeys.tax]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useSaveDarfPayment(month: MonthlyTax) {
  return useWrite(
    (body: DarfPaymentInput) =>
      put("/api/tax/darf/{year}/{month}/payment", {
        path: { year: month.year, month: month.month },
        body,
      }),
    "Pagamento registrado.",
  );
}

export function useDeleteDarfPayment(month: MonthlyTax) {
  return useWrite(
    () =>
      del("/api/tax/darf/{year}/{month}/payment", {
        path: { year: month.year, month: month.month },
      }),
    "Pagamento removido.",
  );
}
