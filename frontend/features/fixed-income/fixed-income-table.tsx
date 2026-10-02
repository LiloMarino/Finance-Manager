import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";

import { DeleteFixedIncomeDialog } from "@/features/fixed-income/delete-fixed-income-dialog";
import { FixedIncomeFormDialog } from "@/features/fixed-income/fixed-income-form-dialog";
import type { FixedIncomeSummary } from "@/features/fixed-income/use-fixed-income";
import { Money } from "@/shared/components/money";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type { FixedIncome } from "@/shared/hooks/use-fixed-income-list";
import { formatDate } from "@/shared/lib/format";
import { describeRate, fixedIncomeTypeLabels } from "@/shared/lib/labels";

type Totals = FixedIncomeSummary["total"];

function TotalsCells({ totals }: { totals: Totals }) {
  return (
    <>
      <TableCell className="text-right">
        <Money value={totals.invested} />
      </TableCell>
      <TableCell className="text-right">
        <Money value={totals.gross_value} />
      </TableCell>
      <TableCell className="text-right">
        <Money value={totals.estimated_tax} />
      </TableCell>
      <TableCell className="text-right">
        <Money value={totals.net_value} />
      </TableCell>
      <TableCell />
    </>
  );
}

function InvestmentRow({ investment }: { investment: FixedIncome }) {
  return (
    <TableRow to={`/fixed-income/${investment.id}`}>
      <TableCell>
        <Link
          to={`/fixed-income/${investment.id}`}
          className="text-foreground font-medium hover:underline"
        >
          {investment.label}
        </Link>
      </TableCell>
      <TableCell variant="muted">{describeRate(investment.indexer, investment.rate)}</TableCell>
      <TableCell>
        {investment.maturity_date ? formatDate(investment.maturity_date) : "—"}
        {investment.matured && (
          <Badge variant="outline" className="ml-2">
            Vencido
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Money value={investment.invested} />
      </TableCell>
      <TableCell className="text-right">
        <Money value={investment.gross_value} />
      </TableCell>
      <TableCell className="text-right">
        <Money value={investment.estimated_tax} />
      </TableCell>
      <TableCell className="text-right">
        <Money value={investment.net_value} />
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-0.5">
          <FixedIncomeFormDialog
            investment={investment}
            trigger={
              <Button variant="ghost" size="icon-sm" aria-label="Editar título">
                <Pencil />
              </Button>
            }
          />
          <DeleteFixedIncomeDialog investment={investment} />
        </div>
      </TableCell>
    </TableRow>
  );
}

interface FixedIncomeTableProps {
  investments: FixedIncome[];
  summary: FixedIncomeSummary;
}

/** Os títulos agrupados por tipo: cada grupo com a soma dele e, no fim, o total. Os
vencidos aparecem no grupo deles e ficam fora das somas. */
export function FixedIncomeTable({ investments, summary }: FixedIncomeTableProps) {
  const matured = investments.filter((item) => item.matured);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Títulos</CardTitle>
        <CardAction>
          <CardDescription>
            Clique numa linha para abrir o título e as movimentações
          </CardDescription>
        </CardAction>
      </CardHeader>
      <CardContent data-flush>
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
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.by_type.map((group) => [
              // Cabeçalho do tipo, com a soma dele
              <TableRow key={group.product_type} variant="group">
                <TableCell variant="group" colSpan={3}>
                  {fixedIncomeTypeLabels[group.product_type]} · {group.count}{" "}
                  {group.count === 1 ? "título" : "títulos"}
                </TableCell>
                <TotalsCells totals={group} />
              </TableRow>,
              ...investments
                .filter((item) => item.product_type === group.product_type && !item.matured)
                .map((investment) => <InvestmentRow key={investment.id} investment={investment} />),
            ])}
            {matured.length > 0 && [
              <TableRow key="matured" variant="group">
                <TableCell variant="group" colSpan={8}>
                  Vencidos · resgatados para o saldo
                </TableCell>
              </TableRow>,
              ...matured.map((investment) => (
                <InvestmentRow key={investment.id} investment={investment} />
              )),
            ]}
            <TableRow variant="total">
              <TableCell colSpan={3}>Total</TableCell>
              <TotalsCells totals={summary.total} />
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
