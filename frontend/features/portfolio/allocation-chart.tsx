import { useState } from "react";
import { Cell, Pie, PieChart } from "recharts";

import type { Portfolio } from "@/features/portfolio/use-portfolio";
import { CategoryDot } from "@/shared/components/category-dot";
import { ChartContainer, ChartTooltip } from "@/shared/components/ui/chart";
import { portfolioCategoryConfig as categoryConfig } from "@/shared/lib/portfolio-category";
import { formatBRL, formatPercent, toChartNumber } from "@/types/decimal";

type Allocation = Portfolio["categories"][number];

function AllocationTooltip({ item }: { item: Allocation }) {
  return (
    <div className="bg-background flex flex-col gap-1 rounded-lg border px-3 py-2 text-sm shadow-lg">
      <span className="flex items-center gap-2 font-medium">
        <CategoryDot category={item.category} />
        {categoryConfig[item.category].label}
      </span>
      <span className="text-base font-semibold tabular-nums">{formatBRL(item.value)}</span>
      <span className="text-muted-foreground tabular-nums">
        {formatPercent(item.share)} da carteira
      </span>
    </div>
  );
}

/** O donut da composição com a legenda ao lado. Passar o mouse numa fatia ou numa
linha da legenda destaca a mesma categoria nos dois. */
export function AllocationChart({ categories }: { categories: Allocation[] }) {
  const [active, setActive] = useState<number | null>(null);
  const byCategory = new Map<string, Allocation>(categories.map((item) => [item.category, item]));
  const data = categories.map((item) => ({
    category: item.category,
    value: toChartNumber(item.value),
  }));

  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row">
      {/* Donut */}
      <ChartContainer config={categoryConfig} className="aspect-auto h-64 w-full lg:w-1/2">
        <PieChart>
          <ChartTooltip
            content={({ active: hovered, payload }) => {
              const item = hovered ? byCategory.get(String(payload[0]?.name)) : undefined;
              return item ? <AllocationTooltip item={item} /> : null;
            }}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="category"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={2}
            stroke="var(--card)"
            strokeWidth={2}
            onMouseEnter={(_, index) => setActive(index)}
            onMouseLeave={() => setActive(null)}
          >
            {data.map((item, index) => (
              <Cell
                key={item.category}
                fill={categoryConfig[item.category].color}
                opacity={active === null || active === index ? 1 : 0.3}
                className="transition-opacity"
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      {/* Legenda */}
      <ul className="flex w-full flex-col gap-1 lg:w-1/2">
        {categories.map((item, index) => (
          <li
            key={item.category}
            className="hover:bg-muted/50 flex items-center justify-between gap-4 rounded-md px-3 py-2"
            onMouseEnter={() => setActive(index)}
            onMouseLeave={() => setActive(null)}
          >
            <span className="flex items-center gap-2 font-medium">
              <CategoryDot category={item.category} />
              {categoryConfig[item.category].label}
            </span>
            <span className="flex flex-col items-end tabular-nums">
              <span className="font-semibold">{formatBRL(item.value)}</span>
              <span className="text-muted-foreground text-xs">{formatPercent(item.share)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
