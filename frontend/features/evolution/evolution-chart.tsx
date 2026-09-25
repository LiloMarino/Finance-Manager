import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";

import type { Evolution } from "@/features/evolution/use-evolution";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { formatDate } from "@/shared/lib/format";
import { formatBRL, formatSignedBRL, toChartNumber } from "@/types/decimal";

const chartConfig = {
  value: { label: "Patrimônio", color: "var(--chart-1)" },
  investedBand: { label: "Aplicado", color: "var(--chart-1)" },
  gainBand: { label: "Ganho", color: "var(--chart-2)" },
  invested: { label: "Aplicado", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

const axisCurrency = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

interface EvolutionChartProps {
  points: Evolution["points"];
  composition: boolean;
}

export function EvolutionChart({ points, composition }: EvolutionChartProps) {
  // Na composição, as duas faixas somam o patrimônio: num dia de perda, a área
  // inteira é aplicado, e o aplicado de verdade fica na linha acima dela
  const data = points.map((point) => {
    const loss = point.gain.startsWith("-");
    return {
      day: point.day,
      value: toChartNumber(point.value),
      investedBand: toChartNumber(loss ? point.value : point.invested),
      gainBand: loss ? 0 : toChartNumber(point.gain),
      invested: toChartNumber(point.invested),
      point,
    };
  });

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-80 w-full">
      <ComposedChart data={data} margin={{ left: 4, right: 4 }}>
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
          width={56}
          tickFormatter={(value: number) => axisCurrency.format(value)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideIndicator
              labelFormatter={(_, payload) => {
                const day: unknown = payload[0]?.payload?.day;
                return typeof day === "string" ? formatDate(day) : null;
              }}
              formatter={(_, name, item) => {
                // Uma linha só no tooltip, com os três números do dia
                if (name !== (composition ? "investedBand" : "value")) return null;
                const point: Evolution["points"][number] = item.payload.point;
                return (
                  <div className="flex w-full flex-col gap-1 tabular-nums">
                    <span className="flex justify-between gap-4">
                      <span>Patrimônio</span>
                      <span>{formatBRL(point.value)}</span>
                    </span>
                    <span className="text-muted-foreground flex justify-between gap-4">
                      <span>Aplicado</span>
                      <span>{formatBRL(point.invested)}</span>
                    </span>
                    <span className="text-muted-foreground flex justify-between gap-4">
                      <span>Ganho</span>
                      <span>{formatSignedBRL(point.gain)}</span>
                    </span>
                  </div>
                );
              }}
            />
          }
        />
        {composition ? (
          <>
            <Area
              dataKey="investedBand"
              stackId="composition"
              type="monotone"
              stroke="var(--color-investedBand)"
              fill="var(--color-investedBand)"
              fillOpacity={0.35}
              isAnimationActive={false}
            />
            <Area
              dataKey="gainBand"
              stackId="composition"
              type="monotone"
              stroke="var(--color-gainBand)"
              fill="var(--color-gainBand)"
              fillOpacity={0.5}
              isAnimationActive={false}
            />
            <Line
              dataKey="invested"
              type="monotone"
              stroke="var(--color-invested)"
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
          </>
        ) : (
          <Area
            dataKey="value"
            type="monotone"
            stroke="var(--color-value)"
            fill="var(--color-value)"
            fillOpacity={0.15}
            strokeWidth={2}
            isAnimationActive={false}
          />
        )}
      </ComposedChart>
    </ChartContainer>
  );
}
