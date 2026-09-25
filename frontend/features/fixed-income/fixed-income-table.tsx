import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";

import { DeleteFixedIncomeDialog } from "@/features/fixed-income/delete-fixed-income-dialog";
import { FixedIncomeFormDialog } from "@/features/fixed-income/fixed-income-form-dialog";
import type { FixedIncome } from "@/features/fixed-income/use-fixed-income";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatDate } from "@/shared/lib/format";
import { describeRate } from "@/shared/lib/labels";
import { formatBRL } from "@/types/decimal";

export function FixedIncomeTable({ investments }: { investments: FixedIncome[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Rentabilidade</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead className="text-right">Aplicado</TableHead>
          <TableHead className="text-right">Valor bruto</TableHead>
          <TableHead className="text-right">IR estimado</TableHead>
          <TableHead className="text-right">Valor líquido</TableHead>
          <TableHead className="w-24" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {investments.map((investment) => (
          <TableRow key={investment.id}>
            <TableCell className="font-medium">
              <Link to={`/fixed-income/${investment.id}`} className="hover:underline">
                {investment.label}
              </Link>
            </TableCell>
            <TableCell>{describeRate(investment.indexer, investment.rate)}</TableCell>
            <TableCell className="tabular-nums">
              {investment.maturity_date ? formatDate(investment.maturity_date) : "—"}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatBRL(investment.invested)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatBRL(investment.gross_value)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatBRL(investment.estimated_tax)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatBRL(investment.net_value)}
            </TableCell>
            <TableCell className="text-right">
              <FixedIncomeFormDialog
                investment={investment}
                trigger={
                  <Button variant="ghost" size="icon-sm" aria-label="Editar título">
                    <Pencil />
                  </Button>
                }
              />
              <DeleteFixedIncomeDialog investment={investment} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
