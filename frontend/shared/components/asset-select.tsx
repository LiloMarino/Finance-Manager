import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useAssets } from "@/shared/hooks/use-assets";

// O Select do Radix reserva o valor vazio para "nada escolhido"
const ALL = "all";

interface AssetSelectProps {
  /** Id do ativo como texto, que é o que o Select guarda; vazio é nenhum. */
  value: string;
  onChange: (value: string) => void;
  id?: string;
  /** Rótulo da opção que limpa a escolha, nos filtros. */
  allLabel?: string;
}

export function AssetSelect({ value, onChange, id, allLabel }: AssetSelectProps) {
  const { data: assets = [] } = useAssets();

  return (
    <Select
      value={value || (allLabel ? ALL : "")}
      onValueChange={(next) => onChange(next === ALL ? "" : next)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Escolha o ativo" />
      </SelectTrigger>
      <SelectContent>
        {allLabel && <SelectItem value={ALL}>{allLabel}</SelectItem>}
        {assets.map((asset) => (
          <SelectItem key={asset.id} value={String(asset.id)}>
            {asset.ticker}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
