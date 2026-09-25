import {
  bestMonthHint,
  negativeMonthsHint,
  positiveMonthsHint,
  worstMonthHint,
} from "@/features/monthly-returns/hints";
import { signClass } from "@/features/monthly-returns/months";
import { monthLabel } from "@/shared/lib/months";
import type { MonthlyReturns } from "@/features/monthly-returns/use-monthly-returns";
import { Metric } from "@/shared/components/metric";
import { formatSignedPercent } from "@/types/decimal";

type MonthReturn = NonNullable<MonthlyReturns["best_month"]>;

function MonthValue({ month }: { month: MonthReturn | null }) {
  if (!month) return <span className="text-xl font-semibold">—</span>;
  return (
    <span className="flex items-baseline gap-2">
      <span className={`text-xl font-semibold tabular-nums ${signClass(month.value)}`}>
        {formatSignedPercent(month.value)}
      </span>
      <span className="text-muted-foreground text-sm">{monthLabel(month.year, month.month)}</span>
    </span>
  );
}

function Count({ count, total }: { count: number; total: number }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="text-xl font-semibold tabular-nums">{count}</span>
      <span className="text-muted-foreground text-sm">de {total} meses</span>
    </span>
  );
}

export function MonthlyReturnsSummary({ monthly }: { monthly: MonthlyReturns }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Metric label="Melhor mês" hint={bestMonthHint}>
        <MonthValue month={monthly.best_month} />
      </Metric>
      <Metric label="Pior mês" hint={worstMonthHint}>
        <MonthValue month={monthly.worst_month} />
      </Metric>
      <Metric label="Meses positivos" hint={positiveMonthsHint}>
        <Count count={monthly.positive_months} total={monthly.months} />
      </Metric>
      <Metric label="Meses negativos" hint={negativeMonthsHint}>
        <Count count={monthly.negative_months} total={monthly.months} />
      </Metric>
    </div>
  );
}
