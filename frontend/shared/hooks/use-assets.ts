import { useQuery } from "@tanstack/react-query";

import { get } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { components } from "@/types/openapi.generated";

export type Asset = components["schemas"]["AssetDTO"];

export function useAssets() {
  return useQuery({
    queryKey: queryKeys.assets,
    queryFn: () => get("/api/assets"),
  });
}

export function useAsset(assetId: number) {
  return useQuery({
    queryKey: [...queryKeys.assets, assetId],
    queryFn: () => get("/api/assets/{asset_id}", { path: { asset_id: assetId } }),
  });
}
