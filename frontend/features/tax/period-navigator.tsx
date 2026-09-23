import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";

import { formatMonth } from "@/features/tax/labels";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

export interface Period {
  year: number;
  month: number;
}

interface PeriodNavigatorProps {
  years: number[];
  year: number;
  /** Sem `month`, a navegação é por ano. */
  month?: number;
  onChange: (period: Period) => void;
}

function shift({ year, month }: Period, step: number, byMonth: boolean): Period {
  if (!byMonth) {
    return { year: year + step, month };
  }
  const index = year * 12 + (month - 1) + step;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export function PeriodNavigator({ years, year, month, onChange }: PeriodNavigatorProps) {
  const byMonth = month !== undefined;
  const current = { year, month: month ?? 1 };
  const previous = shift(current, -1, byMonth);
  const next = shift(current, 1, byMonth);
  const hasPrevious = previous.year >= (years.at(0) ?? year);
  const hasNext = next.year <= (years.at(-1) ?? year);

  // ← e → navegam pelo período, exceto quando o foco está num controle que já usa
  // as setas: campo de texto, abas e select
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        event.target.closest("input, textarea, [role=tablist], [role=combobox]")
      ) {
        return;
      }
      if (event.key === "ArrowLeft" && hasPrevious) onChange(previous);
      if (event.key === "ArrowRight" && hasNext) onChange(next);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasPrevious, hasNext, previous, next, onChange]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Período anterior"
        disabled={!hasPrevious}
        onClick={() => onChange(previous)}
      >
        <ChevronLeft />
      </Button>
      {byMonth && (
        <Select
          value={String(month)}
          onValueChange={(value) => onChange({ year, month: Number(value) })}
        >
          <SelectTrigger className="w-40" aria-label="Mês">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((item) => (
              <SelectItem key={item} value={String(item)}>
                {formatMonth(year, item).split(" ")[0]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Select
        value={String(year)}
        onValueChange={(value) => onChange({ year: Number(value), month: current.month })}
      >
        <SelectTrigger className="w-28" aria-label="Ano">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((item) => (
            <SelectItem key={item} value={String(item)}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Próximo período"
        disabled={!hasNext}
        onClick={() => onChange(next)}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
