import { hasFilters } from "@/features/operations/filter-params";
import type { OperationFilters as Filters } from "@/features/operations/use-operations";
import { AssetCombobox } from "@/shared/components/asset-combobox";
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
import { isOperationType, operationTypeLabels } from "@/shared/lib/labels";

// O Select do Radix reserva o valor vazio para "nada escolhido"
const ALL = "all";

interface OperationFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function OperationFilters({ filters, onChange }: OperationFiltersProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end">
      <Field>
        <FieldLabel htmlFor="filter-asset">Ativo</FieldLabel>
        <AssetCombobox
          id="filter-asset"
          allLabel="Todos"
          value={filters.asset_id ? String(filters.asset_id) : ""}
          onChange={(value) =>
            onChange({ ...filters, asset_id: value ? Number(value) : undefined })
          }
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="filter-type">Tipo</FieldLabel>
        <Select
          value={filters.operation_type ?? ALL}
          onValueChange={(value) =>
            onChange({
              ...filters,
              operation_type: isOperationType(value) ? value : undefined,
            })
          }
        >
          <SelectTrigger id="filter-type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            {Object.entries(operationTypeLabels).map(([type, label]) => (
              <SelectItem key={type} value={type}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="filter-start">De</FieldLabel>
        <Input
          id="filter-start"
          type="date"
          value={filters.start ?? ""}
          onChange={(event) =>
            onChange({ ...filters, start: event.target.value || undefined })
          }
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="filter-end">Até</FieldLabel>
        <Input
          id="filter-end"
          type="date"
          value={filters.end ?? ""}
          onChange={(event) =>
            onChange({ ...filters, end: event.target.value || undefined })
          }
        />
      </Field>
      {hasFilters(filters) && (
        <Button variant="link" size="sm" className="justify-self-start" onClick={() => onChange({})}>
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
