import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  type PortfolioCategory,
  portfolioCategories,
  portfolioCategoryLabels,
} from "@/shared/lib/portfolio-category";

// Nulo é a carteira toda
const items = [
  { value: null, label: "Carteira toda" },
  ...portfolioCategories.map((category) => ({
    value: category,
    label: portfolioCategoryLabels[category],
  })),
];

interface CategorySelectProps {
  value: PortfolioCategory | undefined;
  onChange: (value: PortfolioCategory | undefined) => void;
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  return (
    <Select
      items={items}
      value={value ?? null}
      onValueChange={(selected) => onChange(selected ?? undefined)}
    >
      <SelectTrigger className="w-44" aria-label="Categoria">
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
