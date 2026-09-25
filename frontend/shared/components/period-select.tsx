import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { type PeriodChoice, isPreset, presetLabels } from "@/shared/lib/period";

interface PeriodSelectProps {
  value: PeriodChoice;
  onChange: (value: PeriodChoice) => void;
}

export function PeriodSelect({ value, onChange }: PeriodSelectProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={0}
        value={value.preset}
        onValueChange={(preset) => {
          if (isPreset(preset)) onChange({ ...value, preset });
        }}
      >
        {Object.entries(presetLabels).map(([preset, label]) => (
          <ToggleGroupItem key={preset} value={preset}>
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {/* Intervalo livre */}
      {value.preset === "custom" && (
        <>
          <Field className="w-40">
            <FieldLabel htmlFor="period-start">De</FieldLabel>
            <Input
              id="period-start"
              type="date"
              value={value.start ?? ""}
              onChange={(event) =>
                onChange({ ...value, start: event.target.value || undefined })
              }
            />
          </Field>
          <Field className="w-40">
            <FieldLabel htmlFor="period-end">Até</FieldLabel>
            <Input
              id="period-end"
              type="date"
              value={value.end ?? ""}
              onChange={(event) =>
                onChange({ ...value, end: event.target.value || undefined })
              }
            />
          </Field>
        </>
      )}
    </div>
  );
}
