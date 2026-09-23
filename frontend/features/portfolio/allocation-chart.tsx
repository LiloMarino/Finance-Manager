import { Cell, Pie, PieChart } from "recharts";

import type { Portfolio } from "@/features/portfolio/use-portfolio";
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
import { formatBRL, formatPercent, toChartNumber } from "@/types/decimal";

type Category = Portfolio["categories"][number]["category"];

// A cor segue a categoria, não a posição dela na lista: cada uma tem o seu slot
const categoryConfig = {
  stock: { label: "Ações", color: "var(--chart-1)" },
  fii: { label: "FIIs", color: "var(--chart-2)" },
  etf: { label: "ETFs", color: "var(--chart-3)" },
  bdr: { label: "BDRs", color: "var(--chart-4)" },
  fixed_income: { label: "Renda fixa", color: "var(--chart-5)" },
} satisfies ChartConfig & Record<Category, { label: string; color: string }>;

export function AllocationChart({ categories }: { categories: Portfolio["categories"] }) {
  const byCategory = new Map<string, Portfolio["categories"][number]>(
    categories.map((item) => [item.category, item]),
  );
  const data = categories.map((item) => ({
    category: item.category,
    value: toChartNumber(item.value),
  }));

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      {/* Donut */}
      <ChartContainer config={categoryConfig} className="aspect-square h-48 shrink-0">
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                nameKey="category"
                hideLabel
                formatter={(_, name) => {
                  const item = byCategory.get(String(name));
                  if (!item) return null;
                  return (
                    <span className="flex w-full justify-between gap-4">
                      <span>{categoryConfig[item.category].label}</span>
                      <span className="tabular-nums">
                        {formatBRL(item.value)} · {formatPercent(item.share)}
                      </span>
                    </span>
                  );
                }}
              />
            }
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="category"
            innerRadius="60%"
            stroke="var(--card)"
            strokeWidth={2}
          >
            {data.map((item) => (
              <Cell key={item.category} fill={categoryConfig[item.category].color} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      {/* Legenda com os valores */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">% da carteira</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((item) => (
            <TableRow key={item.category}>
              <TableCell>
                <span className="flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: categoryConfig[item.category].color }}
                  />
                  {categoryConfig[item.category].label}
                </span>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatBRL(item.value)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatPercent(item.share)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
