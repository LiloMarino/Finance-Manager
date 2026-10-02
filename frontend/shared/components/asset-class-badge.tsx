import { ColorSwatch } from "@/shared/components/color-swatch";
import { Badge } from "@/shared/components/ui/badge";
import { type AssetClass, assetClassLabels } from "@/shared/lib/labels";
import { portfolioCategoryConfig } from "@/shared/lib/portfolio-category";

/** A classe do ativo num badge neutro, com o ponto na cor da categoria dela. */
export function AssetClassBadge({ assetClass }: { assetClass: AssetClass }) {
  return (
    <Badge variant="outline">
      <ColorSwatch color={portfolioCategoryConfig[assetClass].color} />
      {assetClassLabels[assetClass]}
    </Badge>
  );
}
