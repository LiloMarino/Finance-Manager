import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";

interface YearToggleProps {
  /** Os anos disponíveis, do mais antigo ao mais novo */
  years: number[];
  year: number;
  onChange: (year: number) => void;
}

/** Os anos como botões, do mais novo para o mais antigo. */
export function YearToggle({ years, year, onChange }: YearToggleProps) {
  return (
    <ToggleGroup
      variant="segmented"
      size="sm"
      aria-label="Ano"
      value={[String(year)]}
      onValueChange={([next]) => {
        if (next) onChange(Number(next));
      }}
    >
      {years.toReversed().map((item) => (
        <ToggleGroupItem key={item} value={String(item)}>
          {item}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
