import { combinedTargetHint, deviationHint, gapHint } from "@/features/rebalance/hints";
import type { RebalanceLine } from "@/features/rebalance/use-rebalance";
import { MetricHint } from "@/shared/components/metric-hint";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { portfolioCategoryLabels } from "@/shared/lib/portfolio-category";
import { formatBRL, formatPercent, formatSignedBRL, formatSignedPoints } from "@/types/decimal";

interface DeviationTableProps {
  lines: RebalanceLine[];
  /** Na carteira geral, a coluna da subcarteira aparece, a meta é a combinada e o
  que falta em reais sai, porque o aporte é por subcarteira. */
  general: boolean;
}

export function DeviationTable({ lines, general }: DeviationTableProps) {
  if (lines.length === 0) {
    return (
      <p className="text-muted-foreground">
        Nenhum item: a subcarteira ainda não tem ativo nem título.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          {general && <TableHead>Subcarteira</TableHead>}
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="text-right">Atual</TableHead>
          <TableHead className="text-right">
            {general ? (
              <MetricHint hint={combinedTargetHint}>
                <span>Meta</span>
              </MetricHint>
            ) : (
              "Meta"
            )}
          </TableHead>
          <TableHead className="text-right">
            <MetricHint hint={deviationHint}>
              <span>Desvio</span>
            </MetricHint>
          </TableHead>
          {!general && (
            <TableHead className="text-right">
              <MetricHint hint={gapHint}>
                <span>Falta ou sobra</span>
              </MetricHint>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.map((line) => (
          <TableRow key={`${line.subportfolio_id}-${line.asset_id}-${line.label}`}>
            <TableCell>
              <span className="flex flex-wrap items-center gap-2 font-medium">
                {line.label}
                {line.breached && <Badge variant="destructive">Fora do limite</Badge>}
              </span>
              {line.label !== portfolioCategoryLabels[line.category] && (
                <span className="text-muted-foreground block text-xs">
                  {portfolioCategoryLabels[line.category]}
                </span>
              )}
            </TableCell>
            {general && (
              <TableCell variant="muted">{line.subportfolio ?? "Fora de subcarteira"}</TableCell>
            )}
            <TableCell className="text-right tabular-nums">{formatBRL(line.value)}</TableCell>
            <TableCell className="text-right tabular-nums">{formatPercent(line.share)}</TableCell>
            <TableCell className="text-right tabular-nums">
              {line.target === null ? "—" : formatPercent(line.target)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {line.deviation === null ? "—" : formatSignedPoints(line.deviation)}
            </TableCell>
            {!general && (
              <TableCell className="text-right tabular-nums">
                {line.gap === null ? "—" : formatSignedBRL(line.gap)}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
