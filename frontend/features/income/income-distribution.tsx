import { useState } from "react";
import { Link } from "react-router-dom";
import { Cell, Pie, PieChart } from "recharts";

import { dividendYieldHint, netHint, yieldOnCostHint } from "@/features/income/hints";
import { type IncomeDistribution, useIncomeDistribution } from "@/features/income/use-income";
import { MetricHint } from "@/shared/components/metric-hint";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { Progress } from "@/shared/components/ui/progress";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { getApiErrorMessage } from "@/shared/lib/api";
import { formatDate } from "@/shared/lib/format";
import { portfolioCategoryConfig as categoryConfig } from "@/shared/lib/portfolio-category";
import {
  type DecimalString,
  formatBRL,
  formatPercent,
  formatQuantity,
  toChartNumber,
} from "@/types/decimal";

const windows = ["6", "12", "24"] as const;
type Window = (typeof windows)[number];

function isWindow(value: string): value is Window {
  return windows.some((found) => found === value);
}

function percent(value: DecimalString | null): string {
  return value === null ? "—" : formatPercent(value);
}

function CategoryDonut({ distribution }: { distribution: IncomeDistribution }) {
  const data = distribution.categories.map((item) => ({
    category: item.category,
    value: toChartNumber(item.amount),
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
                  const item = distribution.categories.find(
                    (found) => found.category === String(name),
                  );
                  if (!item) return null;
                  return (
                    <span className="flex w-full justify-between gap-4">
                      <span>{categoryConfig[item.category].label}</span>
                      <span className="tabular-nums">
                        {formatBRL(item.amount)} · {formatPercent(item.share)}
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
            <TableHead className="text-right">Recebido</TableHead>
            <TableHead className="text-right">% do total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {distribution.categories.map((item) => (
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
              <TableCell className="text-right tabular-nums">{formatBRL(item.amount)}</TableCell>
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

function AssetSections({ distribution }: { distribution: IncomeDistribution }) {
  const categories = distribution.categories.map((item) => item.category);

  return (
    <Accordion type="multiple" defaultValue={categories}>
      {distribution.categories.map((category) => (
        <AccordionItem key={category.category} value={category.category}>
          <AccordionTrigger className="items-center hover:no-underline">
            <span className="flex w-full items-center justify-between gap-4 pr-2">
              <span className="font-medium">{categoryConfig[category.category].label}</span>
              <span className="text-muted-foreground tabular-nums">
                {formatBRL(category.amount)} · {formatPercent(category.share)}
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="w-40">% do total</TableHead>
                  <TableHead className="text-right">Recebido</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">
                    <MetricHint hint={dividendYieldHint}>Dividend yield</MetricHint>
                  </TableHead>
                  <TableHead className="text-right">
                    <MetricHint hint={yieldOnCostHint}>Yield on cost</MetricHint>
                  </TableHead>
                  <TableHead className="text-right">Último provento</TableHead>
                  <TableHead className="text-right">Acumulado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distribution.assets
                  .filter((asset) => asset.category === category.category)
                  .map((asset) => (
                    <TableRow key={asset.asset_id}>
                      <TableCell className="font-medium">
                        <Link to={`/assets/${asset.asset_id}`} className="hover:underline">
                          {asset.ticker}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2">
                          <span className="w-20">
                            <Progress
                              value={toChartNumber(asset.share) * 100}
                              aria-label={`${asset.ticker}: ${formatPercent(asset.share)}`}
                            />
                          </span>
                          <span className="w-14 text-right tabular-nums">
                            {formatPercent(asset.share)}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatBRL(asset.amount)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatQuantity(asset.quantity)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {percent(asset.dividend_yield)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {percent(asset.yield_on_cost)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatBRL(asset.last_amount)}
                        <span className="text-muted-foreground block text-xs">
                          {formatDate(asset.last_payment_date)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatBRL(asset.accumulated)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function IncomeDistributionPanel() {
  const [months, setMonths] = useState<Window>("12");
  const { data, isPending, error } = useIncomeDistribution(Number(months));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <ToggleGroup
          type="single"
          variant="outline"
          spacing={0}
          value={months}
          onValueChange={(value) => {
            if (isWindow(value)) setMonths(value);
          }}
        >
          {windows.map((window) => (
            <ToggleGroupItem key={window} value={window}>
              {window} meses
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {data && (
          <div className="flex flex-col items-end gap-1">
            <MetricHint hint={netHint}>
              <span className="text-muted-foreground text-sm">
                Recebido nos últimos {months} meses
              </span>
            </MetricHint>
            <span className="text-xl font-semibold tabular-nums">{formatBRL(data.total)}</span>
          </div>
        )}
      </div>

      {isPending ? (
        <Skeleton className="h-72 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : data.assets.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum provento na janela.</p>
      ) : (
        <>
          <CategoryDonut distribution={data} />
          <AssetSections distribution={data} />
        </>
      )}
    </div>
  );
}
