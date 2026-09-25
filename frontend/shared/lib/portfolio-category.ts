import type { ChartConfig } from "@/shared/components/ui/chart";
import type { components } from "@/types/openapi.generated";

export type PortfolioCategory = components["schemas"]["PortfolioCategory"];

export const portfolioCategories: PortfolioCategory[] = [
  "stock",
  "fii",
  "etf",
  "bdr",
  "fixed_income",
];

export const portfolioCategoryLabels: Record<PortfolioCategory, string> = {
  stock: "Ações",
  fii: "FIIs",
  etf: "ETFs",
  bdr: "BDRs",
  fixed_income: "Renda fixa",
};

export function isPortfolioCategory(value: string): value is PortfolioCategory {
  return value in portfolioCategoryLabels;
}

// A cor segue a categoria, não a posição dela na lista: cada uma tem o seu slot
export const portfolioCategoryConfig = {
  stock: { label: portfolioCategoryLabels.stock, color: "var(--chart-1)" },
  fii: { label: portfolioCategoryLabels.fii, color: "var(--chart-2)" },
  etf: { label: portfolioCategoryLabels.etf, color: "var(--chart-3)" },
  bdr: { label: portfolioCategoryLabels.bdr, color: "var(--chart-4)" },
  fixed_income: { label: portfolioCategoryLabels.fixed_income, color: "var(--chart-5)" },
} satisfies ChartConfig & Record<PortfolioCategory, { label: string; color: string }>;
