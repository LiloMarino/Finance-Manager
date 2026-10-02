import { useDivision } from "@/features/subportfolios/use-division";
import { ColorSwatch } from "@/shared/components/color-swatch";
import { DonutChart } from "@/shared/components/donut-chart";
import { Money } from "@/shared/components/money";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { Subportfolio } from "@/shared/hooks/use-subportfolios";
import { subportfolioColors } from "@/shared/lib/subportfolio-identity";
import { formatPercent, toChartNumber } from "@/types/decimal";

/** O patrimônio dividido entre as subcarteiras e o que ficou fora delas, o saldo
incluído. */
export function DivisionCard({ subportfolios }: { subportfolios: Subportfolio[] }) {
  const { data } = useDivision();
  if (!data) return <Skeleton className="h-48 w-full" />;

  const slices = data.slices.map((slice) => {
    const found = subportfolios.find((item) => item.id === slice.subportfolio_id);
    return {
      key: String(slice.subportfolio_id ?? "outside"),
      label: found?.name ?? "Fora de subcarteira",
      note: found ? undefined : "o saldo e o que não tem subcarteira",
      color: found ? subportfolioColors[found.color].color : "var(--border-strong)",
      value: slice.value,
      share: slice.share,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Como a carteira se divide</CardTitle>
        <CardAction>
          <span className="text-caption text-muted-foreground">
            <Money value={data.total} /> no total
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-8">
        <DonutChart
          slices={slices.map((slice) => ({
            key: slice.key,
            color: slice.color,
            value: toChartNumber(slice.value),
          }))}
          center={
            <>
              <span className="text-caption text-muted-foreground">
                {subportfolios.length} {subportfolios.length === 1 ? "subcarteira" : "subcarteiras"}
              </span>
            </>
          }
        />
        <div className="grid min-w-0 flex-1 grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
          {slices.map((slice) => (
            <div key={slice.key} className="flex flex-col gap-0.5">
              <span className="text-ink-2 flex items-center gap-2">
                <ColorSwatch color={slice.color} />
                {slice.label}
              </span>
              <span className="text-section-title tabular-nums">
                <Money value={slice.value} />
              </span>
              <span className="text-caption text-muted-foreground tabular-nums">
                {formatPercent(slice.share)}
                {slice.note && ` · ${slice.note}`}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
