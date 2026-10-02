import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import type { Evolution } from "@/features/evolution/use-evolution";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { useValueFormat } from "@/shared/hooks/use-value-format";
import { formatDate } from "@/shared/lib/format";
import { signClass } from "@/shared/lib/sign";
import { toChartNumber } from "@/types/decimal";

// A carteira é a linha na cor do texto; o aplicado, a referência tracejada em cinza
const chartConfig = {
  value: { label: "Patrimônio", color: "var(--foreground)" },
  invested: { label: "Aplicado", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

const axisCurrency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

/** O patrimônio e o aplicado no tempo; a distância entre as linhas é o ganho. */
export function EvolutionChart({ points }: { points: Evolution["points"] }) {
  const format = useValueFormat();
  const data = points.map((point) => ({
    day: point.day,
    value: toChartNumber(point.value),
    invested: toChartNumber(point.invested),
    point,
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <LineChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          minTickGap={48}
          tickFormatter={(day: string) => formatDate(day).slice(3)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={64}
          tickFormatter={(value: number) => format.amount(axisCurrency.format(value))}
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
                if (name !== "value") return null;
                const point: Evolution["points"][number] = item.payload.point;
                return (
                  <div className="grid w-full grid-cols-[auto_auto] gap-x-4 gap-y-0.5 tabular-nums">
                    <span className="text-ink-2">Patrimônio</span>
                    <span className="text-right">{format.brl(point.value)}</span>
                    <span className="text-ink-2">Aplicado</span>
                    <span className="text-right">{format.brl(point.invested)}</span>
                    <span className="text-ink-2">Ganho</span>
                    <span className={`text-right ${signClass(point.gain)}`}>
                      {format.signedBrl(point.gain)}
                    </span>
                  </div>
                );
              }}
            />
          }
        />
        <Line
          dataKey="invested"
          type="monotone"
          stroke="var(--color-invested)"
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
          isAnimationActive={false}
        />
        <Line
          dataKey="value"
          type="monotone"
          stroke="var(--color-value)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
