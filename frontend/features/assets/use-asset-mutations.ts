import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Asset } from "@/shared/hooks/use-assets";
import { del, getApiErrorMessage, post, put } from "@/shared/lib/api";
import { invalidatePortfolioData } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

type AssetInput = components["schemas"]["AssetInDTO"];

export function useSaveAsset(assetId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AssetInput) =>
      assetId === undefined
        ? post("/api/assets", { body })
        : put("/api/assets/{asset_id}", { path: { asset_id: assetId }, body }),
    onSuccess: (asset) => {
      toast.success(`${asset.ticker} salvo.`);
      return invalidatePortfolioData(queryClient);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (asset: Asset) =>
      del("/api/assets/{asset_id}", { path: { asset_id: asset.id } }),
    onSuccess: (_, asset) => {
      toast.success(`${asset.ticker} apagado.`);
      return invalidatePortfolioData(queryClient);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
