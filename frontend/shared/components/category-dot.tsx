import { type PortfolioCategory, portfolioCategoryConfig } from "@/shared/lib/portfolio-category";

/** O marcador na cor da categoria, a mesma da fatia dela no gráfico. */
export function CategoryDot({ category }: { category: PortfolioCategory }) {
  return (
    <span
      aria-hidden
      className="size-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: portfolioCategoryConfig[category].color }}
    />
  );
}
