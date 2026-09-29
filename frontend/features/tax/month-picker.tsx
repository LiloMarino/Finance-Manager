import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import type { Period } from "@/features/tax/tax-params";
import { Button } from "@/shared/components/ui/button";
import { monthLabels } from "@/shared/lib/months";

interface PickerProps {
  value: Period;
  /** Os anos navegáveis, em ordem. */
  years: number[];
  onSelect: (period: Period) => void;
}

/** Grade de meses com o ano navegável, como o seletor de mês do IR-Helper. */
export function MonthPicker({ value, years, onSelect }: PickerProps) {
  // O ano mostrado na grade; o mês só muda ao escolher
  const [year, setYear] = useState(value.year);
  const first = years.at(0) ?? year;
  const last = years.at(-1) ?? year;

  return (
    <div className="flex w-64 flex-col gap-2">
      {/* Ano */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Ano anterior"
          disabled={year <= first}
          onClick={() => setYear(year - 1)}
        >
          <ChevronLeft />
        </Button>
        <span className="text-sm font-medium">{year}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Próximo ano"
          disabled={year >= last}
          onClick={() => setYear(year + 1)}
        >
          <ChevronRight />
        </Button>
      </div>

      {/* Meses */}
      <div className="grid grid-cols-4 gap-1">
        {monthLabels.map((label, index) => {
          const month = index + 1;
          const selected = value.year === year && value.month === month;
          return (
            <Button
              key={label}
              variant={selected ? "default" : "ghost"}
              size="sm"
              aria-pressed={selected}
              onClick={() => onSelect({ year, month })}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

/** Grade dos anos navegáveis, para as visões do ano inteiro. */
export function YearPicker({ value, years, onSelect }: PickerProps) {
  return (
    <div className="grid w-64 grid-cols-4 gap-1">
      {years.map((year) => (
        <Button
          key={year}
          variant={year === value.year ? "default" : "ghost"}
          size="sm"
          aria-pressed={year === value.year}
          onClick={() => onSelect({ ...value, year })}
        >
          {year}
        </Button>
      ))}
    </div>
  );
}
