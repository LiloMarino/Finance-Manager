import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useSubportfolios } from "@/shared/hooks/use-subportfolios";

const NONE = "none";

interface SubportfolioSelectProps {
  id: string;
  value: number | null;
  onChange: (subportfolioId: number | null) => void;
}

/** A subcarteira de um ativo ou de um título; nulo é "só na carteira geral". */
export function SubportfolioSelect({ id, value, onChange }: SubportfolioSelectProps) {
  const { data: subportfolios = [] } = useSubportfolios();

  return (
    <Select
      value={value === null ? NONE : String(value)}
      onValueChange={(next) => onChange(next === NONE ? null : Number(next))}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>Sem subcarteira</SelectItem>
        {subportfolios.map((subportfolio) => (
          <SelectItem key={subportfolio.id} value={String(subportfolio.id)}>
            {subportfolio.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
