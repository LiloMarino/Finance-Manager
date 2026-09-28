import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { Subportfolio } from "@/shared/hooks/use-subportfolios";

// O Select do Radix reserva o valor vazio para "nada escolhido"
const GENERAL = "general";

interface PortfolioSelectProps {
  subportfolios: Subportfolio[];
  value: number | undefined;
  onChange: (subportfolioId: number | undefined) => void;
}

/** A carteira que as visões de carteira mostram: a geral ou uma subcarteira. */
export function PortfolioSelect({ subportfolios, value, onChange }: PortfolioSelectProps) {
  return (
    <Select
      value={value === undefined ? GENERAL : String(value)}
      onValueChange={(next) => onChange(next === GENERAL ? undefined : Number(next))}
    >
      <SelectTrigger className="w-52" aria-label="Carteira">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={GENERAL}>Carteira geral</SelectItem>
        {subportfolios.map((subportfolio) => (
          <SelectItem key={subportfolio.id} value={String(subportfolio.id)}>
            {subportfolio.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
