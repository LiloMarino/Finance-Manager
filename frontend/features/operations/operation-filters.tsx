import { hasFilters } from "@/features/operations/filter-params";
import type { OperationFilters as Filters } from "@/features/operations/use-operations";
import { AssetCombobox } from "@/shared/components/asset-combobox";
import { DateRangeFilter } from "@/shared/components/date-range-filter";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { operationTypeLabels, operationTypes } from "@/shared/lib/labels";
import type { DayRange } from "@/shared/lib/period";

// Nulo é todos os tipos
const typeItems = [
  { value: null, label: "Todos os tipos" },
  ...operationTypes.map((type) => ({ value: type, label: operationTypeLabels[type] })),
];

interface OperationFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function OperationFilters({ filters, onChange }: OperationFiltersProps) {
  const dateRange: DayRange = {
    start: filters.start ?? undefined,
    end: filters.end ?? undefined,
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-56">
        <AssetCombobox
          allLabel="Todos os ativos"
          value={filters.asset_id ? String(filters.asset_id) : ""}
          onChange={(value) =>
            onChange({ ...filters, asset_id: value ? Number(value) : undefined })
          }
        />
      </div>
      <Select
        items={typeItems}
        value={filters.operation_type ?? null}
        onValueChange={(value) => onChange({ ...filters, operation_type: value ?? undefined })}
      >
        <SelectTrigger size="sm" className="w-48" aria-label="Tipo">
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
      <DateRangeFilter
        value={dateRange}
        onChange={(range) => onChange({ ...filters, start: range.start, end: range.end })}
      />
      {hasFilters(filters) && (
        <Button variant="ghost" size="sm" onClick={() => onChange({})}>
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
