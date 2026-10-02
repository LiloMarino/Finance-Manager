import { BreakEvenChart } from "@/features/installments/break-even-chart";
import {
  breakEvenDiscountHint,
  breakEvenRatesHint,
  cashLeftoverHint,
  curveHint,
  installmentsLeftoverHint,
  scheduleHint,
} from "@/features/installments/hints";
import type { PurchaseParams } from "@/features/installments/installments-params";
import { RemainingChart } from "@/features/installments/remaining-chart";
import type { Installments } from "@/features/installments/use-installments";
import { VerdictCard } from "@/features/installments/verdict-card";
import { Metric } from "@/shared/components/metric";
import { MetricHint } from "@/shared/components/metric-hint";
import { Money } from "@/shared/components/money";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatDate } from "@/shared/lib/format";
import { type Indexer, fixedIncomeTypeLabels } from "@/shared/lib/labels";
import {
  type DecimalString,
  formatPercent,
  formatQuantity,
  formatRate,
  isZero,
} from "@/types/decimal";

type BreakEvenRate = NonNullable<Installments["break_even_rates"]>[number];

// O investimento hipotético pelo nome com que se procura no banco
const indexerNames: Record<Indexer, string> = {
  cdi: "pelo CDI",
  selic: "pela Selic",
  ipca: "pelo IPCA",
  prefixed: "prefixado",
};

function rateLabel(rate: BreakEvenRate): string {
  const name = `${fixedIncomeTypeLabels[rate.product_type]} ${indexerNames[rate.indexer]}`;
  return rate.product_type === "lca" ? `${name} (isenta de IR)` : name;
}

// A taxa de empate no formato do indexador, em duas casas
const rateText: Record<Indexer, (rate: DecimalString) => string> = {
  cdi: (rate) => `${formatRate(rate)}% do CDI`,
  selic: (rate) => `Selic + ${formatRate(rate)}% ao ano`,
  ipca: (rate) => `IPCA + ${formatRate(rate)}% ao ano`,
  prefixed: (rate) => `${formatRate(rate)}% ao ano`,
};

function Verdict({ simulation, purchase }: { simulation: Installments; purchase: PurchaseParams }) {
  const breakEven = formatPercent(simulation.break_even_discount);
  const discount = purchase.cash_discount;
  const title =
    simulation.winner && simulation.difference ? (
      <>
        {simulation.winner === "cash" ? "Pagar à vista" : "Parcelar"} termina com{" "}
        <Money value={simulation.difference} /> a mais
      </>
    ) : discount ? (
      "Os dois caminhos empatam"
    ) : (
      `Peça pelo menos ${breakEven} de desconto para pagar à vista`
    );
  const text = !discount
    ? "Sem o desconto à vista, a conta mostra só o desconto que empata com parcelar."
    : simulation.winner === "installments"
      ? `O desconto de ${formatQuantity(discount)}% não paga o que o dinheiro rende até a última parcela. O desconto que empata é ${breakEven}.`
      : `O desconto de ${formatQuantity(discount)}% rende mais do que deixar o dinheiro aplicado. O desconto que empata é ${breakEven}.`;

  return (
    <VerdictCard title={title} text={text}>
      <Metric
        label="Sobra parcelando"
        hint={installmentsLeftoverHint}
        value={<Money value={simulation.installments_leftover} />}
      />
      <Metric
        label="Sobra à vista"
        hint={cashLeftoverHint}
        value={simulation.cash_leftover && <Money value={simulation.cash_leftover} />}
      />
      <Metric label="Total das parcelas" value={<Money value={simulation.total} />} />
      <Metric
        label="À vista"
        value={simulation.cash_price && <Money value={simulation.cash_price} />}
      />
    </VerdictCard>
  );
}

function BreakEvenRates({
  simulation,
  discount,
}: {
  simulation: Installments;
  discount: DecimalString | null;
}) {
  if (!discount || !simulation.break_even_rates) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Que investimento vence o desconto</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-ink-2">
            Informe o desconto à vista para ver quanto um investimento precisa render para parcelar
            vencer.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <MetricHint hint={breakEvenRatesHint}>
            Que investimento vence o desconto de {formatQuantity(discount)}%
          </MetricHint>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-ink-2">
          Achando um investimento que renda mais que isto, parcelar vence o desconto; rendendo
          menos, pagar à vista vence.
        </p>
      </CardContent>
      <CardContent data-flush>
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
                <TableCell>{rateLabel(rate)}</TableCell>
                <TableCell className="text-right">
                  {rate.rate === null ? "Nenhuma" : rateText[rate.indexer](rate.rate)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function Schedule({ simulation }: { simulation: Installments }) {
  // O IOF só aparece quando alguma parcela cai nos primeiros 30 dias da aplicação
  const withIof = simulation.withdrawals.some((withdrawal) => !isZero(withdrawal.iof));
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <MetricHint hint={scheduleHint}>Parcela a parcela</MetricHint>
        </CardTitle>
        <CardDescription>
          Cada parcela sai do investimento no último dia útil antes do vencimento, já com o IR
        </CardDescription>
      </CardHeader>
      <CardContent className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="flex flex-col gap-2">
          <RemainingChart simulation={simulation} />
          <span className="text-caption text-muted-foreground">
            O que fica aplicado depois de cada parcela. A última barra é a sobra.
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vencimento</TableHead>
              <TableHead className="text-right">Parcela</TableHead>
              <TableHead className="text-right">Resgate bruto</TableHead>
              <TableHead className="text-right">IR</TableHead>
              {withIof && <TableHead className="text-right">IOF</TableHead>}
              <TableHead className="text-right">Fica aplicado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {simulation.withdrawals.map((withdrawal) => (
              <TableRow key={withdrawal.due_date}>
                <TableCell>{formatDate(withdrawal.due_date)}</TableCell>
                <TableCell className="text-right">
                  <Money value={withdrawal.amount} />
                </TableCell>
                <TableCell className="text-right">
                  <Money value={withdrawal.gross} />
                </TableCell>
                <TableCell className="text-right">
                  <Money value={withdrawal.income_tax} />
                </TableCell>
                {withIof && (
                  <TableCell className="text-right">
                    <Money value={withdrawal.iof} />
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <Money value={withdrawal.remaining} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

interface PurchaseResultProps {
  simulation: Installments;
  purchase: PurchaseParams;
}

export function PurchaseResult({ simulation, purchase }: PurchaseResultProps) {
  const discount = purchase.cash_discount ?? null;
  return (
    <>
      <Verdict simulation={simulation} purchase={purchase} />

      {/* As duas perguntas */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <MetricHint hint={curveHint}>Que desconto pedir</MetricHint>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-ink-2">
              Com {purchase.installments} parcelas, peça pelo menos{" "}
              <MetricHint hint={breakEvenDiscountHint}>
                <b className="text-foreground tabular-nums">
                  {formatPercent(simulation.break_even_discount)}
                </b>
              </MetricHint>{" "}
              de desconto para pagar à vista valer a pena.
            </p>
            <BreakEvenChart
              simulation={simulation}
              installments={purchase.installments}
              discount={discount}
            />
            <span className="text-caption text-muted-foreground">
              Por número de parcelas. Acima da curva, pagar à vista vence; abaixo, parcelar.
            </span>
          </CardContent>
        </Card>
        <BreakEvenRates simulation={simulation} discount={discount} />
      </div>

      <Schedule simulation={simulation} />
    </>
  );
}
