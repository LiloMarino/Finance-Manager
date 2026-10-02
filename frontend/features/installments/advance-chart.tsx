import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import type { Advance } from "@/features/installments/use-installments";
import { ChartLegend, type LegendEntry } from "@/shared/components/chart-legend";
import { ColorSwatch } from "@/shared/components/color-swatch";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { useValueFormat } from "@/shared/hooks/use-value-format";
import { formatDate } from "@/shared/lib/format";
import { toChartNumber } from "@/types/decimal";

const advanceChartConfig = {
  discount: { label: "Desconto do banco", color: "var(--gain)" },
  earnings: { label: "Rendimento aplicado", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

type SeriesKey = keyof typeof advanceChartConfig;

function isSeriesKey(value: string): value is SeriesKey {
  return value in advanceChartConfig;
}

const legend: LegendEntry[] = Object.entries(advanceChartConfig).map(([key, series]) => ({
  key,
  label: series.label,
  color: series.color,
  shape: "square",
}));

/** A legenda do gráfico, que mora no cabeçalho do cartão. */
export function AdvanceLegend() {
  return <ChartLegend entries={legend} />;
}

const axisCurrency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
});

/** O desconto do banco ao lado do rendimento de deixar aplicado, parcela a parcela. */
export function AdvanceChart({ advance }: { advance: Advance }) {
  const format = useValueFormat();
  const data = advance.installments.map((row) => ({
    // "2027-03-10" vira "03/27"
    label: `${row.due_date.slice(5, 7)}/${row.due_date.slice(2, 4)}`,
    day: row.due_date,
    discount: toChartNumber(row.discount),
    earnings: toChartNumber(row.earnings),
    labels: { discount: format.brl(row.discount), earnings: format.brl(row.earnings) },
  }));

  return (
    <ChartContainer config={advanceChartConfig} className="aspect-auto h-60 w-full">
      <BarChart data={data} margin={{ left: 4, right: 4, top: 8 }} barGap={3}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={4} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(value: number) => format.amount(axisCurrency.format(value))}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)" }}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const day: unknown = payload[0]?.payload?.day;
                return typeof day === "string" ? formatDate(day) : null;
              }}
              formatter={(_, name, item) => {
                const key = String(name);
                const label: unknown = item.payload.labels?.[key];
                return (
                  <span className="flex w-full items-center justify-between gap-4">
                    <span className="flex items-center gap-2">
                      <ColorSwatch shape="square" color={`var(--color-${key})`} />
                      {isSeriesKey(key) ? advanceChartConfig[key].label : key}
                    </span>
                    <span className="tabular-nums">{String(label)}</span>
                  </span>
                );
              }}
            />
          }
        />
        <Bar
          dataKey="discount"
          fill="var(--color-discount)"
          radius={[3, 3, 0, 0]}
          isAnimationActive={false}
        />
        <Bar
          dataKey="earnings"
          fill="var(--color-earnings)"
          radius={[3, 3, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  );
}
