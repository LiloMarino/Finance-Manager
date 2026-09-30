import { CartesianGrid, Scatter, ScatterChart, XAxis, YAxis, ZAxis } from "recharts";

import { formatVolatility } from "@/features/risk-return/format";
import {
  PORTFOLIO_KEY,
  type RiskPoint,
  type RiskReturn,
  itemKey,
} from "@/features/risk-return/use-risk-return";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/shared/components/ui/chart";
import { portfolioCategories, portfolioCategoryConfig } from "@/shared/lib/portfolio-category";
import { type DecimalString, formatBRL, formatSignedPercent, toChartNumber } from "@/types/decimal";

const chartConfig = {
  ...portfolioCategoryConfig,
  [PORTFOLIO_KEY]: { label: "Carteira", color: "var(--foreground)" },
} satisfies ChartConfig;

const axisPercent = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 0,
});

interface Dot {
  label: string;
  volatility: number;
  periodReturn: number;
  returnLabel: string;
  value: number;
  valueLabel: string | null;
  returns: number;
}

/** O ponto do gráfico; sem volatilidade, o item fica só na tabela. */
function toDot(label: string, risk: RiskPoint, value: DecimalString | null): Dot | null {
  if (risk.volatility === null) return null;
  return {
    label,
    volatility: risk.volatility,
    periodReturn: toChartNumber(risk.period_return),
    returnLabel: formatSignedPercent(risk.period_return),
    value: value === null ? 0 : toChartNumber(value),
    valueLabel: value === null ? null : formatBRL(value),
    returns: risk.returns,
  };
}

interface DotTooltipProps {
  active?: boolean;
  payload?: { payload?: Dot }[];
}

function DotTooltip({ active, payload }: DotTooltipProps) {
  const dot = payload?.[0]?.payload;
  if (!active || !dot) return null;
  return (
    <div className="border-border/50 bg-background grid min-w-44 gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
      <span className="font-medium">{dot.label}</span>
      <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5">
        <span className="text-muted-foreground">Retorno</span>
        <span className="text-right tabular-nums">{dot.returnLabel}</span>
        <span className="text-muted-foreground">Risco</span>
        <span className="text-right tabular-nums">{formatVolatility(dot.volatility)}</span>
        {dot.valueLabel && (
          <>
            <span className="text-muted-foreground">Valor</span>
            <span className="text-right tabular-nums">{dot.valueLabel}</span>
          </>
        )}
        <span className="text-muted-foreground">Pregões</span>
        <span className="text-right tabular-nums">{dot.returns}</span>
      </div>
    </div>
  );
}

interface RiskReturnChartProps {
  riskReturn: RiskReturn;
  hidden: ReadonlySet<string>;
}

export function RiskReturnChart({ riskReturn, hidden }: RiskReturnChartProps) {
  // Um grupo por categoria, na ordem fixa delas: a cor segue a categoria
  const groups = portfolioCategories.flatMap((category) => {
    const dots = riskReturn.items
      .filter((item) => item.category === category && !hidden.has(itemKey(item)))
      .flatMap((item) => toDot(item.label, item.risk, item.value) ?? []);
    return dots.length ? [{ category, dots }] : [];
  });
  const portfolio =
    riskReturn.portfolio && !hidden.has(PORTFOLIO_KEY)
      ? toDot("Carteira", riskReturn.portfolio, null)
      : null;

  if (!groups.length && !portfolio) {
    return (
      <p className="text-muted-foreground">
        Nenhum item com pregões suficientes para medir o risco neste período.
      </p>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-80 w-full">
      <ScatterChart margin={{ left: 4, right: 12, top: 12, bottom: 4 }}>
        <CartesianGrid />
        <XAxis
          type="number"
          dataKey="volatility"
          name="Risco"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => axisPercent.format(value)}
        />
        <YAxis
          type="number"
          dataKey="periodReturn"
          name="Retorno"
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(value: number) => axisPercent.format(value)}
        />
        <ZAxis type="number" dataKey="value" range={[64, 640]} />
        <ZAxis zAxisId={PORTFOLIO_KEY} type="number" dataKey="value" range={[200, 200]} />
        <ChartTooltip cursor={false} content={<DotTooltip />} />
        {groups.map(({ category, dots }) => (
          <Scatter
            key={category}
            name={category}
            data={dots}
            fill={`var(--color-${category})`}
            fillOpacity={0.85}
            stroke="var(--card)"
            strokeWidth={2}
          />
        ))}
        {portfolio && (
          <Scatter
            name={PORTFOLIO_KEY}
            data={[portfolio]}
            zAxisId={PORTFOLIO_KEY}
            shape="diamond"
            fill={`var(--color-${PORTFOLIO_KEY})`}
            stroke="var(--card)"
            strokeWidth={2}
          />
        )}
        <ChartLegend itemSorter={null} content={<ChartLegendContent />} />
      </ScatterChart>
    </ChartContainer>
  );
}
