import {
  CartesianGrid,
  LabelList,
  ReferenceLine,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import { formatVolatility } from "@/features/risk-return/format";
import { chartHint } from "@/features/risk-return/hints";
import {
  PORTFOLIO_KEY,
  type RiskPoint,
  type RiskReturn,
  itemKey,
} from "@/features/risk-return/use-risk-return";
import { ChartLegend } from "@/shared/components/chart-legend";
import { MetricHint } from "@/shared/components/metric-hint";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/shared/components/ui/chart";
import { useValueFormat } from "@/shared/hooks/use-value-format";
import { portfolioCategories, portfolioCategoryConfig } from "@/shared/lib/portfolio-category";
import { type DecimalString, formatSignedPercent, toChartNumber } from "@/types/decimal";

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
  /** O valor na carteira; a carteira inteira não tem. */
  amount: DecimalString | null;
  returns: number;
}

/** O ponto do gráfico; sem volatilidade, o item fica só na tabela. */
function toDot(label: string, risk: RiskPoint, amount: DecimalString | null): Dot | null {
  if (risk.volatility === null) return null;
  return {
    label,
    volatility: risk.volatility,
    periodReturn: toChartNumber(risk.period_return),
    returnLabel: formatSignedPercent(risk.period_return),
    value: amount === null ? 0 : toChartNumber(amount),
    amount,
    returns: risk.returns,
  };
}

interface DotTooltipProps {
  active?: boolean;
  payload?: { payload?: Dot }[];
}

function DotTooltip({ active, payload }: DotTooltipProps) {
  const format = useValueFormat();
  const dot = payload?.[0]?.payload;
  if (!active || !dot) return null;
  return (
    <div className="border-border bg-popover shadow-popover grid min-w-44 gap-1.5 rounded-md border px-2.5 py-1.5 text-xs">
      <span className="font-medium">{dot.label}</span>
      <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5">
        <span className="text-muted-foreground">Retorno</span>
        <span className="text-right tabular-nums">{dot.returnLabel}</span>
        <span className="text-muted-foreground">Volatilidade</span>
        <span className="text-right tabular-nums">{formatVolatility(dot.volatility)}</span>
        {dot.amount && (
          <>
            <span className="text-muted-foreground">Valor</span>
            <span className="text-right tabular-nums">{format.brl(dot.amount)}</span>
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

/** Cada item como um ponto: a volatilidade no eixo X, o retorno no Y e o valor na
carteira no tamanho. A carteira inteira é o losango. */
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
  const legend = [
    ...groups.map(({ category }) => ({
      key: category,
      label: portfolioCategoryConfig[category].label,
      color: portfolioCategoryConfig[category].color,
    })),
    ...(portfolio
      ? [
          {
            key: PORTFOLIO_KEY,
            label: "Carteira",
            color: "var(--foreground)",
            shape: "square" as const,
          },
        ]
      : []),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <MetricHint hint={chartHint}>Cada item no período</MetricHint>
        </CardTitle>
        <CardAction>
          <ChartLegend entries={legend} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {!groups.length && !portfolio ? (
          <p className="text-caption text-muted-foreground">
            Nenhum item com pregões suficientes para medir a volatilidade neste período.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-96 w-full">
            <ScatterChart margin={{ left: 4, right: 56, top: 12, bottom: 24 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                type="number"
                dataKey="volatility"
                name="Volatilidade"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => axisPercent.format(value)}
                label={{
                  value: "Volatilidade ao ano (risco) →",
                  position: "insideBottom",
                  offset: -16,
                  fill: "var(--muted-foreground)",
                  fontSize: 12,
                }}
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
              <ReferenceLine y={0} stroke="var(--border-strong)" />
              <ChartTooltip cursor={false} content={<DotTooltip />} />
              {groups.map(({ category, dots }) => (
                <Scatter
                  key={category}
                  name={category}
                  data={dots}
                  fill={`var(--color-${category})`}
                  fillOpacity={0.9}
                  isAnimationActive={false}
                  stroke="var(--card)"
                  strokeWidth={2}
                >
                  <LabelList
                    dataKey="label"
                    position="right"
                    offset={10}
                    fill="var(--ink-2)"
                    fontSize={12}
                  />
                </Scatter>
              ))}
              {portfolio && (
                <Scatter
                  name={PORTFOLIO_KEY}
                  data={[portfolio]}
                  zAxisId={PORTFOLIO_KEY}
                  shape="diamond"
                  isAnimationActive={false}
                  fill={`var(--color-${PORTFOLIO_KEY})`}
                  stroke="var(--card)"
                  strokeWidth={2}
                >
                  <LabelList
                    dataKey="label"
                    position="top"
                    offset={10}
                    fill="var(--foreground)"
                    fontSize={12}
                    fontWeight={600}
                  />
                </Scatter>
              )}
            </ScatterChart>
          </ChartContainer>
        )}
        <p className="text-caption text-muted-foreground">
          O tamanho da bolinha é o valor na carteira hoje. Mais acima rendeu mais, e mais à esquerda
          oscilou menos: o melhor lugar é o canto superior esquerdo.
        </p>
      </CardContent>
    </Card>
  );
}
