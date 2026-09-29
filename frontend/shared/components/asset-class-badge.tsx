import { Badge } from "@/shared/components/ui/badge";
import { type AssetClass, assetClassLabels } from "@/shared/lib/labels";

/** A classe do ativo na cor da categoria dela, a mesma do gráfico da Carteira. */
export function AssetClassBadge({ assetClass }: { assetClass: AssetClass }) {
  return <Badge variant={assetClass}>{assetClassLabels[assetClass]}</Badge>;
}
