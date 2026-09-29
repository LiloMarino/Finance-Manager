import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { AssetClassBadge } from "@/shared/components/asset-class-badge";
import { Button } from "@/shared/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { useAssets } from "@/shared/hooks/use-assets";

interface AssetComboboxProps {
  /** Id do ativo como texto; vazio é nenhum. */
  value: string;
  onChange: (value: string) => void;
  id?: string;
  /** Rótulo da opção que limpa a escolha, nos filtros. */
  allLabel?: string;
}

/** Escolha de um ativo cadastrado, com busca pelo ticker atual ou por um antigo. */
export function AssetCombobox({ value, onChange, id, allLabel }: AssetComboboxProps) {
  const [open, setOpen] = useState(false);
  const { data: assets = [] } = useAssets();
  const selected = assets.find((asset) => String(asset.id) === value);

  const choose = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selected ? (
            selected.ticker
          ) : (
            <span className={allLabel ? "" : "text-muted-foreground"}>
              {allLabel ?? "Escolha o ativo"}
            </span>
          )}
          <ChevronsUpDown className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar ticker" />
          <CommandList>
            <CommandEmpty>Nenhum ativo com esse ticker.</CommandEmpty>
            <CommandGroup>
              {allLabel && (
                <CommandItem value={allLabel} data-checked={!selected} onSelect={() => choose("")}>
                  {allLabel}
                </CommandItem>
              )}
              {assets.map((asset) => (
                <CommandItem
                  key={asset.id}
                  value={asset.ticker}
                  keywords={asset.previous_tickers.map((item) => item.ticker)}
                  data-checked={asset === selected}
                  onSelect={() => choose(String(asset.id))}
                >
                  {asset.ticker}
                  <span className="ml-auto">
                    <AssetClassBadge assetClass={asset.asset_class} />
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
