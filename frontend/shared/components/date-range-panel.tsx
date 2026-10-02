import { useState } from "react";
import { ptBR } from "react-day-picker/locale";

import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Input } from "@/shared/components/ui/input";
import {
  type DayRange,
  daysInRange,
  isoDate,
  localDay,
  parseTypedDay,
  rangePresets,
} from "@/shared/lib/period";
import { cn } from "@/shared/lib/utils";

function typed(iso: string | undefined): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

interface DateRangePanelProps {
  value: DayRange;
  onApply: (range: DayRange) => void;
}

/** O painel de escolher datas: atalhos à esquerda, dois meses de calendário e os
campos para digitar. O primeiro clique marca o início e o segundo, o fim. */
export function DateRangePanel({ value, onApply }: DateRangePanelProps) {
  const [draft, setDraft] = useState<DayRange>(value);
  const [startText, setStartText] = useState(typed(value.start));
  const [endText, setEndText] = useState(typed(value.end));
  const presets = rangePresets(new Date());
  const activePreset = presets.find(
    (preset) => preset.range.start === draft.start && preset.range.end === draft.end,
  );

  const choose = (range: DayRange) => {
    setDraft(range);
    setStartText(typed(range.start));
    setEndText(typed(range.end));
  };

  return (
    <div className="flex">
      {/* Atalhos */}
      <div className="border-border flex min-w-40 flex-col gap-0.5 border-r p-3">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant={preset === activePreset ? "secondary" : "ghost"}
            size="sm"
            className="justify-start"
            onClick={() => choose(preset.range)}
          >
            {preset.label}
          </Button>
        ))}
        <span
          className={cn(
            "text-caption rounded-md px-2.5 py-1",
            !activePreset && draft.start ? "bg-muted text-foreground" : "text-muted-foreground",
          )}
        >
          Personalizado
        </span>
      </div>

      <div className="flex flex-col">
        {/* Calendário */}
        <Calendar
          mode="range"
          numberOfMonths={2}
          locale={ptBR}
          defaultMonth={draft.start ? localDay(draft.start) : undefined}
          selected={
            draft.start
              ? { from: localDay(draft.start), to: draft.end ? localDay(draft.end) : undefined }
              : undefined
          }
          onSelect={(range) =>
            choose({
              start: range?.from ? isoDate(range.from) : undefined,
              end: range?.to ? isoDate(range.to) : undefined,
            })
          }
          className="px-5 py-4"
        />

        {/* Datas digitadas e ações */}
        <div className="border-border flex items-center gap-3 border-t px-5 py-3">
          <Input
            aria-label="Início"
            placeholder="DD/MM/AAAA"
            className="h-7 w-32"
            value={startText}
            onChange={(event) => setStartText(event.target.value)}
            onBlur={() => {
              const start = parseTypedDay(startText);
              if (start) setDraft((current) => ({ ...current, start }));
            }}
          />
          <span className="text-muted-foreground">a</span>
          <Input
            aria-label="Fim"
            placeholder="DD/MM/AAAA"
            className="h-7 w-32"
            value={endText}
            onChange={(event) => setEndText(event.target.value)}
            onBlur={() => {
              const end = parseTypedDay(endText);
              if (end) setDraft((current) => ({ ...current, end }));
            }}
          />
          {draft.start && draft.end && (
            <span className="text-caption text-muted-foreground">
              {daysInRange({ start: draft.start, end: draft.end })} dias
            </span>
          )}
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => onApply({})}>
            Limpar
          </Button>
          <Button size="sm" disabled={!draft.start} onClick={() => onApply(draft)}>
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
}
