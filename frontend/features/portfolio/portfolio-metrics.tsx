import { Link } from "react-router-dom";

import { cashHint } from "@/features/cash/labels";
import { dayChangeHint, totalChangeHint } from "@/features/portfolio/hints";
import type { Portfolio } from "@/features/portfolio/use-portfolio";
import { Metric, MetricStrip } from "@/shared/components/metric";
import { Money } from "@/shared/components/money";
import { formatDate } from "@/shared/lib/format";
import { signClass } from "@/shared/lib/sign";
import { formatPercent, formatSignedPercent } from "@/types/decimal";

const totalHint =
  "Renda variável pelo último fechamento, renda fixa pelo valor bruto marcado e o saldo a reinvestir.";

/** A faixa do topo da Carteira: patrimônio, variação do dia, variação total e o
saldo a reinvestir. */
export function PortfolioMetrics({ portfolio }: { portfolio: Portfolio }) {
  const invested = portfolio.categories.filter((item) => item.category !== "cash");
  const positions = invested.reduce((count, item) => count + item.asset_count, 0);
  const sessions =
    portfolio.price_date && portfolio.previous_price_date
      ? `Renda variável: fechamento de ${formatDate(portfolio.price_date)} contra o de ${formatDate(portfolio.previous_price_date)}.`
      : "Renda variável: sem dois pregões em cache para a variação do dia.";
  const cashShare = portfolio.categories.find((item) => item.category === "cash")?.share;

  return (
    <MetricStrip>
      <Metric
        label="Patrimônio"
        hint={totalHint}
        size="lg"
        value={<Money value={portfolio.total} />}
        detail={`${positions} ${positions === 1 ? "posição" : "posições"} em ${invested.length} ${invested.length === 1 ? "categoria" : "categorias"}`}
      />
      <Metric
        label="Variação do dia"
        hint={`${dayChangeHint} ${sessions} Renda fixa: marcação de hoje contra a do dia útil anterior.`}
        size="lg"
        tone={portfolio.day_change ? signClass(portfolio.day_change) : ""}
        value={portfolio.day_change && <Money value={portfolio.day_change} signed />}
        detail={
          portfolio.day_return && (
            <>
              <span className={signClass(portfolio.day_return)}>
                {formatSignedPercent(portfolio.day_return)}
              </span>
              {portfolio.previous_price_date && (
                <span>
                  contra o fechamento de {formatDate(portfolio.previous_price_date).slice(0, 5)}
                </span>
              )}
            </>
          )
        }
      />
      <Metric
        label="Variação total"
        hint={totalChangeHint}
        size="lg"
        tone={signClass(portfolio.unrealized_result)}
        value={<Money value={portfolio.unrealized_result} signed />}
        detail={
          portfolio.unrealized_return && (
            <>
              <span className={signClass(portfolio.unrealized_return)}>
                {formatSignedPercent(portfolio.unrealized_return)}
              </span>
              <span>sobre o custo</span>
            </>
          )
        }
      />
      {portfolio.cash !== null && (
        <Metric
          label="Saldo a reinvestir"
          hint={cashHint}
          size="lg"
          value={
            <Link to="/cash" className="hover:underline">
              <Money value={portfolio.cash} />
            </Link>
          }
          detail={cashShare && `${formatPercent(cashShare)} do patrimônio`}
        />
      )}
    </MetricStrip>
  );
}
