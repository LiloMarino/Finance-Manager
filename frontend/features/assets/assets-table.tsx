import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";

import { AssetFormDialog } from "@/features/assets/asset-form-dialog";
import { DeleteAssetDialog } from "@/features/assets/delete-asset-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type { Asset } from "@/shared/hooks/use-assets";
import { assetClassLabels } from "@/shared/lib/labels";

export function AssetsTable({ assets }: { assets: Asset[] }) {
  if (assets.length === 0) {
    return <p className="text-muted-foreground">Nenhum ativo cadastrado ainda.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Classe</TableHead>
          <TableHead>CNPJ</TableHead>
          <TableHead>Setor / Segmento</TableHead>
          <TableHead className="w-24" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.map((asset) => (
          <TableRow key={asset.id}>
            <TableCell className="font-medium">
              <Link to={`/assets/${asset.id}`} className="hover:underline">
                {asset.ticker}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{assetClassLabels[asset.asset_class]}</Badge>
            </TableCell>
            <TableCell>{asset.cnpj ?? "—"}</TableCell>
            <TableCell>
              {asset.sector ? `${asset.sector} / ${asset.segment}` : "—"}
            </TableCell>
            <TableCell className="text-right">
              <AssetFormDialog
                asset={asset}
                trigger={
                  <Button variant="ghost" size="icon-sm" aria-label={`Editar ${asset.ticker}`}>
                    <Pencil />
                  </Button>
                }
              />
              <DeleteAssetDialog asset={asset} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
