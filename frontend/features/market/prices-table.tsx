import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatDate } from "@/shared/lib/format";
import { assetClassLabels } from "@/shared/lib/labels";
import { formatBRL } from "@/types/decimal";
import type { components } from "@/types/openapi.generated";

type AssetPrice = components["schemas"]["AssetPriceDTO"];

interface PricesTableProps {
  prices: AssetPrice[];
}

export function PricesTable({ prices }: PricesTableProps) {
  if (prices.length === 0) {
    return (
      <p className="text-muted-foreground">
        Nenhum ativo com operação cadastrada ainda.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead>Classe</TableHead>
          <TableHead className="text-right">Fechamento</TableHead>
          <TableHead className="text-right">Data</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {prices.map((price) => (
          <TableRow key={price.asset_id}>
            <TableCell className="font-medium">{price.ticker}</TableCell>
            <TableCell>
              <Badge variant="secondary">
                {assetClassLabels[price.asset_class]}
              </Badge>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {price.close ? formatBRL(price.close) : "—"}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {price.price_date ? formatDate(price.price_date) : "sem cotação"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
