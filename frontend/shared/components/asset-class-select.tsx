import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { type AssetClass, assetClasses, assetClassLabels, isAssetClass } from "@/shared/lib/labels";

const items = assetClasses.map((assetClass) => ({
  value: assetClass,
  label: assetClassLabels[assetClass],
}));

interface AssetClassSelectProps {
  value: AssetClass;
  onChange: (value: AssetClass) => void;
  id?: string;
}

export function AssetClassSelect({ value, onChange, id }: AssetClassSelectProps) {
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(next) => {
        if (next !== null && isAssetClass(next)) onChange(next);
      }}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
