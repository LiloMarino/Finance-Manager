import { Pencil } from "lucide-react";
import { useState } from "react";

import { AssetFormDialog } from "@/features/assets/asset-form-dialog";
import { DeleteAssetDialog } from "@/features/assets/delete-asset-dialog";
import { usePortfolio } from "@/features/portfolio/use-portfolio";
import { AssetClassBadge } from "@/shared/components/asset-class-badge";
import { TickerLabel } from "@/shared/components/ticker-label";
import { Button } from "@/shared/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import type { Asset } from "@/shared/hooks/use-assets";
import { useSubportfolios } from "@/shared/hooks/use-subportfolios";
import { type AssetClass, assetClassLabels, assetClasses } from "@/shared/lib/labels";

type Scope = "held" | "all";

// Nulo são todas as classes
const classItems = [
  { value: null, label: "Todas as classes" },
  ...assetClasses.map((assetClass) => ({ value: assetClass, label: assetClassLabels[assetClass] })),
];

/** O cadastro: filtros por classe e por estar ou não em carteira, e uma linha por ativo. */
export function AssetsTable({ assets }: { assets: Asset[] }) {
  const [assetClass, setAssetClass] = useState<AssetClass | null>(null);
  const [scope, setScope] = useState<Scope>("held");
  const portfolio = usePortfolio({});
  const { data: subportfolios = [] } = useSubportfolios();

  if (assets.length === 0) {
    return <p className="text-muted-foreground">Nenhum ativo cadastrado ainda.</p>;
  }

  const held = new Set(portfolio.data?.positions.map((position) => position.asset_id));
  const shown = assets.filter(
    (asset) =>
      (assetClass === null || asset.asset_class === assetClass) &&
      (scope === "all" || held.has(asset.id)),
  );
  const heldCount = assets.filter((asset) => held.has(asset.id)).length;

  return (
    <>
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          items={classItems}
          value={assetClass}
          onValueChange={(value) => setAssetClass(value)}
        >
          <SelectTrigger size="sm" className="w-44" aria-label="Filtrar por classe">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {classItems.map((item) => (
              <SelectItem key={item.label} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ToggleGroup
          variant="segmented"
          size="sm"
          aria-label="Mostrar"
          value={[scope]}
          onValueChange={([next]) => {
            if (next === "held" || next === "all") setScope(next);
          }}
        >
          <ToggleGroupItem value="held">Em carteira</ToggleGroupItem>
          <ToggleGroupItem value="all">Todos</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Cadastro */}
      <Card>
        <CardHeader>
          <CardTitle>Cadastro</CardTitle>
          <CardAction>
            <span className="text-caption text-muted-foreground">
              {heldCount} em carteira, de {assets.length} cadastrados
            </span>
          </CardAction>
        </CardHeader>
        <CardContent data-flush>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ativo</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead>Setor / segmento</TableHead>
                <TableHead>Subcarteira</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((asset) => (
                <TableRow key={asset.id} to={`/assets/${asset.id}`}>
                  <TableCell>
                    <TickerLabel
                      ticker={asset.ticker}
                      category={asset.asset_class}
                      to={`/assets/${asset.id}`}
                    />
                  </TableCell>
                  <TableCell>
                    <AssetClassBadge assetClass={asset.asset_class} />
                  </TableCell>
                  <TableCell variant={asset.sector ? "default" : "muted"}>
                    {asset.sector ? `${asset.sector} / ${asset.segment}` : "Sem classificação"}
                  </TableCell>
                  <TableCell variant="muted">
                    {subportfolios.find((item) => item.id === asset.subportfolio_id)?.name ?? "—"}
                  </TableCell>
                  <TableCell variant="muted">{asset.cnpj ?? "sem CNPJ"}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-0.5">
                      <AssetFormDialog
                        asset={asset}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Editar ${asset.ticker}`}
                          >
                            <Pencil />
                          </Button>
                        }
                      />
                      <DeleteAssetDialog asset={asset} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
