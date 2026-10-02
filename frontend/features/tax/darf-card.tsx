import { DarfPaymentDialog } from "@/features/tax/darf-payment-dialog";
import {
  darfStatusLabels,
  darfStatusVariants,
  describeStatus,
  lossPoolLabels,
  tradeTypeLabels,
} from "@/features/tax/labels";
import type { MonthlyTax } from "@/features/tax/use-tax";
import { AssetClassBadge } from "@/shared/components/asset-class-badge";
import { Metric } from "@/shared/components/metric";
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
import { signClass, signTone } from "@/shared/lib/sign";
import { formatPercent, isZero } from "@/types/decimal";

/** O DARF do mês: o status, o vencimento, o botão do pagamento e os quatro números que
levam ao imposto. */
export function DarfCard({ month }: { month: MonthlyTax }) {
  const unpaid = month.status === "due" || month.status === "overdue";
  const losses = month.pools.filter((pool) => !isZero(pool.loss_after));
  const monthName = new Date(month.year, month.month - 1).toLocaleDateString("pt-BR", {
    month: "long",
  });

  return (
    <Card variant={unpaid ? "critical" : "default"}>
      <CardHeader>
        <CardTitle>
          DARF de {monthName}
          <Badge variant={darfStatusVariants[month.status]}>{darfStatusLabels[month.status]}</Badge>
        </CardTitle>
        <CardAction className="flex items-center gap-3">
          {month.due_date && (
            <span className="text-caption text-muted-foreground">
              Código 6015 · vencimento em {formatDate(month.due_date)}
            </span>
          )}
          {(month.darf_amount || month.payment) && <DarfPaymentDialog month={month} prominent />}
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-ink-2">{describeStatus(month)}</p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
          <Metric
            label="DARF a pagar"
            size="lg"
            value={month.darf_amount ? <Money value={month.darf_amount} /> : "—"}
            detail="imposto do mês, sem valor carregado de antes"
          />
          <Metric
            label="Resultado bruto"
            value={<Money value={month.gross_result} signed />}
            tone={signClass(month.gross_result)}
            detail="das vendas do mês"
          />
          <Metric
            label="Lucro tributável"
            value={<Money value={month.taxable} />}
            detail={
              isZero(month.exempt_profit) ? undefined : (
                <>
                  <Money value={month.exempt_profit} /> de ações ficaram isentos
                </>
              )
            }
          />
          <Metric label="Prejuízo a compensar depois">
            {losses.length === 0 ? (
              <span className="text-kpi-sm tabular-nums">
                <Money value={month.carried_after} />
              </span>
            ) : (
              <span className="flex flex-col">
                {losses.map((pool) => (
                  <span key={pool.pool} className="tabular-nums">
                    <span className="text-kpi-sm">
                      <Money value={pool.loss_after} />
                    </span>
                    <span className="text-caption text-muted-foreground">
                      {" "}
                      em {lossPoolLabels[pool.pool]}
                    </span>
                  </span>
                ))}
              </span>
            )}
          </Metric>
        </div>

        {!(isZero(month.carried_before) && isZero(month.carried_after)) && (
          <p className="text-caption text-muted-foreground">
            Carregado abaixo de R$ 10,00: <Money value={month.carried_before} /> antes,{" "}
            <Money value={month.carried_after} /> depois.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/** O que cada categoria vendeu e rendeu no mês, e se entrou na isenção. */
export function CategoryResultCard({ month }: { month: MonthlyTax }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultado por categoria</CardTitle>
      </CardHeader>
      <CardContent data-flush>
        {month.categories.length === 0 ? (
          <p className="text-caption text-muted-foreground px-5">Nenhuma venda no mês.</p>
        ) : (
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
                    <span className="inline-flex items-center gap-2">
                      <AssetClassBadge assetClass={category.asset_class} />
                      {tradeTypeLabels[category.trade_type]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Money value={category.sales} />
                  </TableCell>
                  <TableCell variant={signTone(category.result)} className="text-right">
                    <Money value={category.result} signed />
                  </TableCell>
                  <TableCell>{category.exempt ? "Sim" : "Não"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

/** A apuração por conjunto de compensação: líquido, compensado, base, alíquota e imposto. */
export function PoolsCard({ month }: { month: MonthlyTax }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Apuração</CardTitle>
      </CardHeader>
      <CardContent data-flush>
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
                <TableCell variant={signTone(pool.net)} className="text-right">
                  <Money value={pool.net} signed />
                </TableCell>
                <TableCell className="text-right">
                  <Money value={pool.compensated} />
                </TableCell>
                <TableCell className="text-right">
                  <Money value={pool.taxable} />
                </TableCell>
                <TableCell className="text-right">{formatPercent(pool.rate)}</TableCell>
                <TableCell className="text-right">
                  <Money value={pool.tax} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
