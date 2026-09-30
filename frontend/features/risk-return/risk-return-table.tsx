import { formatVolatility } from "@/features/risk-return/format";
import { periodReturnHint, returnsHint, volatilityHint } from "@/features/risk-return/hints";
import { PORTFOLIO_KEY, type RiskReturn, itemKey } from "@/features/risk-return/use-risk-return";
import { MetricHint } from "@/shared/components/metric-hint";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { portfolioCategoryConfig, portfolioCategoryLabels } from "@/shared/lib/portfolio-category";
import { signClass } from "@/shared/lib/sign";
import { formatBRL, formatSignedPercent, toChartNumber } from "@/types/decimal";

interface RiskReturnTableProps {
  riskReturn: RiskReturn;
  hidden: ReadonlySet<string>;
  onToggle: (key: string) => void;
}

export function RiskReturnTable({ riskReturn, hidden, onToggle }: RiskReturnTableProps) {
  const items = riskReturn.items.toSorted(
    (first, second) => toChartNumber(second.value) - toChartNumber(first.value),
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-24">No gráfico</TableHead>
          <TableHead>Item</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead className="text-right">
            <MetricHint hint={periodReturnHint}>Retorno</MetricHint>
          </TableHead>
          <TableHead className="text-right">
            <MetricHint hint={volatilityHint}>Risco</MetricHint>
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
          <TableRow className="font-medium">
            <TableCell>
              <Checkbox
                aria-label="Mostrar a carteira no gráfico"
                checked={!hidden.has(PORTFOLIO_KEY)}
                onCheckedChange={() => onToggle(PORTFOLIO_KEY)}
              />
            </TableCell>
            <TableCell>Carteira</TableCell>
            <TableCell />
            <TableCell
              className={`text-right tabular-nums ${signClass(riskReturn.portfolio.period_return)}`}
            >
              {formatSignedPercent(riskReturn.portfolio.period_return)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatVolatility(riskReturn.portfolio.volatility)}
            </TableCell>
            <TableCell />
            <TableCell className="text-right tabular-nums">
              {riskReturn.portfolio.returns}
            </TableCell>
          </TableRow>
        )}

        {/* Itens, do maior valor para o menor */}
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
              <TableCell>{item.label}</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: portfolioCategoryConfig[item.category].color }}
                  />
                  {portfolioCategoryLabels[item.category]}
                </span>
              </TableCell>
              <TableCell
                className={`text-right tabular-nums ${signClass(item.risk.period_return)}`}
              >
                {formatSignedPercent(item.risk.period_return)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatVolatility(item.risk.volatility)}
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatBRL(item.value)}</TableCell>
              <TableCell className="text-right tabular-nums">{item.risk.returns}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
