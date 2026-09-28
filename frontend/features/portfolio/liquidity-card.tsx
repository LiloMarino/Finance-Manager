import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useSearchParams } from "react-router-dom";

import type { Portfolio } from "@/features/portfolio/use-portfolio";
import { MetricHint } from "@/shared/components/metric-hint";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { monthLabel } from "@/shared/lib/months";
import { formatBRL, formatPercent, toChartNumber } from "@/types/decimal";

type Tier = Portfolio["liquidity"][number]["tier"];
type Bucket = Portfolio["maturities_by_month"][number];

// A ordem é a do prazo, de hoje ao vencimento, e a cor segue essa ordem
const tiers: Tier[] = ["daily", "intermediate", "locked"];

const tierConfig = {
  daily: { label: "Hoje", color: "var(--liquidity-daily)" },
  intermediate: { label: "Em 2 dias úteis", color: "var(--liquidity-intermediate)" },
  locked: { label: "No vencimento", color: "var(--liquidity-locked)" },
} satisfies ChartConfig & Record<Tier, { label: string; color: string }>;

const tierHints: Record<Tier, string> = {
  daily:
    "O saldo e a renda fixa com liquidez diária: dá para resgatar e usar no mesmo dia. É o que cobre um imprevisto sem vender nada.",
  intermediate:
    "A renda variável: a venda cai na conta em dois dias úteis (D+2), mas o lucro pode gerar DARF. Em ações, só quando as vendas do mês passam de R$ 20 mil; em FII e ETF, qualquer lucro.",
  locked:
    "Renda fixa sem liquidez diária: só vira dinheiro no vencimento, quando cai no saldo. Um título desses acima da meta só se corrige aportando nos outros itens.",
};

const ladderConfig = {
  value: { label: "Vence", color: "var(--liquidity-locked)" },
} satisfies ChartConfig;

const axisMoney = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
});

function bucketLabel(bucket: Bucket, byYear: boolean): string {
  if (bucket.start === null) return "Sem vencimento";
  const [year, month] = bucket.start.split("-").map(Number);
  return byYear ? String(year) : monthLabel(year ?? 0, month ?? 1);
}

function TierBar({ liquidity }: { liquidity: Portfolio["liquidity"] }) {
  const present = tiers.filter((tier) => liquidity.some((item) => item.tier === tier));
  const byTier = new Map<string, Portfolio["liquidity"][number]>(
    liquidity.map((item) => [item.tier, item]),
  );
  const row = Object.fromEntries(
    liquidity.map((item) => [item.tier, toChartNumber(item.value)]),
  );

  return (
    <ChartContainer config={tierConfig} className="aspect-auto h-10 w-full">
      <BarChart data={[row]} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
        <XAxis type="number" hide domain={[0, "dataMax"]} />
        <YAxis type="category" hide />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(_, name) => {
                const item = byTier.get(String(name));
                if (!item) return null;
                return (
                  <span className="flex w-full items-center justify-between gap-4">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: tierConfig[item.tier].color }}
                      />
                      {tierConfig[item.tier].label}
                    </span>
                    <span className="tabular-nums">
                      {formatBRL(item.value)} · {formatPercent(item.share)}
                    </span>
                  </span>
                );
              }}
            />
          }
        />
        {present.map((tier, index) => (
          <Bar
            key={tier}
            dataKey={tier}
            stackId="liquidity"
            fill={`var(--color-${tier})`}
            stroke="var(--card)"
            strokeWidth={index === 0 ? 0 : 2}
            radius={[
              index === 0 ? 4 : 0,
              index === present.length - 1 ? 4 : 0,
              index === present.length - 1 ? 4 : 0,
              index === 0 ? 4 : 0,
            ]}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

function TierTable({ liquidity }: { liquidity: Portfolio["liquidity"] }) {
  const ordered = tiers.flatMap((tier) => liquidity.filter((item) => item.tier === tier));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vira dinheiro</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="text-right">% da carteira</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ordered.map((item) => (
          <TableRow key={item.tier}>
            <TableCell>
              <span className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: tierConfig[item.tier].color }}
                />
                <MetricHint hint={tierHints[item.tier]}>
                  <span>{tierConfig[item.tier].label}</span>
                </MetricHint>
              </span>
            </TableCell>
            <TableCell className="text-right tabular-nums">{formatBRL(item.value)}</TableCell>
            <TableCell className="text-right tabular-nums">
              {formatPercent(item.share)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function MaturityLadder({ portfolio }: { portfolio: Portfolio }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const byYear = searchParams.get("maturities") === "year";
  const buckets = byYear ? portfolio.maturities_by_year : portfolio.maturities_by_month;
  const data = buckets.map((bucket) => ({
    label: bucketLabel(bucket, byYear),
    value: toChartNumber(bucket.value),
    formatted: formatBRL(bucket.value),
  }));

  const choose = (next: string) =>
    setSearchParams((params) => {
      if (next === "year") params.set("maturities", "year");
      else params.delete("maturities");
      return params;
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <MetricHint hint="O valor bruto de hoje dos títulos sem liquidez diária, pelo período em que cada um vence e vira saldo. Ex.: um CDB de R$ 1.000 que vence em março de 2028 aparece na barra de Mar/2028.">
          <span className="text-sm font-medium">Escada de vencimentos</span>
        </MetricHint>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={byYear ? "year" : "month"}
          onValueChange={(next) => next && choose(next)}
        >
          <ToggleGroupItem value="month">Mês</ToggleGroupItem>
          <ToggleGroupItem value="year">Ano</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <ChartContainer config={ladderConfig} className="aspect-auto h-56 w-full">
        <BarChart data={data} margin={{ left: 4, right: 4 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={16} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={64}
            tickFormatter={(value: number) => axisMoney.format(value)}
          />
          <ChartTooltip
            cursor={{ fill: "var(--muted)" }}
            content={
              <ChartTooltipContent
                hideIndicator
                formatter={(_, __, item) => {
                  const formatted: unknown = item.payload.formatted;
                  return <span className="tabular-nums">{String(formatted)}</span>;
                }}
              />
            }
          />
          <Bar
            dataKey="value"
            fill="var(--color-value)"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

/** O patrimônio pelo prazo em que vira dinheiro, e quando cada título vence. */
export function LiquidityCard({ portfolio }: { portfolio: Portfolio }) {
  if (portfolio.liquidity.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liquidez</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <TierBar liquidity={portfolio.liquidity} />
        <TierTable liquidity={portfolio.liquidity} />
        {portfolio.maturities_by_month.length > 0 && <MaturityLadder portfolio={portfolio} />}
      </CardContent>
    </Card>
  );
}
