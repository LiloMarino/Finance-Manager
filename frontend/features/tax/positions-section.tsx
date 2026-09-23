import { Fragment } from "react";
import { Link } from "react-router-dom";

import type { PeriodReport } from "@/features/tax/use-tax";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { assetClassLabels, assetClasses } from "@/shared/lib/labels";
import { formatBRL, formatQuantity } from "@/types/decimal";

interface PositionsSectionProps {
  title: string;
  positions: PeriodReport["opening"];
}

export function PositionsSection({ title, positions }: PositionsSectionProps) {
  const groups = assetClasses
    .map((assetClass) => ({
      assetClass,
      items: positions.filter((position) => position.asset_class === assetClass),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma posição.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ativo</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Preço médio</TableHead>
                <TableHead className="text-right">Custo total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <Fragment key={group.assetClass}>
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="bg-muted/40 text-muted-foreground text-xs font-semibold uppercase"
                    >
                      {assetClassLabels[group.assetClass]}
                    </TableCell>
                  </TableRow>
                  {group.items.map((position) => (
                    <TableRow key={position.asset_id}>
                      <TableCell className="font-medium">
                        <Link to={`/assets/${position.asset_id}`} className="hover:underline">
                          {position.ticker}
                        </Link>
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
                </Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
