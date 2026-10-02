import { Link } from "react-router-dom";

import { ColorSwatch } from "@/shared/components/color-swatch";
import { type PortfolioCategory, portfolioCategoryConfig } from "@/shared/lib/portfolio-category";

interface TickerLabelProps {
  ticker: string;
  category: PortfolioCategory;
  /** O detalhe do ativo: com ele, o ticker vira link. */
  to?: string;
}

/** O ticker em fonte mono, com o ponto da categoria antes e o nome dela no tooltip. */
export function TickerLabel({ ticker, category, to }: TickerLabelProps) {
  const label = (
    <span
      className="inline-flex items-center gap-2"
      title={portfolioCategoryConfig[category].label}
    >
      <ColorSwatch color={portfolioCategoryConfig[category].color} />
      <span className="text-ticker font-mono">{ticker}</span>
    </span>
  );
  if (to === undefined) return label;
  return (
    <Link to={to} className="text-foreground hover:underline">
      {label}
    </Link>
  );
}
