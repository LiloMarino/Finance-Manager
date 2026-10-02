import { cdiShareHint, quotaHint } from "@/features/performance/hints";
import type { Performance } from "@/features/performance/use-performance";
import { Metric, MetricStrip } from "@/shared/components/metric";
import { formatDate } from "@/shared/lib/format";
import { signClass } from "@/shared/lib/sign";
import { type DecimalString, formatPercent, formatSignedPercent } from "@/types/decimal";

// O valor com sinal e a cor de alta ou baixa; nulo vira "—"
function signed(value: DecimalString | null): { value: string | null; tone: string } {
  return value === null
    ? { value: null, tone: "" }
    : { value: formatSignedPercent(value), tone: signClass(value) };
}

interface PerformanceSummaryProps {
  performance: Performance;
  /** O nome do período escolhido, como "Em 12 meses". */
  periodLabel: string;
}

/** A rentabilidade no período, o CDI no mesmo período, a fração do CDI e a
rentabilidade desde o início. */
export function PerformanceSummary({ performance, periodLabel }: PerformanceSummaryProps) {
  const cdi = performance.benchmarks.find((benchmark) => benchmark.series === "cdi")?.period;
  const range =
    performance.start && performance.end
      ? `de ${formatDate(performance.start)} a ${formatDate(performance.end)}`
      : undefined;

  return (
    <MetricStrip>
      <Metric
        label={periodLabel}
        hint={quotaHint}
        size="lg"
        {...signed(performance.period)}
        detail={range}
      />
      <Metric
        label={`CDI ${periodLabel.toLowerCase()}`}
        size="lg"
        value={cdi ? formatSignedPercent(cdi) : null}
        detail="a referência da renda fixa"
      />
      <Metric
        label="% do CDI"
        hint={cdiShareHint}
        size="lg"
        value={performance.cdi_share === null ? null : formatPercent(performance.cdi_share)}
        detail="acima de 100% bate o CDI"
      />
      <Metric
        label="Desde o início"
        size="lg"
        {...signed(performance.since_inception)}
        detail={performance.first_date && `desde ${formatDate(performance.first_date)}`}
      />
    </MetricStrip>
  );
}
