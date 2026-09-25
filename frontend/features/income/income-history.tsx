import { Pencil } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { DeleteIncomeDialog } from "@/features/income/delete-income-dialog";
import { netHint } from "@/features/income/hints";
import { IncomeFormDialog } from "@/features/income/income-form-dialog";
import {
  type IncomeEvent,
  type IncomeFilters,
  useIncome,
} from "@/features/income/use-income";
import { AssetSelect } from "@/shared/components/asset-select";
import { CategorySelect } from "@/shared/components/category-select";
import { MetricHint } from "@/shared/components/metric-hint";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
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
import { assetClassLabels, incomeTypeLabels, isIncomeType } from "@/shared/lib/labels";
import { formatBRL, formatQuantity } from "@/types/decimal";

// O Select do Radix reserva o valor vazio para "nada escolhido"
const ALL = "all";

function Filters({
  filters,
  onChange,
}: {
  filters: IncomeFilters;
  onChange: (filters: IncomeFilters) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:items-end">
      <Field>
        <FieldLabel htmlFor="income-filter-asset">Ativo</FieldLabel>
        <AssetSelect
          id="income-filter-asset"
          allLabel="Todos"
          value={filters.asset_id ? String(filters.asset_id) : ""}
          onChange={(value) =>
            onChange({ ...filters, asset_id: value ? Number(value) : undefined })
          }
        />
      </Field>
      <Field>
        <FieldLabel>Categoria</FieldLabel>
        <CategorySelect
          value={filters.category ?? undefined}
          onChange={(category) => onChange({ ...filters, category })}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="income-filter-type">Tipo</FieldLabel>
        <Select
          value={filters.income_type ?? ALL}
          onValueChange={(value) =>
            onChange({ ...filters, income_type: isIncomeType(value) ? value : undefined })
          }
        >
          <SelectTrigger id="income-filter-type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            {Object.entries(incomeTypeLabels).map(([type, label]) => (
              <SelectItem key={type} value={type}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="income-filter-start">De</FieldLabel>
        <Input
          id="income-filter-start"
          type="date"
          value={filters.start ?? ""}
          onChange={(event) => onChange({ ...filters, start: event.target.value || undefined })}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="income-filter-end">Até</FieldLabel>
        <Input
          id="income-filter-end"
          type="date"
          value={filters.end ?? ""}
          onChange={(event) => onChange({ ...filters, end: event.target.value || undefined })}
        />
      </Field>
      <Button variant="ghost" onClick={() => onChange({})}>
        Limpar filtros
      </Button>
    </div>
  );
}

function IncomeTable({ events }: { events: IncomeEvent[] }) {
  if (events.length === 0) {
    return <p className="text-muted-foreground">Nenhum provento encontrado.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pagamento</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Ativo</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead className="text-right">Quantidade</TableHead>
          <TableHead className="text-right">Bruto por unidade</TableHead>
          <TableHead className="text-right">Líquido</TableHead>
          <TableHead className="w-24" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id}>
            <TableCell className="tabular-nums">{formatDate(event.payment_date)}</TableCell>
            <TableCell>{assetClassLabels[event.asset_class]}</TableCell>
            <TableCell className="font-medium">
              <Link to={`/assets/${event.asset_id}`} className="hover:underline">
                {event.ticker}
              </Link>
            </TableCell>
            <TableCell>{incomeTypeLabels[event.income_type]}</TableCell>
            <TableCell className="text-right tabular-nums">
              {formatQuantity(event.quantity)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatBRL(event.unit_price)}
            </TableCell>
            <TableCell className="text-right tabular-nums">{formatBRL(event.amount)}</TableCell>
            <TableCell className="text-right">
              <IncomeFormDialog
                event={event}
                trigger={
                  <Button variant="ghost" size="icon-sm" aria-label="Editar provento">
                    <Pencil />
                  </Button>
                }
              />
              <DeleteIncomeDialog event={event} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function IncomeHistory() {
  const [filters, setFilters] = useState<IncomeFilters>({});
  const { data, isPending, error } = useIncome(filters);

  return (
    <div className="flex flex-col gap-6">
      <Filters filters={filters} onChange={setFilters} />

      {isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <MetricHint hint={netHint}>
              <span className="text-muted-foreground text-sm">
                Total recebido · {data.events.length} proventos
              </span>
            </MetricHint>
            <span className="text-2xl font-semibold tabular-nums">
              {formatBRL(data.total)}
            </span>
          </div>
          <IncomeTable events={data.events} />
        </>
      )}
    </div>
  );
}
