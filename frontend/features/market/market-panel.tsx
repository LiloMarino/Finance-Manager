import { useQuery } from "@tanstack/react-query";

import { Money } from "@/shared/components/money";
import { ColorSwatch } from "@/shared/components/color-swatch";
import { TickerLabel } from "@/shared/components/ticker-label";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { get, getApiErrorMessage } from "@/shared/lib/api";
import { formatDate } from "@/shared/lib/format";
import { monthLabel } from "@/shared/lib/months";
import { queryKeys } from "@/shared/lib/query-keys";
import { formatQuantity, formatRate } from "@/types/decimal";
import type { components } from "@/types/openapi.generated";

type LatestIndex = components["schemas"]["LatestIndexDTO"];

const seriesConfig: Record<LatestIndex["series"], { label: string; color: string }> = {
  cdi: { label: "CDI", color: "var(--ref-cdi)" },
  selic: { label: "Selic", color: "var(--ink-3)" },
  ipca: { label: "IPCA", color: "var(--ref-ipca)" },
  ibov: { label: "IBOV", color: "var(--ref-ibov)" },
};

/** O último valor de cada série na unidade dela, com o equivalente anual ao lado. */
function SeriesValue({ index }: { index: LatestIndex }) {
  if (!index.value) return <>—</>;
  const muted = "text-caption text-muted-foreground";
  switch (index.series) {
    case "cdi":
    case "selic":
      return (
        <>
          {index.annual ? `${formatRate(index.annual)}% ao ano` : "—"}
          <span className={muted}> · {formatQuantity(index.value)}% ao dia</span>
        </>
      );
    case "ipca":
      return (
        <>
          {formatQuantity(index.value)}% no mês
          {index.annual && (
            <span className={muted}> · {formatRate(index.annual)}% em 12 meses</span>
          )}
        </>
      );
    case "ibov":
      return <>{formatQuantity(index.value)} pontos</>;
  }
}

/** A data do último dado: o IPCA sai por mês, o resto por dia. */
function seriesDate(index: LatestIndex): string {
  if (!index.rate_date) return "sem dado";
  if (index.series !== "ipca") return formatDate(index.rate_date);
  const [year, month] = index.rate_date.split("-");
  return monthLabel(Number(year), Number(month));
}

/** A aba Mercado: o último fechamento de cada ativo e o último valor de cada série. */
export function MarketPanel() {
  const prices = useQuery({
    queryKey: queryKeys.prices,
    queryFn: () => get("/api/market/prices"),
  });
  const indexes = useQuery({
    queryKey: queryKeys.indexes,
    queryFn: () => get("/api/market/indexes"),
  });

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      {/* Cotações */}
      <Card>
        <CardHeader>
          <CardTitle>Cotações</CardTitle>
          <CardAction>
            <span className="text-caption text-muted-foreground">
              Último fechamento de cada ativo
            </span>
          </CardAction>
        </CardHeader>
        <CardContent data-flush>
          {prices.isPending ? (
            <Skeleton className="h-40 w-full" />
          ) : prices.error ? (
            <span className="text-destructive px-5">{getApiErrorMessage(prices.error)}</span>
          ) : prices.data.length === 0 ? (
            <p className="text-muted-foreground px-5">
              Nenhum ativo com operação cadastrada ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="text-right">Fechamento</TableHead>
                  <TableHead className="text-right">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prices.data.map((price) => (
                  <TableRow key={price.asset_id}>
                    <TableCell>
                      <TickerLabel
                        ticker={price.ticker}
                        category={price.asset_class}
                        to={`/assets/${price.asset_id}`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {price.close ? <Money value={price.close} /> : "—"}
                    </TableCell>
                    <TableCell variant="muted" className="text-right">
                      {price.price_date ? formatDate(price.price_date) : "sem cotação"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Séries */}
      <Card>
        <CardHeader>
          <CardTitle>Juros, inflação e índice</CardTitle>
          <CardAction>
            <span className="text-caption text-muted-foreground">Banco Central e B3</span>
          </CardAction>
        </CardHeader>
        <CardContent data-flush>
          {indexes.isPending ? (
            <Skeleton className="h-24 w-full" />
          ) : indexes.error ? (
            <span className="text-destructive px-5">{getApiErrorMessage(indexes.error)}</span>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Série</TableHead>
                  <TableHead className="text-right">Último valor</TableHead>
                  <TableHead className="text-right">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {indexes.data.map((index) => (
                  <TableRow key={index.series}>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <ColorSwatch color={seriesConfig[index.series].color} />
                        {seriesConfig[index.series].label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <SeriesValue index={index} />
                    </TableCell>
                    <TableCell variant="muted" className="text-right">
                      {seriesDate(index)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
