import { DarfPaymentDialog } from "@/features/tax/darf-payment-dialog";
import {
  darfStatusLabels,
  darfStatusVariants,
  describeStatus,
  lossPoolLabels,
  tradeTypeLabels,
} from "@/features/tax/labels";
import type { MonthlyTax } from "@/features/tax/use-tax";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { assetClassLabels } from "@/shared/lib/labels";
import { formatBRL, formatPercent, formatSignedBRL, isZero } from "@/types/decimal";

export function DarfCard({ month }: { month: MonthlyTax }) {
  const summary = [
    { label: "Resultado bruto", value: formatSignedBRL(month.gross_result) },
    { label: "Lucro tributável", value: formatBRL(month.taxable) },
    { label: "Imposto do mês", value: formatBRL(month.tax) },
    { label: "DARF", value: month.darf_amount ? formatBRL(month.darf_amount) : "—" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <CardTitle>DARF</CardTitle>
          <Badge variant={darfStatusVariants[month.status]}>
            {darfStatusLabels[month.status]}
          </Badge>
        </div>
        {(month.darf_amount || month.payment) && <DarfPaymentDialog month={month} />}
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="text-sm">{describeStatus(month)}</p>

        <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          {summary.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {!(isZero(month.carried_before) && isZero(month.carried_after)) && (
          <p className="text-muted-foreground text-sm">
            Carregado abaixo de R$ 10,00: {formatBRL(month.carried_before)} antes,{" "}
            {formatBRL(month.carried_after)} depois.
          </p>
        )}

        {/* Resultado por categoria */}
        {month.categories.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Vendas</TableHead>
                <TableHead className="text-right">Resultado</TableHead>
                <TableHead>Isento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {month.categories.map((category) => (
                <TableRow key={`${category.asset_class}-${category.trade_type}`}>
                  <TableCell>
                    {assetClassLabels[category.asset_class]} ·{" "}
                    {tradeTypeLabels[category.trade_type]}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatBRL(category.sales)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatSignedBRL(category.result)}
                  </TableCell>
                  <TableCell>{category.exempt ? "Sim" : "Não"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Apuração por conjunto de compensação */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Conjunto</TableHead>
              <TableHead className="text-right">Líquido</TableHead>
              <TableHead className="text-right">Compensado</TableHead>
              <TableHead className="text-right">Tributável</TableHead>
              <TableHead className="text-right">Alíquota</TableHead>
              <TableHead className="text-right">Imposto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {month.pools.map((pool) => (
              <TableRow key={pool.pool}>
                <TableCell>{lossPoolLabels[pool.pool]}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatSignedBRL(pool.net)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatBRL(pool.compensated)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatBRL(pool.taxable)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatPercent(pool.rate)}
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatBRL(pool.tax)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
