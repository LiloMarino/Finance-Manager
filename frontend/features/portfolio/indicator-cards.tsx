import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { cashHint } from "@/features/cash/labels";
import { dayChangeHint, totalChangeHint } from "@/features/portfolio/hints";
import type { Portfolio } from "@/features/portfolio/use-portfolio";
import { MetricHint } from "@/shared/components/metric-hint";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { formatDate } from "@/shared/lib/format";
import { signClass } from "@/shared/lib/sign";
import {
  type DecimalString,
  formatBRL,
  formatSignedBRL,
  formatSignedPercent,
} from "@/types/decimal";

interface IndicatorCardProps {
  label: string;
  hint: string;
  value: string;
  /** Classe de cor do número, para resultado com sinal. */
  tone?: string;
  children?: ReactNode;
}

function IndicatorCard({ label, hint, value, tone = "", children }: IndicatorCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>
          <MetricHint hint={hint}>{label}</MetricHint>
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">
          <span className={tone}>{value}</span>
        </CardTitle>
      </CardHeader>
      {children && (
        <CardContent>
          <CardDescription className="tabular-nums">{children}</CardDescription>
        </CardContent>
      )}
    </Card>
  );
}

function ChangeCard({
  label,
  hint,
  value,
  ratio,
}: {
  label: string;
  hint: string;
  value: DecimalString | null;
  ratio: DecimalString | null;
}) {
  if (value === null) {
    return <IndicatorCard label={label} hint={hint} value="—" />;
  }
  return (
    <IndicatorCard label={label} hint={hint} value={formatSignedBRL(value)} tone={signClass(value)}>
      {ratio && <span className={signClass(ratio)}>{formatSignedPercent(ratio)}</span>}
    </IndicatorCard>
  );
}

/** A faixa do topo da Carteira: patrimônio, variação do dia e variação total. */
export function IndicatorCards({ portfolio }: { portfolio: Portfolio }) {
  const sessions =
    portfolio.price_date && portfolio.previous_price_date
      ? `Renda variável: fechamento de ${formatDate(portfolio.price_date)} contra o de ${formatDate(portfolio.previous_price_date)}.`
      : "Renda variável: sem dois pregões em cache para a variação do dia.";

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <IndicatorCard
        label="Patrimônio total"
        hint="Renda variável pelo último fechamento, renda fixa pelo valor bruto marcado e o saldo a reinvestir."
        value={formatBRL(portfolio.total)}
      >
        {portfolio.cash && (
          <MetricHint hint={cashHint}>
            <span>
              Saldo a reinvestir{" "}
              <Link to="/cash" className="text-foreground underline-offset-4 hover:underline">
                {formatBRL(portfolio.cash)}
              </Link>
            </span>
          </MetricHint>
        )}
      </IndicatorCard>
      <ChangeCard
        label="Variação do dia"
        hint={`${dayChangeHint} ${sessions} Renda fixa: marcação de hoje contra a do dia útil anterior.`}
        value={portfolio.day_change}
        ratio={portfolio.day_return}
      />
      <ChangeCard
        label="Variação total"
        hint={totalChangeHint}
        value={portfolio.unrealized_result}
        ratio={portfolio.unrealized_return}
      />
    </div>
  );
}
