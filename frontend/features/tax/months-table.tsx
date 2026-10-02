import { DarfPaymentDialog } from "@/features/tax/darf-payment-dialog";
import { darfStatusLabels, darfStatusVariants } from "@/features/tax/labels";
import type { MonthlyTax } from "@/features/tax/use-tax";
import { Money } from "@/shared/components/money";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatDate } from "@/shared/lib/format";
import { monthLabel } from "@/shared/lib/months";
import { signTone } from "@/shared/lib/sign";

interface MonthsTableProps {
  months: MonthlyTax[];
  onSelect: (month: MonthlyTax) => void;
}

/** Os meses com venda, do mais novo para o mais antigo; clicar no mês abre a apuração. */
export function MonthsTable({ months, onSelect }: MonthsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meses com venda</CardTitle>
        <CardAction>
          <span className="text-caption text-muted-foreground">
            Clique num mês para abrir a apuração
          </span>
        </CardAction>
      </CardHeader>
      <CardContent data-flush>
        {months.length === 0 ? (
          <p className="text-caption text-muted-foreground px-5">
            Nenhum mês com venda no período.
          </p>
        ) : (
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
                <TableHead className="w-40" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {months.map((month) => (
                <TableRow key={`${month.year}-${month.month}`}>
                  <TableCell className="font-medium">
                    <button
                      type="button"
                      className="hover:underline"
                      onClick={() => onSelect(month)}
                    >
                      {monthLabel(month.year, month.month)}
                    </button>
                  </TableCell>
                  <TableCell variant={signTone(month.gross_result)} className="text-right">
                    <Money value={month.gross_result} signed />
                  </TableCell>
                  <TableCell className="text-right">
                    <Money value={month.compensated} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Money value={month.taxable} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Money value={month.tax} />
                  </TableCell>
                  <TableCell className="text-right">
                    {month.darf_amount ? <Money value={month.darf_amount} /> : "—"}
                  </TableCell>
                  <TableCell variant="muted">
                    {month.due_date ? formatDate(month.due_date) : "—"}
                  </TableCell>
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
        )}
      </CardContent>
    </Card>
  );
}
