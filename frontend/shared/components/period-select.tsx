import { CalendarDays } from "lucide-react";
import { useState } from "react";

import { DateRangePanel } from "@/shared/components/date-range-panel";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import {
  type PeriodChoice,
  isPreset,
  periodShortcuts,
  presetLabels,
  rangeLabel,
} from "@/shared/lib/period";

interface PeriodSelectProps {
  value: PeriodChoice;
  onChange: (value: PeriodChoice) => void;
}

/** O período das telas de gráfico: os atalhos e, no fim, o calendário. Com um
intervalo escolhido, ele mostra as datas e os atalhos ficam desmarcados. */
export function PeriodSelect({ value, onChange }: PeriodSelectProps) {
  const [open, setOpen] = useState(false);
  const custom = value.preset === "custom" ? rangeLabel(value) : null;

  return (
    <div className="flex items-center gap-1">
      <ToggleGroup
        variant="segmented"
        size="sm"
        aria-label="Período"
        value={custom ? [] : [value.preset]}
        onValueChange={([preset]) => {
          if (preset && isPreset(preset)) onChange({ preset });
        }}
      >
        {periodShortcuts.map((preset) => (
          <ToggleGroupItem key={preset} value={preset}>
            {presetLabels[preset]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {/* Intervalo livre */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant={custom ? "outline-active" : "ghost"}
              size={custom ? "sm" : "icon-sm"}
              aria-label="Escolher as datas"
            >
              <CalendarDays />
              {custom}
            </Button>
          }
        />
        <PopoverContent align="end" className="w-auto p-0">
          <DateRangePanel
            value={value.preset === "custom" ? value : {}}
            onApply={(range) => {
              onChange(
                range.start || range.end ? { preset: "custom", ...range } : { preset: "12m" },
              );
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
