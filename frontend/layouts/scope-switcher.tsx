import { Check, ChevronsUpDown } from "lucide-react";

import { SubportfolioMark } from "@/shared/components/subportfolio-mark";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/shared/components/ui/sidebar";
import { usePortfolioScope } from "@/shared/hooks/use-portfolio-scope";
import { useSubportfolios } from "@/shared/hooks/use-subportfolios";

/** O cabeçalho da sidebar: o app e a carteira que as telas mostram, a geral ou uma
subcarteira, cada uma com o ícone e a cor dela. */
export function ScopeSwitcher() {
  const { data: subportfolios = [] } = useSubportfolios();
  const [subportfolioId, setSubportfolio] = usePortfolioScope();
  const current = subportfolios.find((item) => item.id === subportfolioId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            size="lg"
            tooltip="Trocar a carteira"
            className="min-w-0 flex-1 gap-2 px-1.5"
          >
            <SubportfolioMark identity={current} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-label text-foreground truncate font-semibold">
                Finance Manager
              </span>
              <span className="text-caption text-muted-foreground truncate">
                {current?.name ?? "Carteira geral"}
              </span>
            </span>
            <ChevronsUpDown className="text-muted-foreground" />
          </SidebarMenuButton>
        }
      />
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Mostrar</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setSubportfolio(undefined)}>
            <SubportfolioMark size="sm" />
            Carteira geral
            {current === undefined && <Check className="ml-auto" />}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {subportfolios.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Subcarteiras</DropdownMenuLabel>
              {subportfolios.map((item) => (
                <DropdownMenuItem key={item.id} onClick={() => setSubportfolio(item.id)}>
                  <SubportfolioMark identity={item} size="sm" />
                  {item.name}
                  {item.id === current?.id && <Check className="ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
