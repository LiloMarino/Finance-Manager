import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import type { Portfolio } from "@/features/portfolio/use-portfolio";
import { Money } from "@/shared/components/money";
import { Button } from "@/shared/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { cn } from "@/shared/lib/utils";
import { type DecimalString, formatPercent, toChartNumber } from "@/types/decimal";

const UNCLASSIFIED = "Sem classificação";

interface Slice {
  label: string;
  classified: boolean;
  value: DecimalString;
  share: DecimalString;
}

/** A renda variável por setor ou por segmento, em barras na escala do maior; o que
não tem setor fica tracejado e chama a classificar. */
export function SectorCard({ portfolio }: { portfolio: Portfolio }) {
  const [level, setLevel] = useState<"segment" | "sector">("segment");
  const slices: Slice[] =
    level === "segment"
      ? portfolio.segments.map((item) => ({
          label: item.sector ? `${item.sector} · ${item.segment}` : UNCLASSIFIED,
          classified: item.sector !== null,
          value: item.value,
          share: item.share,
        }))
      : portfolio.sectors.map((item) => ({
          label: item.sector ?? UNCLASSIFIED,
          classified: item.sector !== null,
          value: item.value,
          share: item.share,
        }));
  const largest = Math.max(...slices.map((slice) => toChartNumber(slice.share)), 0);
  const unclassified = portfolio.positions
    .filter((position) => position.sector === null)
    .map((position) => position.ticker);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Renda variável por setor</CardTitle>
        <CardAction>
          <ToggleGroup
            variant="segmented"
            size="sm"
            aria-label="Agrupar por"
            value={[level]}
            onValueChange={([next]) => {
              if (next === "segment" || next === "sector") setLevel(next);
            }}
          >
            <ToggleGroupItem value="segment">Segmento</ToggleGroupItem>
            <ToggleGroupItem value="sector">Setor</ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        {/* Uma barra por grupo, na escala do maior */}
        {slices.map((slice) => (
          <div
            key={slice.label}
            className="text-caption grid grid-cols-[12rem_minmax(0,1fr)_6rem_3.5rem] items-center gap-3"
          >
            <span
              className={cn("truncate", slice.classified ? "text-ink-2" : "text-muted-foreground")}
            >
              {slice.label}
            </span>
            {slice.classified ? (
              <span className="bg-muted h-2.5 rounded-sm">
                <span
                  className="bg-muted-foreground block h-full w-(--bar) rounded-sm"
                  style={{
                    "--bar": `${largest ? (toChartNumber(slice.share) / largest) * 100 : 0}%`,
                  }}
                />
              </span>
            ) : (
              <span className="border-border-strong h-2.5 rounded-sm border border-dashed" />
            )}
            <span className="text-right tabular-nums">
              <Money value={slice.value} />
            </span>
            <span className="text-muted-foreground text-right tabular-nums">
              {formatPercent(slice.share)}
            </span>
          </div>
        ))}

        {/* O que falta classificar */}
        {unclassified.length > 0 && (
          <div className="border-border-subtle mt-1.5 flex items-center justify-between gap-3 border-t pt-3">
            <span className="text-caption text-muted-foreground">
              {unclassified.length}{" "}
              {unclassified.length === 1 ? "ativo sem setor" : "ativos sem setor"}:{" "}
              <span className="text-ticker font-mono">{unclassified.join(", ")}</span>
            </span>
            <Button variant="outline" size="sm" render={<Link to="/assets?tab=sectors" />}>
              Classificar
              <ChevronRight />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
