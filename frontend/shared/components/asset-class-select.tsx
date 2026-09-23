import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  type AssetClass,
  assetClasses,
  assetClassLabels,
  isAssetClass,
} from "@/shared/lib/labels";

interface AssetClassSelectProps {
  value: AssetClass;
  onChange: (value: AssetClass) => void;
  id?: string;
}

export function AssetClassSelect({ value, onChange, id }: AssetClassSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (isAssetClass(next)) onChange(next);
      }}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {assetClasses.map((assetClass) => (
          <SelectItem key={assetClass} value={assetClass}>
            {assetClassLabels[assetClass]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
