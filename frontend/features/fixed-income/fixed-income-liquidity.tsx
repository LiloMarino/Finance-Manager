import type { FixedIncomeSummary } from "@/features/fixed-income/use-fixed-income";
import { ColorSwatch } from "@/shared/components/color-swatch";
import { MetricHint } from "@/shared/components/metric-hint";
import { Money } from "@/shared/components/money";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { FixedIncome } from "@/shared/hooks/use-fixed-income-list";
import { formatDate } from "@/shared/lib/format";
import { monthLabel } from "@/shared/lib/months";
import { localDay } from "@/shared/lib/period";
import { formatPercent, toChartNumber } from "@/types/decimal";

const dailyHint =
  "Dá para resgatar e usar no mesmo dia. É o que cobre um imprevisto sem vender nada.";
const lockedHint =
  "Só vira dinheiro no vencimento, quando cai no saldo. Um título desses acima da meta só se corrige aportando nos outros itens.";

/** A renda fixa dividida entre a liquidez diária e o que só sai no vencimento. */
export function LiquiditySplitCard({ summary }: { summary: FixedIncomeSummary }) {
  const daily = summary.daily_share ? toChartNumber(summary.daily_share) * 100 : 0;
  const rows = [
    {
      key: "daily",
      label: "Liquidez diária",
      hint: dailyHint,
      color: "var(--liquidity-daily)",
      totals: summary.daily_liquidity,
      share: summary.daily_share,
    },
    {
      key: "locked",
      label: "Só no vencimento",
      hint: lockedHint,
      color: "var(--liquidity-locked)",
      totals: summary.at_maturity,
      share: summary.at_maturity_share,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quando a renda fixa vira dinheiro</CardTitle>
        <CardAction>
          <CardDescription>Pelo valor bruto de hoje</CardDescription>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Barra das duas fatias */}
        <div
          role="img"
          aria-label={`Liquidez diária ${daily.toFixed(2)}%`}
          className="flex h-3.5 gap-0.5 overflow-hidden rounded-sm"
        >
          {daily > 0 && (
            <span
              className="bg-liquidity-daily w-(--daily) shrink-0"
              style={{ "--daily": `${daily}%` }}
            />
          )}
          {daily < 100 && <span className="bg-liquidity-locked flex-1" />}
        </div>

        {/* Valores */}
        <div className="flex flex-col">
          {rows.map((row) => (
            <div
              key={row.key}
              className="border-border-subtle grid grid-cols-[minmax(0,1fr)_auto_4rem] items-center gap-3 border-b py-2 last:border-b-0"
            >
              <span className="text-ink-2 flex items-center gap-2">
                <ColorSwatch color={row.color} shape="square" />
                <MetricHint hint={row.hint}>
                  <span>
                    {row.label} · {row.totals.count} {row.totals.count === 1 ? "título" : "títulos"}
                  </span>
                </MetricHint>
              </span>
              <span className="text-right tabular-nums">
                <Money value={row.totals.gross_value} />
              </span>
              <span className="text-muted-foreground text-right tabular-nums">
                {row.share ? formatPercent(row.share) : "—"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/** Quanto falta até o vencimento, em anos ou meses. */
function untilMaturity(maturity: string, today: Date): string {
  const date = localDay(maturity);
  const months =
    (date.getFullYear() - today.getFullYear()) * 12 + date.getMonth() - today.getMonth();
  if (months <= 0) return "este mês";
  if (months < 12) return months === 1 ? "em 1 mês" : `em ${months} meses`;
  const years = Math.round(months / 12);
  return years === 1 ? "em 1 ano" : `em ${years} anos`;
}

/** Os títulos sem liquidez diária na ordem em que vencem, pelo bruto de hoje. */
export function MaturitiesCard({ investments }: { investments: FixedIncome[] }) {
  const today = new Date();
  const upcoming = investments
    .filter((item) => !item.daily_liquidity && !item.matured && item.maturity_date)
    .toSorted((a, b) => (a.maturity_date ?? "").localeCompare(b.maturity_date ?? ""));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos vencimentos</CardTitle>
        <CardAction>
          <CardDescription>Títulos sem liquidez diária, pelo valor bruto de hoje</CardDescription>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col">
        {upcoming.length === 0 ? (
          <p className="text-caption text-muted-foreground">
            Nenhum título com vencimento e sem liquidez diária.
          </p>
        ) : (
          upcoming.map((item) => {
            const maturity = item.maturity_date ?? "";
            const day = localDay(maturity);
            return (
              <div
                key={item.id}
                className="border-border-subtle grid grid-cols-[6rem_minmax(0,1fr)_auto] items-center gap-4 border-b py-3 last:border-b-0"
              >
                <span className="flex flex-col" title={formatDate(maturity)}>
                  <span className="font-semibold">
                    {monthLabel(day.getFullYear(), day.getMonth() + 1)}
                  </span>
                  <span className="text-caption text-muted-foreground">
                    {untilMaturity(maturity, today)}
                  </span>
                </span>
                <span className="truncate">{item.label}</span>
                <span className="text-right tabular-nums">
                  <Money value={item.gross_value} />
                </span>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
