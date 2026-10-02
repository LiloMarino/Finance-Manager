import {
  Activity,
  ArrowLeftRight,
  Boxes,
  ChartArea,
  ChartLine,
  ChartScatter,
  Coins,
  CreditCard,
  FileUp,
  FolderTree,
  GitCompareArrows,
  Landmark,
  type LucideIcon,
  PieChart,
  Receipt,
  Scale,
  TrendingUp,
  Wallet,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

// Paths em inglês acompanham o código; o rótulo é o que aparece pro usuário
export const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Visão geral",
    items: [
      { to: "/", label: "Carteira", icon: PieChart },
      { to: "/evolution", label: "Evolução", icon: ChartArea },
      { to: "/performance", label: "Rentabilidade", icon: TrendingUp },
      { to: "/income", label: "Proventos", icon: Coins },
    ],
  },
  {
    label: "Análises",
    items: [
      { to: "/risk-return", label: "Risco × retorno", icon: ChartScatter },
      { to: "/correlation", label: "Correlação", icon: GitCompareArrows },
    ],
  },
  {
    label: "Lançamentos",
    items: [
      { to: "/operations", label: "Operações", icon: ArrowLeftRight },
      { to: "/import", label: "Importar", icon: FileUp },
      { to: "/fixed-income", label: "Renda fixa", icon: Landmark },
      { to: "/cash", label: "Saldo", icon: Wallet },
    ],
  },
  {
    label: "Organização",
    items: [
      { to: "/assets", label: "Ativos", icon: Boxes },
      { to: "/subportfolios", label: "Subcarteiras", icon: FolderTree },
    ],
  },
  {
    label: "Impostos",
    items: [{ to: "/tax", label: "Fiscal", icon: Receipt }],
  },
  {
    label: "Ferramentas",
    items: [
      { to: "/fixed-income-comparator", label: "Comparador de RF", icon: Scale },
      { to: "/installments", label: "À vista ou parcelado", icon: CreditCard },
      { to: "/asset-correlation", label: "Correlação entre ativos", icon: ChartLine },
    ],
  },
];

export const dataItem: NavItem = { to: "/data", label: "Dados", icon: Activity };

/** O item fica ativo na tela dele e nos detalhes abaixo dela (`/assets/12`). */
export function isActive(to: string, pathname: string): boolean {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}
