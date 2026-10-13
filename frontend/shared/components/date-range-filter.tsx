import { CalendarDays } from "lucide-react";
import { useState } from "react";

import { DateRangePanel } from "@/shared/components/date-range-panel";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { type DayRange, rangeLabel } from "@/shared/lib/period";

interface DateRangeFilterProps {
  value: DayRange;
  onChange: (range: DayRange) => void;
}

/** O filtro de datas das tabelas: "Qualquer data" até escolher; com intervalo
aplicado, o botão mostra as datas e fica marcado. */
export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const label = rangeLabel(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant={label ? "outline-active" : "outline"}
            className="w-56 justify-start font-normal"
          >
            <CalendarDays className="text-muted-foreground" />
            {label ?? "Qualquer data"}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-auto p-0">
        <DateRangePanel
          value={value}
          onApply={(range) => {
            onChange(range);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
