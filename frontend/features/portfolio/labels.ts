import type { Portfolio } from "@/features/portfolio/use-portfolio";

export type Category = Portfolio["categories"][number]["category"];

export const categoryLabels: Record<Category, string> = {
  stock: "Ações",
  fii: "FIIs",
  etf: "ETFs",
  bdr: "BDRs",
  fixed_income: "Renda fixa",
};
