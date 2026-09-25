import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage, post } from "@/shared/lib/api";
import { invalidatePortfolioData } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

export type ImportPreview = components["schemas"]["ImportPreviewDTO"];
export type PreviewRow = ImportPreview["rows"][number];
export type IncomePreviewRow = ImportPreview["income_rows"][number];
export type ImportStatus = PreviewRow["status"];
type ImportConfirm = components["schemas"]["ImportConfirmDTO"];

export function usePreviewImport() {
  return useMutation({
    mutationFn: (files: File[]) => post("/api/import/preview", { form: { files } }),
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useConfirmImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ImportConfirm) => post("/api/import/confirm", { body }),
    onSuccess: (result) => {
      const assets = result.assets_created.length
        ? ` Ativos novos: ${result.assets_created.join(", ")}.`
        : "";
      toast.success(
        `${result.created} operações e ${result.income_created} proventos importados; ` +
          `${result.skipped + result.income_skipped} já existiam.${assets}`,
      );
      return invalidatePortfolioData(queryClient);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
