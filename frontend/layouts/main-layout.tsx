import { Eye, EyeOff, Moon, PanelLeft, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { useDataHealth } from "@/features/data-health/use-data-health";
import { useRefreshIndexes } from "@/features/market/use-refresh-indexes";
import { useRefreshPrices } from "@/features/market/use-refresh-prices";
import { CommandSearch } from "@/layouts/command-search";
import { dataItem, isActive, navGroups } from "@/layouts/navigation";
import { ScopeSwitcher } from "@/layouts/scope-switcher";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { Toaster } from "@/shared/components/ui/sonner";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { usePrivacy } from "@/shared/hooks/use-privacy";

function CollapseButton() {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Recolher a sidebar"
      title="Recolher a sidebar (Ctrl B)"
      className="group-data-[collapsible=icon]:hidden"
      onClick={toggleSidebar}
    >
      <PanelLeft />
    </Button>
  );
}

// O contador de Dados soma só o que pede ação ou deixa número errado; o que só
// melhora o app fica na tela de Dados
function DataNavItem({ pathname }: { pathname: string }) {
  const { data: issues = [] } = useDataHealth();
  const critical = issues.filter((issue) => issue.severity === "critical").length;
  const counted = issues.filter((issue) => issue.severity !== "info").length;
  const Icon = dataItem.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive(dataItem.to, pathname)}
        tooltip={dataItem.label}
        render={<NavLink to={dataItem.to} />}
      >
        <Icon />
        <span>{dataItem.label}</span>
        {counted > 0 && (
          <Badge
            variant={critical > 0 ? "count-critical" : "count-warning"}
            className="ml-auto group-data-[collapsible=icon]:hidden"
          >
            {counted}
          </Badge>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function FooterSwitch({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="text-caption text-muted-foreground flex items-center justify-between pr-1 pl-2.5 group-data-[collapsible=icon]:hidden">
      {label}
      {children}
    </div>
  );
}

function PreferenceSwitches() {
  const { hidden, setHidden } = usePrivacy();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <>
      <FooterSwitch label="Valores">
        <ToggleGroup
          variant="segmented"
          size="sm"
          aria-label="Valores"
          title="Ctrl Shift H esconde e mostra"
          value={[hidden ? "hidden" : "shown"]}
          onValueChange={([value]) => {
            if (value) setHidden(value === "hidden");
          }}
        >
          <ToggleGroupItem value="shown" aria-label="Mostrar valores">
            <Eye />
          </ToggleGroupItem>
          <ToggleGroupItem value="hidden" aria-label="Ocultar valores">
            <EyeOff />
          </ToggleGroupItem>
        </ToggleGroup>
      </FooterSwitch>
      <FooterSwitch label="Tema">
        <ToggleGroup
          variant="segmented"
          size="sm"
          aria-label="Tema"
          value={[resolvedTheme ?? "dark"]}
          onValueChange={([value]) => {
            if (value) setTheme(value);
          }}
        >
          <ToggleGroupItem value="light" aria-label="Claro">
            <Sun />
          </ToggleGroupItem>
          <ToggleGroupItem value="dark" aria-label="Escuro">
            <Moon />
          </ToggleGroupItem>
        </ToggleGroup>
      </FooterSwitch>
    </>
  );
}

export function MainLayout() {
  const { mutate: refreshPrices } = useRefreshPrices();
  const { mutate: refreshIndexes } = useRefreshIndexes();
  const { pathname } = useLocation();

  // A cada abertura, o backend confere o que falta nos caches de cotações e de séries
  useEffect(() => {
    refreshPrices();
    refreshIndexes();
  }, [refreshPrices, refreshIndexes]);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar variant="inset" collapsible="icon">
          {/* Carteira, recolher e busca */}
          <SidebarHeader className="gap-1.5">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-0.5">
                <ScopeSwitcher />
                <CollapseButton />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <CommandSearch />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          {/* Navegação */}
          <SidebarContent>
            {navGroups.map((group) => (
              <SidebarGroup key={group.label} className="py-1">
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map(({ to, label, icon: Icon }) => (
                      <SidebarMenuItem key={to}>
                        <SidebarMenuButton
                          isActive={isActive(to, pathname)}
                          tooltip={label}
                          render={<NavLink to={to} end={to === "/"} />}
                        >
                          <Icon />
                          <span>{label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          {/* Dados, valores e tema */}
          <SidebarFooter className="gap-1.5">
            <SidebarMenu>
              <DataNavItem pathname={pathname} />
            </SidebarMenu>
            <PreferenceSwitches />
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="min-w-0">
          {/* No celular, a sidebar abre por aqui */}
          <div className="p-3 md:hidden">
            <SidebarTrigger />
          </div>
          <main className="flex flex-1 flex-col gap-6 p-6">
            <Outlet />
          </main>
        </SidebarInset>
        <Toaster richColors />
      </SidebarProvider>
    </TooltipProvider>
  );
}
