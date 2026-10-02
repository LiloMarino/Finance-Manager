import { type ReactNode, useState } from "react";

import { dividendYieldHint, yieldOnCostHint } from "@/features/income/hints";
import { useIncomeDistribution } from "@/features/income/use-income";
import { ColorSwatch } from "@/shared/components/color-swatch";
import { MetricHint } from "@/shared/components/metric-hint";
import { Money, Quantity } from "@/shared/components/money";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { TickerLabel } from "@/shared/components/ticker-label";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { getApiErrorMessage } from "@/shared/lib/api";
import { formatDate } from "@/shared/lib/format";
import {
  portfolioCategoryConfig as categoryConfig,
  type PortfolioCategory,
} from "@/shared/lib/portfolio-category";
import { formatPercent } from "@/types/decimal";

const windows = ["6", "12", "24"] as const;
type Window = (typeof windows)[number];

function isWindow(value: string): value is Window {
  return windows.some((found) => found === value);
}

interface IncomeDistributionPanelProps {
  subportfolioId?: number;
  category?: PortfolioCategory;
  /** Filtros da tela, antes do período */
  filters?: ReactNode;
}

/** Recebido por ativo no período: tabela agrupada por categoria. */
export function IncomeDistributionPanel({
  subportfolioId,
  category,
  filters,
}: IncomeDistributionPanelProps) {
  const [months, setMonths] = useState<Window>("12");
  const { data, isPending, error } = useIncomeDistribution({
    months: Number(months),
    category,
    subportfolio_id: subportfolioId,
  });

  return (
    <>
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        {filters}
        <ToggleGroup
          variant="segmented"
          size="sm"
          aria-label="Janela"
          value={[months]}
          onValueChange={([value]) => {
            if (value && isWindow(value)) setMonths(value);
          }}
        >
          {windows.map((window) => (
            <ToggleGroupItem key={window} value={window}>
              {window} meses
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : data.assets.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recebido por ativo em {months} meses</CardTitle>
            <CardAction>
              <CardDescription>Yield pelo valor de hoje e pelo custo</CardDescription>
            </CardAction>
          </CardHeader>
          <CardContent data-flush>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="text-right">% do total</TableHead>
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
                {data.categories.map((categoryItem) => {
                  const assets = data.assets.filter((a) => a.category === categoryItem.category);
                  return (
                    <div key={categoryItem.category} className="contents">
                      <TableRow variant="group">
                        <TableCell variant="group">
                          <span className="flex items-center gap-2">
                            <ColorSwatch color={categoryConfig[categoryItem.category].color} />
                            {categoryConfig[categoryItem.category].label}
                          </span>
                        </TableCell>
                        <TableCell variant="group" className="text-right">
                          {formatPercent(categoryItem.share)}
                        </TableCell>
                        <TableCell variant="group" className="text-right">
                          <Money value={categoryItem.amount} />
                        </TableCell>
                        <TableCell variant="group" />
                        <TableCell variant="group" />
                        <TableCell variant="group" />
                        <TableCell variant="group" />
                        <TableCell variant="group" />
                      </TableRow>
                      {assets.map((asset) => (
                        <TableRow key={asset.asset_id}>
                          <TableCell>
                            <TickerLabel
                              ticker={asset.ticker}
                              category={asset.category}
                              to={`/assets/${asset.asset_id}`}
                            />
                          </TableCell>
                          <TableCell className="text-right">{formatPercent(asset.share)}</TableCell>
                          <TableCell className="text-right">
                            <Money value={asset.amount} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Quantity value={asset.quantity} />
                          </TableCell>
                          <TableCell className="text-right">
                            {asset.dividend_yield ? formatPercent(asset.dividend_yield) : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {asset.yield_on_cost ? formatPercent(asset.yield_on_cost) : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Money value={asset.last_amount} />
                            <span className="text-caption text-muted-foreground block">
                              {formatDate(asset.last_payment_date)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Money value={asset.accumulated} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </div>
                  );
                })}
                <TableRow variant="total">
                  <TableCell>Total</TableCell>
                  <TableCell />
                  <TableCell className="text-right">
                    <Money value={data.total} />
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
      {!isPending && !error && (
        <>
          {data.assets.length === 0 && (
            <p className="text-caption text-muted-foreground">Nenhum provento no período.</p>
          )}
          {data.assets.length > 0 && (
            <p className="text-caption text-muted-foreground">
              Dividend yield: o recebido em {months} meses dividido pelo valor de hoje. Yield on
              cost: o mesmo recebido dividido pelo que você pagou. Ex.: R$ 60 sobre R$ 1.000 de hoje
              é 6%; se você pagou R$ 800, é 7,5% sobre o custo.
            </p>
          )}
        </>
      )}
    </>
  );
}
