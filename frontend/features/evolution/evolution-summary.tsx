import { growthHint } from "@/features/evolution/hints";
import type { Evolution } from "@/features/evolution/use-evolution";
import { Metric, MetricStrip } from "@/shared/components/metric";
import { Money } from "@/shared/components/money";
import { signClass } from "@/shared/lib/sign";
import { formatSignedPercent } from "@/types/decimal";

function GrowthMetric({ months, growth }: { months: number; growth: Evolution["last_6_months"] }) {
  return (
    <Metric
      label={`Em ${months} meses`}
      hint={growthHint(months)}
      tone={growth ? signClass(growth.change) : ""}
      value={growth && <Money value={growth.change} signed />}
      detail={
        growth?.growth_return && (
          <>
            <span className={signClass(growth.growth_return)}>
              {formatSignedPercent(growth.growth_return)}
            </span>
            <span>com os aportes</span>
          </>
        )
      }
    />
  );
}

/** O patrimônio de hoje, o aplicado e quanto ele mudou em 6, 12 e 24 meses. */
export function EvolutionSummary({ evolution }: { evolution: Evolution }) {
  const last = evolution.points.at(-1);
  return (
    <MetricStrip>
      <Metric
        label="Patrimônio atual"
        size="lg"
        value={<Money value={evolution.total} />}
        detail={
          last && (
            <span>
              <Money value={last.invested} /> aplicados
            </span>
          )
        }
      />
      <GrowthMetric months={6} growth={evolution.last_6_months} />
      <GrowthMetric months={12} growth={evolution.last_12_months} />
      <GrowthMetric months={24} growth={evolution.last_24_months} />
    </MetricStrip>
  );
}
