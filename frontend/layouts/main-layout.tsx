import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ArrowLeftRight,
  Activity,
  Boxes,
  ChartArea,
  Coins,
  Landmark,
  LineChart,
  PieChart,
  Receipt,
  Shapes,
  TrendingUp,
} from "lucide-react";

import { useDataHealth } from "@/features/data-health/use-data-health";
import { useRefreshIndexes } from "@/features/market/use-refresh-indexes";
import { useRefreshPrices } from "@/features/market/use-refresh-prices";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar";
import { Toaster } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

// Paths em inglês acompanham o código; o rótulo é o que aparece pro usuário.
const navItems = [
  { to: "/", label: "Carteira", icon: PieChart },
  { to: "/evolution", label: "Evolução", icon: ChartArea },
  { to: "/performance", label: "Rentabilidade", icon: TrendingUp },
  { to: "/operations", label: "Operações", icon: ArrowLeftRight },
  { to: "/assets", label: "Ativos", icon: Boxes },
  { to: "/sectors", label: "Setores", icon: Shapes },
  { to: "/fixed-income", label: "Renda fixa", icon: Landmark },
  { to: "/market", label: "Mercado", icon: LineChart },
  { to: "/income", label: "Proventos", icon: Coins },
  { to: "/tax", label: "Fiscal", icon: Receipt },
  { to: "/data-health", label: "Saúde dos dados", icon: Activity },
];

export function MainLayout() {
  const { mutate: refreshPrices } = useRefreshPrices();
  const { mutate: refreshIndexes } = useRefreshIndexes();
  const issues = useDataHealth();
  const { pathname } = useLocation();

  // A cada abertura, o backend confere o que falta nos caches de cotações e de séries
  useEffect(() => {
    refreshPrices();
    refreshIndexes();
  }, [refreshPrices, refreshIndexes]);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="px-4 py-3 text-base font-semibold">
            Finance Manager
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map(({ to, label, icon: Icon }) => (
                    <SidebarMenuItem key={to}>
                      <SidebarMenuButton asChild isActive={pathname === to}>
                        <NavLink to={to} end>
                          <Icon />
                          {label}
                        </NavLink>
                      </SidebarMenuButton>
                      {to === "/data-health" && Boolean(issues.data?.length) && (
                        <SidebarMenuBadge>{issues.data?.length}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
  
        <SidebarInset className="min-w-0">
          <header className="flex h-14 items-center gap-2 border-b px-4">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </SidebarInset>
        <Toaster richColors />
      </SidebarProvider>
    </TooltipProvider>
  );
}
