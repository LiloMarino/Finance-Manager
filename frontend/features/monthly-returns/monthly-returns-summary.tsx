import {
  bestMonthHint,
  negativeMonthsHint,
  positiveMonthsHint,
  worstMonthHint,
} from "@/features/monthly-returns/hints";
import type { MonthlyReturns } from "@/features/monthly-returns/use-monthly-returns";
import { Metric, MetricStrip } from "@/shared/components/metric";
import { monthLabel } from "@/shared/lib/months";
import { signClass } from "@/shared/lib/sign";
import { formatSignedPercent } from "@/types/decimal";

type MonthReturn = NonNullable<MonthlyReturns["best_month"]>;

function MonthMetric({
  label,
  hint,
  month,
}: {
  label: string;
  hint: string;
  month: MonthReturn | null;
}) {
  return (
    <Metric
      label={label}
      hint={hint}
      tone={month ? signClass(month.value) : ""}
      value={month && formatSignedPercent(month.value)}
      detail={month && monthLabel(month.year, month.month)}
    />
  );
}

/** O melhor e o pior mês e quantos meses subiram e caíram, na série inteira. */
export function MonthlyReturnsSummary({ monthly }: { monthly: MonthlyReturns }) {
  return (
    <MetricStrip>
      <MonthMetric label="Melhor mês" hint={bestMonthHint} month={monthly.best_month} />
      <MonthMetric label="Pior mês" hint={worstMonthHint} month={monthly.worst_month} />
      <Metric
        label="Meses positivos"
        hint={positiveMonthsHint}
        value={String(monthly.positive_months)}
        detail={`de ${monthly.months} meses`}
      />
      <Metric
        label="Meses negativos"
        hint={negativeMonthsHint}
        value={String(monthly.negative_months)}
        detail={`de ${monthly.months} meses`}
      />
    </MetricStrip>
  );
}
