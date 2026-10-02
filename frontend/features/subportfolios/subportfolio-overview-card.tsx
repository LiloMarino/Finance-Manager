import { Link } from "react-router-dom";

import { itemColors } from "@/features/subportfolios/item-colors";
import { type DivisionSlice } from "@/features/subportfolios/use-division";
import { useRebalance } from "@/features/rebalance/use-rebalance";
import { ColorSwatch } from "@/shared/components/color-swatch";
import { Money } from "@/shared/components/money";
import { SubportfolioMark } from "@/shared/components/subportfolio-mark";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { Subportfolio } from "@/shared/hooks/use-subportfolios";
import { formatPercent, formatPoints, toChartNumber } from "@/types/decimal";

interface SubportfolioOverviewCardProps {
  subportfolio: Subportfolio;
  slice: DivisionSlice | undefined;
}

/** A subcarteira num card: identidade, valor, fração da carteira, a barra dos itens e
a situação das metas. */
export function SubportfolioOverviewCard({ subportfolio, slice }: SubportfolioOverviewCardProps) {
  const { data: rebalance } = useRebalance(subportfolio.id);
  const lines = rebalance?.lines ?? [];
  const colors = itemColors(lines);
  const to = `/subportfolios/${subportfolio.id}`;

  const status = !rebalance ? null : !rebalance.complete ? (
    <Badge variant="outline">Sem metas</Badge>
  ) : rebalance.breached ? (
    <Badge variant="critical">Fora do limite</Badge>
  ) : (
    <Badge variant="gain">Dentro do limite</Badge>
  );
  const detail =
    rebalance?.complete && rebalance.imbalance && rebalance.max_total_deviation
      ? `Desbalanceamento de ${formatPoints(rebalance.imbalance)}; limite de ${formatPoints(rebalance.max_total_deviation)}.`
      : "Sem metas, não há desvio nem divisão de aporte.";

  return (
    <Card>
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <SubportfolioMark identity={subportfolio} />
            <div className="flex flex-col gap-0.5">
              <span className="text-eyebrow text-muted-foreground uppercase">Subcarteira</span>
              <Link to={to} className="text-section-title hover:underline">
                {subportfolio.name}
              </Link>
            </div>
          </div>
          {status}
        </div>

        {slice && (
          <div className="flex items-baseline gap-2">
            <span className="text-kpi-sm tabular-nums">
              <Money value={slice.value} />
            </span>
            <span className="text-caption text-muted-foreground">
              {formatPercent(slice.share)} da carteira
            </span>
          </div>
        )}

        {/* Barra e itens */}
        <div className="flex flex-col gap-1.5">
          <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
            {lines.map((line, index) => (
              <span
                key={`${line.asset_id}-${line.label}`}
                className="bg-(--item) flex-(--weight) basis-0"
                style={{ "--item": colors[index], "--weight": toChartNumber(line.value) }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {lines.map((line, index) => (
              <Badge key={`${line.asset_id}-${line.label}`} variant="outline">
                <ColorSwatch color={colors[index] ?? "var(--border-strong)"} />
                <span className={line.asset_id === null ? undefined : "text-ticker font-mono"}>
                  {line.label}
                </span>
              </Badge>
            ))}
          </div>
        </div>

        <div className="border-border-subtle mt-auto flex items-center justify-between gap-3 border-t pt-3">
          <span className="text-caption text-muted-foreground">{detail}</span>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link to={to} />}>
            {rebalance?.complete ? "Abrir" : "Definir metas"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
