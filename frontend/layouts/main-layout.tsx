import { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  ArrowLeftRight,
  Boxes,
  Coins,
  LineChart,
  PieChart,
  Receipt,
} from "lucide-react";

import { useRefreshPrices } from "@/features/market/use-refresh-prices";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar";
import { Toaster } from "@/shared/components/ui/sonner";

// Paths em inglês acompanham o código; o rótulo é o que aparece pro usuário.
const navItems = [
  { to: "/", label: "Carteira", icon: PieChart },
  { to: "/operations", label: "Operações", icon: ArrowLeftRight },
  { to: "/assets", label: "Ativos", icon: Boxes },
  { to: "/market", label: "Mercado", icon: LineChart },
  { to: "/income", label: "Proventos", icon: Coins },
  { to: "/tax", label: "Fiscal", icon: Receipt },
];

export function MainLayout() {
  const { mutate: refreshPrices } = useRefreshPrices();

  // O cache de cotações recebe os dias que faltam a cada abertura do app
  useEffect(() => {
    refreshPrices();
  }, [refreshPrices]);

  return (
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
                    <NavLink to={to} end>
                      {({ isActive }) => (
                        <SidebarMenuButton asChild isActive={isActive}>
                          <span>
                            <Icon />
                            {label}
                          </span>
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
      <Toaster richColors />
    </SidebarProvider>
  );
}
