import {
  breakEvenDiscountHint,
  breakEvenRatesHint,
  cashLeftoverHint,
  installmentsLeftoverHint,
  scheduleHint,
} from "@/features/installments/hints";
import type { InstallmentMode } from "@/features/installments/simulation-params";
import type { Installments } from "@/features/installments/use-installments";
import { Metric } from "@/shared/components/metric";
import { MetricHint } from "@/shared/components/metric-hint";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatDate } from "@/shared/lib/format";
import { type Indexer, fixedIncomeTypeLabels, indexerLabels } from "@/shared/lib/labels";
import { type DecimalString, formatBRL, formatPercent, formatRate } from "@/types/decimal";

// A taxa de empate no formato do indexador, em duas casas
const rateText: Record<Indexer, (rate: DecimalString) => string> = {
  cdi: (rate) => `${formatRate(rate)}% do CDI`,
  selic: (rate) => `Selic + ${formatRate(rate)}% a.a.`,
  ipca: (rate) => `IPCA + ${formatRate(rate)}% a.a.`,
  prefixed: (rate) => `${formatRate(rate)}% a.a.`,
};

// No adiantamento, o "à vista" é pagar agora as parcelas que faltam
const cashLabels: Record<InstallmentMode, { verb: string; action: string; metric: string }> = {
  purchase: { verb: "Pagar à vista", action: "pagar à vista", metric: "À vista" },
  prepayment: { verb: "Adiantar", action: "adiantar", metric: "Adiantando" },
};

function Verdict({ simulation, mode }: { simulation: Installments; mode: InstallmentMode }) {
  const discount = formatPercent(simulation.break_even_discount);
  if (simulation.winner === null || simulation.difference === null) {
    return simulation.cash_leftover === null ? (
      <p className="text-lg">
        Peça pelo menos <strong>{discount}</strong> de desconto para{" "}
        {cashLabels[mode].action}.
      </p>
    ) : (
      <p className="text-lg">Os dois caminhos empatam.</p>
    );
  }
  const winner = simulation.winner === "cash" ? cashLabels[mode].verb : "Parcelar";
  return (
    <p className="text-lg">
      <strong>{winner}</strong> termina com {formatBRL(simulation.difference)} a mais. O
      desconto que empata é {discount}.
    </p>
  );
}

interface SimulationSummaryProps {
  simulation: Installments;
  mode: InstallmentMode;
}

export function SimulationSummary({ simulation, mode }: SimulationSummaryProps) {
  return (
    <div className="flex flex-col gap-6">
      <Verdict simulation={simulation} mode={mode} />

      {/* Sobra de cada caminho */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Metric
          label="Sobra parcelando"
          hint={installmentsLeftoverHint}
          value={formatBRL(simulation.installments_leftover)}
        />
        <Metric
          label={`Sobra ${cashLabels[mode].metric.toLowerCase()}`}
          hint={cashLeftoverHint}
          value={simulation.cash_leftover && formatBRL(simulation.cash_leftover)}
        />
        <Metric
          label="Desconto que empata"
          hint={breakEvenDiscountHint}
          value={formatPercent(simulation.break_even_discount)}
        />
        <Metric
          label="Total das parcelas"
          hint="A soma das parcelas, que é o que sai do investimento no parcelado."
          value={formatBRL(simulation.total)}
        />
        <Metric
          label={cashLabels[mode].metric}
          hint="O total das parcelas menos o desconto informado."
          value={simulation.cash_price && formatBRL(simulation.cash_price)}
        />
      </div>

      {/* Do desconto para o investimento */}
      {simulation.break_even_rates && (
        <section className="flex flex-col gap-2">
          <MetricHint hint={breakEvenRatesHint}>
            <h3 className="font-medium">Investimentos que empatam com o desconto</h3>
          </MetricHint>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Investimento</TableHead>
                <TableHead className="text-right">Taxa que empata</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {simulation.break_even_rates.map((rate) => (
                <TableRow key={`${rate.product_type}-${rate.indexer}`}>
                  <TableCell>
                    {fixedIncomeTypeLabels[rate.product_type]} ·{" "}
                    {indexerLabels[rate.indexer]}
                    {rate.product_type === "lca" && " (isenta de IR)"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {rate.rate === null ? "Nenhuma" : rateText[rate.indexer](rate.rate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}

      {/* Cronograma das parcelas */}
      <section className="flex flex-col gap-2">
        <MetricHint hint={scheduleHint}>
          <h3 className="font-medium">Parcelas pagas pelo investimento</h3>
        </MetricHint>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vencimento</TableHead>
              <TableHead className="text-right">Parcela</TableHead>
              <TableHead className="text-right">Resgate bruto</TableHead>
              <TableHead className="text-right">IOF</TableHead>
              <TableHead className="text-right">IR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {simulation.withdrawals.map((withdrawal) => (
              <TableRow key={withdrawal.due_date}>
                <TableCell>{formatDate(withdrawal.due_date)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatBRL(withdrawal.amount)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatBRL(withdrawal.gross)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatBRL(withdrawal.iof)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatBRL(withdrawal.income_tax)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
