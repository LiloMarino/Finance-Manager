import { useState } from "react";
import { Cell, Pie, PieChart } from "recharts";

import type { Portfolio } from "@/features/portfolio/use-portfolio";
import { ColorSwatch } from "@/shared/components/color-swatch";
import { Money } from "@/shared/components/money";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/shared/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { portfolioCategoryConfig } from "@/shared/lib/portfolio-category";
import { cn } from "@/shared/lib/utils";
import { type DecimalString, formatPercent, toChartNumber, toDecimalString } from "@/types/decimal";

type Tier = Portfolio["liquidity"][number]["tier"];

// A ordem é a do prazo, de hoje ao vencimento, e a cor segue essa ordem
const tierOrder: Tier[] = ["daily", "intermediate", "locked"];

const tierConfig: Record<Tier, { label: string; detail: string; color: string }> = {
  daily: {
    label: "Hoje",
    detail: "saldo e renda fixa de liquidez diária",
    color: "var(--liquidity-daily)",
  },
  intermediate: {
    label: "Em 2 dias úteis",
    detail: "renda variável: a venda cai em D+2",
    color: "var(--liquidity-intermediate)",
  },
  locked: {
    label: "No vencimento",
    detail: "renda fixa sem liquidez diária",
    color: "var(--liquidity-locked)",
  },
};

interface Slice {
  key: string;
  label: string;
  detail?: string;
  color: string;
  value: DecimalString;
  share: DecimalString;
}

const emptyConfig = {} satisfies ChartConfig;

function Donut({
  slices,
  caption,
  center,
}: {
  slices: Slice[];
  caption: string;
  center: DecimalString;
}) {
  const [active, setActive] = useState<string | null>(null);
  const data = slices.map((slice) => ({ key: slice.key, value: toChartNumber(slice.value) }));

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      {/* Rosca, com o total no meio */}
      <div className="relative size-44 shrink-0">
        <ChartContainer config={emptyConfig} className="aspect-square size-44">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="key"
              innerRadius={58}
              outerRadius={80}
              paddingAngle={1}
              stroke="var(--card)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {slices.map((slice) => (
                <Cell
                  key={slice.key}
                  fill={slice.color}
                  opacity={active === null || active === slice.key ? 1 : 0.3}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-caption text-muted-foreground">{caption}</span>
          <span className="text-section-title tabular-nums">
            <Money value={center} />
          </span>
        </div>
      </div>

      {/* Legenda com os valores */}
      <ul className="flex w-full min-w-0 flex-1 flex-col">
        {slices.map((slice) => (
          <li
            key={slice.key}
            className={cn(
              "border-border-subtle grid grid-cols-[minmax(0,1fr)_auto_4rem] items-center gap-3 border-b py-1.5 last:border-b-0",
              active === slice.key && "bg-muted",
            )}
            onMouseEnter={() => setActive(slice.key)}
            onMouseLeave={() => setActive(null)}
          >
            <span className="text-ink-2 flex items-center gap-2">
              <ColorSwatch color={slice.color} />
              <span className="flex flex-col">
                <span>{slice.label}</span>
                {slice.detail && (
                  <span className="text-caption text-muted-foreground">{slice.detail}</span>
                )}
              </span>
            </span>
            <span className="text-right tabular-nums">
              <Money value={slice.value} />
            </span>
            <span className="text-muted-foreground text-right tabular-nums">
              {formatPercent(slice.share)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** O patrimônio dividido por categoria ou por quando vira dinheiro. */
export function CompositionCard({ portfolio }: { portfolio: Portfolio }) {
  const [view, setView] = useState<"category" | "liquidity">("category");

  const byCategory: Slice[] = portfolio.categories.map((item) => ({
    key: item.category,
    label: portfolioCategoryConfig[item.category].label,
    color:
      item.category === "cash"
        ? "var(--border-strong)"
        : portfolioCategoryConfig[item.category].color,
    value: item.value,
    share: item.share,
  }));
  const byTier = tierOrder.flatMap((tier) => {
    const item = portfolio.liquidity.find((entry) => entry.tier === tier);
    return item ? [{ key: tier, ...tierConfig[tier], value: item.value, share: item.share }] : [];
  });
  const today = portfolio.liquidity.find((entry) => entry.tier === "daily");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Composição</CardTitle>
        <CardAction>
          <ToggleGroup
            variant="segmented"
            size="sm"
            aria-label="Dividir o patrimônio por"
            value={[view]}
            onValueChange={([next]) => {
              if (next === "category" || next === "liquidity") setView(next);
            }}
          >
            <ToggleGroupItem value="category">Categoria</ToggleGroupItem>
            <ToggleGroupItem value="liquidity">Liquidez</ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent>
        {view === "category" ? (
          <Donut slices={byCategory} caption="Patrimônio" center={portfolio.total} />
        ) : (
          <Donut
            slices={byTier}
            caption="Vira dinheiro hoje"
            center={today?.value ?? toDecimalString("0")}
          />
        )}
      </CardContent>
    </Card>
  );
}
