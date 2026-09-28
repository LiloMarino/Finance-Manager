import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ArrowLeftRight,
  Activity,
  Boxes,
  CalendarRange,
  ChartArea,
  Coins,
  CreditCard,
  FolderTree,
  GitCompareArrows,
  Landmark,
  LineChart,
  PieChart,
  Receipt,
  Scale,
  Shapes,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { useDataHealth } from "@/features/data-health/use-data-health";
import { useRefreshIndexes } from "@/features/market/use-refresh-indexes";
import { useRefreshPrices } from "@/features/market/use-refresh-prices";
import { PortfolioSelect } from "@/layouts/portfolio-select";
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
import {
  subportfolioSearch,
  useSubportfolioParam,
} from "@/shared/hooks/use-subportfolio-param";
import { useSubportfolios } from "@/shared/hooks/use-subportfolios";

// As visões que mostram a carteira geral ou uma subcarteira: nelas o seletor aparece,
// e os links entre elas levam a subcarteira escolhida
const PORTFOLIO_VIEWS = ["/", "/evolution", "/performance", "/monthly-returns", "/income"];

// Paths em inglês acompanham o código; o rótulo é o que aparece pro usuário.
const navItems = [
  { to: "/", label: "Carteira", icon: PieChart },
  { to: "/evolution", label: "Evolução", icon: ChartArea },
  { to: "/performance", label: "Rentabilidade", icon: TrendingUp },
  { to: "/monthly-returns", label: "Ano a ano", icon: CalendarRange },
  { to: "/operations", label: "Operações", icon: ArrowLeftRight },
  { to: "/assets", label: "Ativos", icon: Boxes },
  { to: "/sectors", label: "Setores", icon: Shapes },
  { to: "/subportfolios", label: "Subcarteiras", icon: FolderTree },
  { to: "/fixed-income", label: "Renda fixa", icon: Landmark },
  { to: "/cash", label: "Saldo", icon: Wallet },
  { to: "/market", label: "Mercado", icon: LineChart },
  { to: "/fixed-income-comparator", label: "Comparador de RF", icon: Scale },
  { to: "/installments", label: "À vista ou parcelado", icon: CreditCard },
  { to: "/correlation", label: "Correlação", icon: GitCompareArrows },
  { to: "/income", label: "Proventos", icon: Coins },
  { to: "/tax", label: "Fiscal", icon: Receipt },
  { to: "/data-health", label: "Saúde dos dados", icon: Activity },
];

export function MainLayout() {
  const { mutate: refreshPrices } = useRefreshPrices();
  const { mutate: refreshIndexes } = useRefreshIndexes();
  const issues = useDataHealth();
  const { data: subportfolios = [] } = useSubportfolios();
  const [subportfolioId, setSubportfolio] = useSubportfolioParam();
  const { pathname } = useLocation();
  const portfolioSearch = subportfolioSearch(subportfolioId);
  const onPortfolioView = PORTFOLIO_VIEWS.includes(pathname);

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
                        <NavLink
                          to={{
                            pathname: to,
                            search: PORTFOLIO_VIEWS.includes(to) ? portfolioSearch : "",
                          }}
                          end
                        >
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
            {onPortfolioView && (subportfolios.length > 0 || subportfolioId !== undefined) && (
              <div className="ml-auto">
                <PortfolioSelect
                  subportfolios={subportfolios}
                  value={subportfolioId}
                  onChange={setSubportfolio}
                />
              </div>
            )}
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
