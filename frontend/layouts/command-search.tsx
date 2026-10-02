import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { dataItem, navGroups } from "@/layouts/navigation";
import { TickerLabel } from "@/shared/components/ticker-label";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import { Kbd } from "@/shared/components/ui/kbd";
import { SidebarMenuButton } from "@/shared/components/ui/sidebar";
import { useAssets } from "@/shared/hooks/use-assets";
import { useFixedIncomeList } from "@/shared/hooks/use-fixed-income-list";

const screens = [...navGroups.flatMap((group) => group.items), dataItem];

/** "Buscar tela ou ativo": abre com Ctrl+K e leva a uma tela, a um ativo ou a um
título. */
export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: assets = [] } = useAssets();
  const { data: fixedIncome = [] } = useFixedIncomeList();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = (to: string) => {
    setOpen(false);
    void navigate(to);
  };

  return (
    <>
      <SidebarMenuButton
        variant="outline"
        tooltip="Buscar tela ou ativo"
        onClick={() => setOpen(true)}
      >
        <Search />
        <span className="text-muted-foreground truncate">Buscar tela ou ativo</span>
        <Kbd className="ml-auto whitespace-nowrap group-data-[collapsible=icon]:hidden">Ctrl K</Kbd>
      </SidebarMenuButton>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Buscar"
        description="Uma tela, um ativo ou um título de renda fixa"
      >
        <CommandInput placeholder="Tela, ticker ou título" />
        <CommandList>
          <CommandEmpty>Nada encontrado.</CommandEmpty>
          {/* Telas */}
          <CommandGroup heading="Telas">
            {screens.map(({ to, label, icon: Icon }) => (
              <CommandItem key={to} value={`tela ${label}`} onSelect={() => go(to)}>
                <Icon />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
          {/* Ativos */}
          <CommandGroup heading="Ativos">
            {assets.map((asset) => (
              <CommandItem
                key={asset.id}
                value={`ativo ${asset.ticker}`}
                onSelect={() => go(`/assets/${asset.id}`)}
              >
                <TickerLabel ticker={asset.ticker} category={asset.asset_class} />
              </CommandItem>
            ))}
          </CommandGroup>
          {/* Títulos */}
          <CommandGroup heading="Renda fixa">
            {fixedIncome.map((investment) => (
              <CommandItem
                key={investment.id}
                value={`título ${investment.label}`}
                onSelect={() => go(`/fixed-income/${investment.id}`)}
              >
                {investment.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
