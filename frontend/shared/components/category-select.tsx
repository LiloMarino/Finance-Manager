import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  type PortfolioCategory,
  isPortfolioCategory,
  portfolioCategories,
  portfolioCategoryLabels,
} from "@/shared/lib/portfolio-category";

// O Select do Radix reserva o valor vazio para "nada escolhido"
const ALL = "all";

interface CategorySelectProps {
  value: PortfolioCategory | undefined;
  onChange: (value: PortfolioCategory | undefined) => void;
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  return (
    <Select
      value={value ?? ALL}
      onValueChange={(selected) => onChange(isPortfolioCategory(selected) ? selected : undefined)}
    >
      <SelectTrigger className="w-44" aria-label="Categoria">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>Carteira toda</SelectItem>
        {portfolioCategories.map((category) => (
          <SelectItem key={category} value={category}>
            {portfolioCategoryLabels[category]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
