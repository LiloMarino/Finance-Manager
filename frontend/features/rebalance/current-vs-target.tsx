import { Link } from "react-router-dom";

import { deviationHint, gapHint, imbalanceHint } from "@/features/rebalance/hints";
import { type ShareItem, ShareDonut, ShareLabel } from "@/features/rebalance/share-donut";
import type { Rebalance, RebalanceLine } from "@/features/rebalance/use-rebalance";
import { itemColors } from "@/features/subportfolios/item-colors";
import { useCash } from "@/features/cash/use-cash";
import { ChartLegend } from "@/shared/components/chart-legend";
import { Metric, MetricStrip } from "@/shared/components/metric";
import { MetricHint } from "@/shared/components/metric-hint";
import { Money } from "@/shared/components/money";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
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
import { signTone } from "@/shared/lib/sign";
import {
  type DecimalString,
  decimalAbs,
  decimalSign,
  formatPercent,
  formatPoints,
  formatSignedPoints,
  toChartNumber,
} from "@/types/decimal";

/** As linhas da meta como itens de rosca, na cor de cada uma. */
function shareItems(
  lines: RebalanceLine[],
  colors: string[],
  share: (line: RebalanceLine) => DecimalString | null,
): ShareItem[] {
  return lines.map((line, index) => ({
    key: `${line.asset_id}-${line.label}`,
    label: line.label,
    isAsset: line.asset_id !== null,
    color: colors[index] ?? "var(--border-strong)",
    share: share(line),
  }));
}

/** O item mais longe da meta, pelo maior desvio em módulo. */
function farthest(lines: RebalanceLine[]): RebalanceLine | undefined {
  const distance = (line: RebalanceLine) =>
    line.deviation === null ? 0 : Math.abs(toChartNumber(line.deviation));
  return lines
    .filter((line) => line.deviation !== null)
    .toSorted((first, second) => distance(second) - distance(first))[0];
}

function Summary({ rebalance, subportfolioId }: { rebalance: Rebalance; subportfolioId: number }) {
  const cash = useCash();
  const far = farthest(rebalance.lines);

  return (
    <MetricStrip>
      <Metric
        label="Desbalanceamento"
        hint={imbalanceHint}
        size="lg"
        value={rebalance.imbalance ? formatPoints(rebalance.imbalance) : null}
        detail={
          <>
            {rebalance.breached ? (
              <Badge variant="critical">Fora do limite</Badge>
            ) : (
              <Badge variant="gain">Dentro do limite</Badge>
            )}
            {rebalance.max_total_deviation &&
              `a soma dos desvios; limite de ${formatPoints(rebalance.max_total_deviation)}`}
          </>
        }
      />
      <Metric
        label="Mais longe da meta"
        value={far?.deviation ? `${far.label}, ${formatSignedPoints(far.deviation)}` : null}
        detail={
          far?.gap && rebalance.max_item_deviation ? (
            <>
              {decimalSign(far.gap) > 0 ? "faltam " : "sobram "}
              <Money value={decimalAbs(far.gap)} />; limite de{" "}
              {formatPoints(rebalance.max_item_deviation)} por item
            </>
          ) : undefined
        }
      />
      <Metric
        label="Saldo para aportar"
        value={cash.data?.balance ? <Money value={cash.data.balance} /> : null}
        detail={
          <Link
            to={`/subportfolios/${subportfolioId}?tab=rebalance`}
            className="text-primary font-medium"
          >
            Ver onde pôr →
          </Link>
        }
      />
    </MetricStrip>
  );
}

/** A primeira aba da subcarteira: onde cada item está hoje contra a meta. */
export function CurrentVsTarget({
  rebalance,
  subportfolioId,
}: {
  rebalance: Rebalance;
  subportfolioId: number;
}) {
  const lines = rebalance.lines;
  const colors = itemColors(lines);

  if (lines.length === 0) {
    return (
      <p className="text-muted-foreground">
        Nenhum item: a subcarteira ainda não tem ativo nem título. Escolha-os em Itens.
      </p>
    );
  }

  return (
    <>
      {rebalance.complete ? (
        <Summary rebalance={rebalance} subportfolioId={subportfolioId} />
      ) : (
        <Alert variant="warning">
          <AlertTitle>
            {rebalance.targets_total
              ? `As metas somam ${formatPercent(rebalance.targets_total)}`
              : "A subcarteira ainda não tem metas"}
          </AlertTitle>
          <AlertDescription>
            Com as metas somando 100%, a subcarteira passa a ter desvio, limite e a divisão do
            aporte. Ajuste em Metas.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{rebalance.complete ? "Como está hoje e a meta" : "Como está hoje"}</CardTitle>
          <ChartLegend
            entries={lines.map((line, index) => ({
              key: `${line.asset_id}-${line.label}`,
              label: line.label,
              color: colors[index] ?? "var(--border-strong)",
            }))}
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ShareDonut
              heading="Hoje"
              caption="a fração de cada item na subcarteira"
              items={shareItems(lines, colors, (line) => line.share)}
            />
            {rebalance.complete && (
              <ShareDonut
                heading="Meta"
                caption="o que você definiu em Metas"
                items={shareItems(lines, colors, (line) => line.target)}
              />
            )}
          </div>
        </CardContent>
        <div className="border-border border-t pt-2">
          <CardContent data-flush>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Hoje</TableHead>
                  <TableHead className="text-right">Meta</TableHead>
                  <TableHead className="text-right">
                    <MetricHint hint={deviationHint}>Desvio</MetricHint>
                  </TableHead>
                  <TableHead className="text-right">
                    <MetricHint hint={gapHint}>Para chegar na meta</MetricHint>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line, index) => (
                  <TableRow key={`${line.asset_id}-${line.label}`}>
                    <TableCell>
                      <ShareLabel
                        item={{
                          label: line.label,
                          isAsset: line.asset_id !== null,
                          color: colors[index] ?? "var(--border-strong)",
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Money value={line.value} />
                    </TableCell>
                    <TableCell className="text-right">{formatPercent(line.share)}</TableCell>
                    <TableCell className="text-right">
                      {line.target === null ? "—" : formatPercent(line.target)}
                    </TableCell>
                    <TableCell
                      variant={line.deviation === null ? "default" : signTone(line.deviation)}
                      className="text-right"
                    >
                      {line.deviation === null ? "—" : formatSignedPoints(line.deviation)}
                    </TableCell>
                    <TableCell className="text-right">
                      {line.gap === null ? (
                        "—"
                      ) : decimalSign(line.gap) > 0 ? (
                        <>
                          faltam <Money value={line.gap} />
                        </>
                      ) : (
                        <>
                          sobram <Money value={decimalAbs(line.gap)} />
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-caption text-muted-foreground px-5 pt-3">
              p.p. é ponto percentual: meta de 25% e 28,06% hoje dá desvio de +3,06 p.p.
            </p>
          </CardContent>
        </div>
      </Card>
    </>
  );
}
