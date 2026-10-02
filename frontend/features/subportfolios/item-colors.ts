import { type PortfolioCategory, portfolioCategoryConfig } from "@/shared/lib/portfolio-category";

// Os itens da mesma categoria clareiam em sequência: a cor identifica a categoria e o
// tom, o item
const SHADES = ["100%", "55%", "35%"];

/** A cor de cada item de uma subcarteira, na ordem em que vêm: o primeiro de cada
categoria leva a cor dela, e os seguintes, tons mais claros. */
export function itemColors<T extends { category: PortfolioCategory }>(items: T[]): string[] {
  const seen = new Map<PortfolioCategory, number>();
  return items.map((item) => {
    const index = seen.get(item.category) ?? 0;
    seen.set(item.category, index + 1);
    const base = portfolioCategoryConfig[item.category].color;
    const shade = SHADES[index % SHADES.length];
    return shade === "100%" ? base : `color-mix(in oklab, ${base} ${shade}, var(--card))`;
  });
}
