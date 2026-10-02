import { formatVolatility } from "@/features/risk-return/format";
import { periodReturnHint, returnsHint, volatilityHint } from "@/features/risk-return/hints";
import { PORTFOLIO_KEY, type RiskReturn, itemKey } from "@/features/risk-return/use-risk-return";
import { ColorSwatch } from "@/shared/components/color-swatch";
import { MetricHint } from "@/shared/components/metric-hint";
import { Money } from "@/shared/components/money";
import { TickerLabel } from "@/shared/components/ticker-label";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { portfolioCategoryConfig } from "@/shared/lib/portfolio-category";
import { signTone } from "@/shared/lib/sign";
import { formatSignedPercent, toChartNumber } from "@/types/decimal";

interface RiskReturnTableProps {
  riskReturn: RiskReturn;
  hidden: ReadonlySet<string>;
  onToggle: (key: string) => void;
}

/** Os itens, do maior valor para o menor, com a escolha do que entra no gráfico. */
export function RiskReturnTable({ riskReturn, hidden, onToggle }: RiskReturnTableProps) {
  const items = riskReturn.items.toSorted(
    (first, second) => toChartNumber(second.value) - toChartNumber(first.value),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Itens</CardTitle>
        <CardAction>
          <span className="text-caption text-muted-foreground">
            Desmarque para tirar do gráfico
          </span>
        </CardAction>
      </CardHeader>
      <CardContent data-flush>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">No gráfico</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">
                <MetricHint hint={periodReturnHint}>Retorno</MetricHint>
              </TableHead>
              <TableHead className="text-right">
                <MetricHint hint={volatilityHint}>Volatilidade</MetricHint>
              </TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">
                <MetricHint hint={returnsHint}>Pregões</MetricHint>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Carteira inteira */}
            {riskReturn.portfolio && (
              <TableRow className="font-semibold">
                <TableCell>
                  <Checkbox
                    aria-label="Mostrar a carteira no gráfico"
                    checked={!hidden.has(PORTFOLIO_KEY)}
                    onCheckedChange={() => onToggle(PORTFOLIO_KEY)}
                  />
                </TableCell>
                <TableCell>Carteira</TableCell>
                <TableCell
                  variant={signTone(riskReturn.portfolio.period_return)}
                  className="text-right"
                >
                  {formatSignedPercent(riskReturn.portfolio.period_return)}
                </TableCell>
                <TableCell className="text-right">
                  {formatVolatility(riskReturn.portfolio.volatility)}
                </TableCell>
                <TableCell />
                <TableCell className="text-right">{riskReturn.portfolio.returns}</TableCell>
              </TableRow>
            )}

            {/* Itens */}
            {items.map((item) => {
              const key = itemKey(item);
              return (
                <TableRow key={key}>
                  <TableCell>
                    <Checkbox
                      aria-label={`Mostrar ${item.label} no gráfico`}
                      checked={!hidden.has(key)}
                      disabled={item.risk.volatility === null}
                      onCheckedChange={() => onToggle(key)}
                    />
                  </TableCell>
                  <TableCell>
                    {item.asset_id !== null ? (
                      <TickerLabel
                        ticker={item.label}
                        category={item.category}
                        to={`/assets/${item.asset_id}`}
                      />
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <ColorSwatch color={portfolioCategoryConfig[item.category].color} />
                        {item.label}
                      </span>
                    )}
                  </TableCell>
                  <TableCell variant={signTone(item.risk.period_return)} className="text-right">
                    {formatSignedPercent(item.risk.period_return)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatVolatility(item.risk.volatility)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Money value={item.value} />
                  </TableCell>
                  <TableCell className="text-right">{item.risk.returns}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
