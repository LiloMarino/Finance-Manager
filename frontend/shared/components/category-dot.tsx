import { ColorSwatch } from "@/shared/components/color-swatch";
import { type PortfolioCategory, portfolioCategoryConfig } from "@/shared/lib/portfolio-category";

/** O marcador na cor da categoria, a mesma da fatia dela no gráfico. */
export function CategoryDot({ category }: { category: PortfolioCategory }) {
  return <ColorSwatch color={portfolioCategoryConfig[category].color} />;
}
