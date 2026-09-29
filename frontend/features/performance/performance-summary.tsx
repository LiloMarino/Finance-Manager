import {
  cdiShareHint,
  periodHint,
  quotaHint,
  recentHint,
} from "@/features/performance/hints";
import type { Performance } from "@/features/performance/use-performance";
import { Metric } from "@/shared/components/metric";
import { signClass } from "@/shared/lib/sign";
import { type DecimalString, formatPercent, formatSignedPercent } from "@/types/decimal";

// O valor com sinal e a cor de alta ou baixa; nulo vira "—"
function signed(value: DecimalString | null): { value: string | null; tone: string } {
  return value === null
    ? { value: null, tone: "" }
    : { value: formatSignedPercent(value), tone: signClass(value) };
}

export function PerformanceSummary({ performance }: { performance: Performance }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
      <Metric
        label="Desde o início"
        hint={quotaHint}
        {...signed(performance.since_inception)}
      />
      <Metric label="No período" hint={periodHint} {...signed(performance.period)} />
      <Metric
        label="% do CDI no período"
        hint={cdiShareHint}
        value={performance.cdi_share === null ? null : formatPercent(performance.cdi_share)}
      />
      <Metric label="6 meses" hint={recentHint(6)} {...signed(performance.last_6_months)} />
      <Metric
        label="12 meses"
        hint={recentHint(12)}
        {...signed(performance.last_12_months)}
      />
      <Metric
        label="24 meses"
        hint={recentHint(24)}
        {...signed(performance.last_24_months)}
      />
    </div>
  );
}
