import { Link } from "react-router-dom";

import type { Portfolio } from "@/features/portfolio/use-portfolio";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { describeRate } from "@/shared/lib/labels";
import { formatBRL, formatPercent } from "@/types/decimal";

export function FixedIncomeHoldings({
  holdings,
}: {
  holdings: Portfolio["fixed_income"];
}) {
  if (holdings.length === 0) {
    return <p className="text-muted-foreground">Nenhum título de renda fixa aplicado.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Rentabilidade</TableHead>
          <TableHead className="text-right">Aplicado</TableHead>
          <TableHead className="text-right">Valor bruto</TableHead>
          <TableHead className="text-right">IR estimado</TableHead>
          <TableHead className="text-right">% da carteira</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {holdings.map((holding) => (
          <TableRow key={holding.investment_id}>
            <TableCell className="font-medium">
              <Link
                to={`/fixed-income/${holding.investment_id}`}
                className="hover:underline"
              >
                {holding.label}
              </Link>
            </TableCell>
            <TableCell>{describeRate(holding.indexer, holding.rate)}</TableCell>
            <TableCell className="text-right tabular-nums">
              {formatBRL(holding.invested)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatBRL(holding.gross_value)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatBRL(holding.estimated_tax)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatPercent(holding.share)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
