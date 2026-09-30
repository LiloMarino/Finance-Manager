import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { formatMonth } from "@/features/tax/labels";
import { MonthPicker, YearPicker } from "@/features/tax/month-picker";
import type { Period } from "@/features/tax/tax-params";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";

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

/** ‹ período › : as setas andam um mês (ou um ano), e o botão do meio abre a grade
para escolher. */
export function PeriodNavigator({ years, year, month, onChange }: PeriodNavigatorProps) {
  const [open, setOpen] = useState(false);
  const byMonth = month !== undefined;
  const current = { year, month: month ?? 1 };
  const previous = shift(current, -1, byMonth);
  const next = shift(current, 1, byMonth);
  const hasPrevious = previous.year >= (years.at(0) ?? year);
  const hasNext = next.year <= (years.at(-1) ?? year);

  // ← e → navegam pelo período, exceto quando o foco está num controle que já usa
  // as setas: campo de texto, abas, select e a grade aberta
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        event.target.closest("input, textarea, [role=tablist], [role=combobox], [role=dialog]")
      ) {
        return;
      }
      if (event.key === "ArrowLeft" && hasPrevious) onChange(previous);
      if (event.key === "ArrowRight" && hasNext) onChange(next);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasPrevious, hasNext, previous, next, onChange]);

  const choose = (period: Period) => {
    onChange(period);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Período anterior"
        disabled={!hasPrevious}
        onClick={() => onChange(previous)}
      >
        <ChevronLeft />
      </Button>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={<Button variant="outline" className="min-w-48" aria-label="Escolher o período" />}
        >
          {byMonth ? formatMonth(year, current.month) : year}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          {byMonth ? (
            <MonthPicker value={current} years={years} onSelect={choose} />
          ) : (
            <YearPicker value={current} years={years} onSelect={choose} />
          )}
        </PopoverContent>
      </Popover>
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
