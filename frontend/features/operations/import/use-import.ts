import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage, post } from "@/shared/lib/api";
import { invalidatePortfolioData } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

export type ImportPreview = components["schemas"]["ImportPreviewDTO"];
export type PreviewRow = ImportPreview["rows"][number];
type ImportConfirm = components["schemas"]["ImportConfirmDTO"];

export function usePreviewImport() {
  return useMutation({
    mutationFn: (files: File[]) =>
      post("/api/operations/import/preview", { form: { files } }),
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useConfirmImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ImportConfirm) =>
      post("/api/operations/import/confirm", { body }),
    onSuccess: (result) => {
      const assets = result.assets_created.length
        ? ` Ativos novos: ${result.assets_created.join(", ")}.`
        : "";
      toast.success(
        `${result.created} operações importadas, ${result.skipped} já existiam.${assets}`,
      );
      return invalidatePortfolioData(queryClient);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
