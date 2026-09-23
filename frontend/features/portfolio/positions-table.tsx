import { Link } from "react-router-dom";

import type { Portfolio } from "@/features/portfolio/use-portfolio";
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
import {
  formatBRL,
  formatPercent,
  formatQuantity,
  formatSignedBRL,
  formatSignedPercent,
} from "@/types/decimal";

export function PositionsTable({ positions }: { positions: Portfolio["positions"] }) {
  if (positions.length === 0) {
    return (
      <p className="text-muted-foreground">
        Nenhuma posição aberta. Registre ou importe operações para começar.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ativo</TableHead>
          <TableHead>Classe</TableHead>
          <TableHead className="text-right">Quantidade</TableHead>
          <TableHead className="text-right">Preço médio</TableHead>
          <TableHead className="text-right">Preço atual</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="text-right">% da carteira</TableHead>
          <TableHead className="text-right">Resultado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {positions.map((position) => (
          <TableRow key={position.asset_id}>
            <TableCell className="font-medium">
              <Link to={`/assets/${position.asset_id}`} className="hover:underline">
                {position.ticker}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{assetClassLabels[position.asset_class]}</Badge>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatQuantity(position.quantity)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatBRL(position.average_price)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {position.price ? (
                <span title={position.price_date ? formatDate(position.price_date) : undefined}>
                  {formatBRL(position.price)}
                </span>
              ) : (
                <span className="text-muted-foreground">sem cotação</span>
              )}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatBRL(position.market_value)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatPercent(position.share)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatSignedBRL(position.unrealized_result)}
              {position.unrealized_return && (
                <span className="text-muted-foreground block text-xs">
                  {formatSignedPercent(position.unrealized_return)}
                </span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
