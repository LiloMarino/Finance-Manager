import { DarfPaymentDialog } from "@/features/tax/darf-payment-dialog";
import { darfStatusLabels, darfStatusVariants, formatMonth } from "@/features/tax/labels";
import type { MonthlyTax } from "@/features/tax/use-tax";
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
import { formatBRL, formatSignedBRL } from "@/types/decimal";

interface MonthsTableProps {
  months: MonthlyTax[];
  onSelect?: (month: MonthlyTax) => void;
}

export function MonthsTable({ months, onSelect }: MonthsTableProps) {
  if (months.length === 0) {
    return <p className="text-muted-foreground">Nenhum mês apurado no período.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mês</TableHead>
          <TableHead className="text-right">Resultado</TableHead>
          <TableHead className="text-right">Compensado</TableHead>
          <TableHead className="text-right">Tributável</TableHead>
          <TableHead className="text-right">Imposto</TableHead>
          <TableHead className="text-right">DARF</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead>Situação</TableHead>
          <TableHead className="w-36" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {months.map((month) => (
          <TableRow key={`${month.year}-${month.month}`}>
            <TableCell className="font-medium capitalize">
              {onSelect ? (
                <button
                  type="button"
                  className="capitalize hover:underline"
                  onClick={() => onSelect(month)}
                >
                  {formatMonth(month.year, month.month)}
                </button>
              ) : (
                formatMonth(month.year, month.month)
              )}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatSignedBRL(month.gross_result)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatBRL(month.compensated)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatBRL(month.taxable)}
            </TableCell>
            <TableCell className="text-right tabular-nums">{formatBRL(month.tax)}</TableCell>
            <TableCell className="text-right tabular-nums">
              {month.darf_amount ? formatBRL(month.darf_amount) : "—"}
            </TableCell>
            <TableCell>{month.due_date ? formatDate(month.due_date) : "—"}</TableCell>
            <TableCell>
              <Badge variant={darfStatusVariants[month.status]}>
                {darfStatusLabels[month.status]}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {(month.darf_amount || month.payment) && <DarfPaymentDialog month={month} />}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
