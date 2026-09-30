import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { Subportfolio } from "@/shared/hooks/use-subportfolios";

interface PortfolioSelectProps {
  subportfolios: Subportfolio[];
  value: number | undefined;
  onChange: (subportfolioId: number | undefined) => void;
}

/** A carteira que as visões de carteira mostram: a geral ou uma subcarteira. */
export function PortfolioSelect({ subportfolios, value, onChange }: PortfolioSelectProps) {
  // Nulo é a carteira geral
  const items = [
    { value: null, label: "Carteira geral" },
    ...subportfolios.map((subportfolio) => ({
      value: subportfolio.id,
      label: subportfolio.name,
    })),
  ];

  return (
    <Select
      items={items}
      value={value ?? null}
      onValueChange={(next) => onChange(next ?? undefined)}
    >
      <SelectTrigger className="w-52" aria-label="Carteira">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.label} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
