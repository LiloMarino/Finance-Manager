import { periodHint, quotaHint, recentHint } from "@/features/performance/hints";
import type { Performance } from "@/features/performance/use-performance";
import { MetricHint } from "@/shared/components/metric-hint";
import { type DecimalString, formatSignedPercent } from "@/types/decimal";

function Metric({
  label,
  hint,
  value,
}: {
  label: string;
  hint: string;
  value: DecimalString | null;
}) {
  return (
    <div className="flex flex-col gap-1">
      <MetricHint hint={hint}>
        <span className="text-muted-foreground text-sm">{label}</span>
      </MetricHint>
      <span className="text-xl font-semibold tabular-nums">
        {value === null ? "—" : formatSignedPercent(value)}
      </span>
    </div>
  );
}

export function PerformanceSummary({ performance }: { performance: Performance }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      <Metric label="Desde o início" hint={quotaHint} value={performance.since_inception} />
      <Metric label="No período" hint={periodHint} value={performance.period} />
      <Metric label="6 meses" hint={recentHint(6)} value={performance.last_6_months} />
      <Metric label="12 meses" hint={recentHint(12)} value={performance.last_12_months} />
      <Metric label="24 meses" hint={recentHint(24)} value={performance.last_24_months} />
    </div>
  );
}
