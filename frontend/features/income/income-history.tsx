import { type ReactNode } from "react";
import * as React from "react";

import { DeleteIncomeDialog } from "@/features/income/delete-income-dialog";
import { IncomeFormDialog } from "@/features/income/income-form-dialog";
import { type IncomeFilters, useIncome } from "@/features/income/use-income";
import { AssetCombobox } from "@/shared/components/asset-combobox";
import { DateRangeFilter } from "@/shared/components/date-range-filter";
import { Money, Quantity } from "@/shared/components/money";
import { TickerLabel } from "@/shared/components/ticker-label";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { getApiErrorMessage } from "@/shared/lib/api";
import { formatDate } from "@/shared/lib/format";
import { incomeTypeLabels, incomeTypes } from "@/shared/lib/labels";
import { type DayRange } from "@/shared/lib/period";
import type { PortfolioCategory } from "@/shared/lib/portfolio-category";

// Nulo é todos os tipos
const typeItems = [
  { value: null, label: "Todos os tipos" },
  ...incomeTypes.map((type) => ({ value: type, label: incomeTypeLabels[type] })),
];

interface IncomeHistoryProps {
  subportfolioId?: number;
  category?: PortfolioCategory;
  /** Filtros da tela, antes do filtro de ativo e tipo */
  filters?: ReactNode;
}

/** Histórico de proventos recebidos: tabela editável com ações. */
export function IncomeHistory({ subportfolioId, category, filters }: IncomeHistoryProps) {
  const [localFilters, setLocalFilters] = React.useState<IncomeFilters>({});
  const [dateRange, setDateRange] = React.useState<DayRange>({});

  const { data, isPending, error } = useIncome({
    ...localFilters,
    category,
    subportfolio_id: subportfolioId,
    start: dateRange.start,
    end: dateRange.end,
  });

  const hasFilters = Object.keys(localFilters).length > 0 || dateRange.start || dateRange.end;

  return (
    <>
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        {filters}
        <Field>
          <FieldLabel htmlFor="income-filter-asset" className="sr-only">
            Ativo
          </FieldLabel>
          <AssetCombobox
            id="income-filter-asset"
            allLabel="Todos os ativos"
            value={localFilters.asset_id ? String(localFilters.asset_id) : ""}
            onChange={(value) =>
              setLocalFilters({ ...localFilters, asset_id: value ? Number(value) : undefined })
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="income-filter-type" className="sr-only">
            Tipo
          </FieldLabel>
          <Select
            items={typeItems}
            value={localFilters.income_type ?? null}
            onValueChange={(value) =>
              setLocalFilters({ ...localFilters, income_type: value ?? undefined })
            }
          >
            <SelectTrigger id="income-filter-type" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typeItems.map((item) => (
                <SelectItem key={item.label} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setLocalFilters({});
              setDateRange({});
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {isPending ? (
        <Skeleton className="h-72 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : data.events.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
            <CardAction>
              <CardDescription>
                {data.events.length} {data.events.length === 1 ? "provento" : "proventos"} ·{" "}
                <Money value={data.total} />
              </CardDescription>
            </CardAction>
          </CardHeader>
          <CardContent data-flush>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Bruto por unidade</TableHead>
                  <TableHead className="text-right">Líquido</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="text-right tabular-nums">
                      {formatDate(event.payment_date)}
                    </TableCell>
                    <TableCell>
                      <TickerLabel
                        ticker={event.ticker}
                        category={event.asset_class}
                        to={`/assets/${event.asset_id}`}
                      />
                    </TableCell>
                    <TableCell>{incomeTypeLabels[event.income_type]}</TableCell>
                    <TableCell className="text-right">
                      <Quantity value={event.quantity} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Money value={event.unit_price} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Money value={event.amount} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <IncomeFormDialog
                          event={event}
                          trigger={
                            <Button variant="ghost" size="icon-sm" aria-label="Editar provento" />
                          }
                        />
                        <DeleteIncomeDialog event={event} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
      {!isPending && !error && data.events.length === 0 && (
        <p className="text-caption text-muted-foreground">Nenhum provento encontrado.</p>
      )}
    </>
  );
}
