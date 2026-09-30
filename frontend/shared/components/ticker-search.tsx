import { useQuery } from "@tanstack/react-query";
import { type KeyboardEvent, useRef, useState } from "react";

import { Command, CommandGroup, CommandItem, CommandList } from "@/shared/components/ui/command";
import { Input } from "@/shared/components/ui/input";
import { Popover, PopoverContent } from "@/shared/components/ui/popover";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { get } from "@/shared/lib/api";
import { maskTicker } from "@/shared/lib/mask";

// A fonte só é consultada a partir deste tamanho, como no backend
const MIN_QUERY = 2;

interface TickerSearchProps {
  id?: string;
  /** O texto do campo, já com a máscara de ticker. */
  value: string;
  onChange: (value: string) => void;
  /** Quem acumula tickers (lista de chips) recebe o escolhido aqui, e o Enter vale
  também para o texto digitado. Sem ele, a sugestão escolhida vira o valor. */
  onPick?: (ticker: string) => void;
  placeholder?: string;
}

/** Campo de ticker livre, com as sugestões da busca do yfinance enquanto se digita.
A sugestão ajuda e não restringe: o texto digitado continua valendo. */
export function TickerSearch({ id, value, onChange, onPick, placeholder }: TickerSearchProps) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState("");
  const anchor = useRef<HTMLInputElement>(null);
  const query = useDebouncedValue(value, 300);
  const { data: matches = [] } = useQuery({
    queryKey: ["ticker-search", query],
    queryFn: () => get("/api/market/tickers", { query: { q: query } }),
    enabled: query.length >= MIN_QUERY,
    staleTime: Infinity,
  });
  const visible = open && value.length >= MIN_QUERY && matches.length > 0;

  const pick = (ticker: string) => {
    if (onPick) {
      onPick(ticker);
    } else {
      onChange(ticker);
    }
    setOpen(false);
  };

  // As setas percorrem as sugestões e o Enter escolhe a destacada; o foco fica no
  // campo o tempo todo
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const index = matches.findIndex((match) => match.ticker === highlight);
    if (visible && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      const next = matches[(index + step + matches.length) % matches.length];
      if (next) setHighlight(next.ticker);
    } else if (event.key === "Enter" && visible && index >= 0) {
      event.preventDefault();
      pick(highlight);
    } else if (event.key === "Enter" && onPick && value) {
      event.preventDefault();
      pick(value);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <Popover open={visible} onOpenChange={setOpen}>
      <Input
        ref={anchor}
        id={id}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => {
          onChange(maskTicker(event.target.value));
          setHighlight("");
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        onBlur={() => setOpen(false)}
      />
      <PopoverContent
        anchor={anchor}
        className="w-(--anchor-width) min-w-64 p-0"
        align="start"
        initialFocus={false}
        finalFocus={false}
        // O mousedown na lista não tira o foco do campo: o clique escolhe a sugestão
        // antes de o blur fechar a lista
        onMouseDown={(event) => event.preventDefault()}
      >
        <Command shouldFilter={false} value={highlight} onValueChange={setHighlight}>
          <CommandList>
            <CommandGroup>
              {matches.map((match) => (
                <CommandItem key={match.ticker} value={match.ticker} onSelect={pick}>
                  <span className="font-medium">{match.ticker}</span>
                  <span className="text-muted-foreground truncate text-xs">{match.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
