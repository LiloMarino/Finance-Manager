import { Link } from "react-router-dom";

import type { Position } from "@/features/portfolio/use-positions";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { assetClassLabels } from "@/shared/lib/labels";
import { formatBRL, formatQuantity } from "@/types/decimal";

export function PositionsTable({ positions }: { positions: Position[] }) {
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
          <TableHead className="text-right">Custo total</TableHead>
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
              {formatBRL(position.total_cost)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
