import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import type { Installments } from "@/features/installments/use-installments";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { formatDate } from "@/shared/lib/format";
import { formatBRL, toChartNumber } from "@/types/decimal";

const chartConfig = {
  installments: { label: "Parcelado", color: "var(--chart-1)" },
  cash: { label: "À vista", color: "var(--chart-2)" },
} satisfies ChartConfig;

type SeriesKey = keyof typeof chartConfig;

function isSeriesKey(value: string): value is SeriesKey {
  return value in chartConfig;
}

const axisCurrency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
});

export function BalanceChart({ simulation }: { simulation: Installments }) {
  const data = simulation.balance.map((point) => ({
    day: point.day,
    installments: toChartNumber(point.installments),
    cash: point.cash === null ? null : toChartNumber(point.cash),
    labels: {
      installments: formatBRL(point.installments),
      cash: point.cash === null ? "—" : formatBRL(point.cash),
    },
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <LineChart data={data} margin={{ left: 4, right: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          minTickGap={32}
          tickFormatter={(day: string) => formatDate(day).slice(3)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={64}
          tickFormatter={(value: number) => axisCurrency.format(value)}
        />
        <ChartTooltip
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
                      <span
                        className="size-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: `var(--color-${key})` }}
                      />
                      {isSeriesKey(key) ? chartConfig[key].label : key}
                    </span>
                    <span className="tabular-nums">{String(label)}</span>
                  </span>
                );
              }}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          dataKey="installments"
          type="stepAfter"
          stroke="var(--color-installments)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          dataKey="cash"
          type="linear"
          stroke="var(--color-cash)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
