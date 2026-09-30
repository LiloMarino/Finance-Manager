import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useSubportfolios } from "@/shared/hooks/use-subportfolios";

interface SubportfolioSelectProps {
  id: string;
  value: number | null;
  onChange: (subportfolioId: number | null) => void;
}

/** A subcarteira de um ativo ou de um título; nulo é "só na carteira geral". */
export function SubportfolioSelect({ id, value, onChange }: SubportfolioSelectProps) {
  const { data: subportfolios = [] } = useSubportfolios();
  const items = [
    { value: null, label: "Sem subcarteira" },
    ...subportfolios.map((subportfolio) => ({
      value: subportfolio.id,
      label: subportfolio.name,
    })),
  ];

  return (
    <Select items={items} value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
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
