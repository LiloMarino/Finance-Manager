import { useSearchParams } from "react-router-dom";

import { CashOrAdvanceForm } from "@/features/installments/cash-or-advance-form";
import { cashBreakEvenHint } from "@/features/installments/hints";
import {
  type CashOrAdvanceParams,
  readCashOrAdvance,
  writeCashOrAdvance,
} from "@/features/installments/installments-params";
import { type CashOrAdvance, useCashOrAdvance } from "@/features/installments/use-installments";
import { VerdictCard } from "@/features/installments/verdict-card";
import { Metric } from "@/shared/components/metric";
import { Money } from "@/shared/components/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { getApiErrorMessage } from "@/shared/lib/api";
import { formatDate } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { type DecimalString, formatPercent, formatQuantity, toChartNumber } from "@/types/decimal";

function Verdict({ result, value }: { result: CashOrAdvance; value: CashOrAdvanceParams }) {
  const breakEven = formatPercent(result.break_even_discount);
  const advanced = value.installments - 1;
  const title =
    result.winner === "installments" ? (
      <>
        Parcelar e adiantar sai <Money value={result.difference} /> mais barato
      </>
    ) : result.winner === "cash" ? (
      <>
        À vista sai <Money value={result.difference} /> mais barato
      </>
    ) : (
      "Os dois caminhos saem pelo mesmo valor"
    );
  const text =
    result.winner === "installments"
      ? `O banco desconta as ${advanced} parcelas adiantadas e o total fica abaixo do preço à vista. Só compensa pagar à vista com mais de ${breakEven} de desconto.`
      : `O desconto à vista é maior que o desconto do banco para adiantar. Parcelar e adiantar só venceria com desconto à vista abaixo de ${breakEven}.`;

  return (
    <VerdictCard title={title} text={text}>
      <Metric
        label="À vista"
        value={<Money value={result.cash_price} />}
        detail={
          <>
            {formatQuantity(value.cash_discount)}% de desconto sobre <Money value={result.price} />
          </>
        }
      />
      <Metric
        label="Parcelar e adiantar"
        value={<Money value={result.advanced_total} />}
        detail={
          advanced === 0
            ? "só a parcela da fatura atual"
            : `1ª parcela cheia + ${advanced} adiantadas`
        }
      />
      <Metric
        label="Desconto à vista que empata"
        hint={cashBreakEvenHint}
        value={breakEven}
        detail="abaixo disso, parcelar e adiantar vence"
      />
    </VerdictCard>
  );
}

interface PathBar {
  label: string;
  value: DecimalString;
  best: boolean;
}

/** Os três preços lado a lado, na escala do preço cheio. */
function PathBars({ result }: { result: CashOrAdvance }) {
  const bars: PathBar[] = [
    { label: "Preço cheio, parcelado", value: result.price, best: false },
    { label: "À vista", value: result.cash_price, best: result.winner === "cash" },
    {
      label: "Parcelar e adiantar",
      value: result.advanced_total,
      best: result.winner === "installments",
    },
  ];
  const scale = toChartNumber(result.price);

  return (
    <div className="flex flex-col gap-3">
      {bars.map((bar) => (
        <div
          key={bar.label}
          className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)_7.5rem] items-center gap-3"
        >
          <span className="text-ink-2">{bar.label}</span>
          <span className="bg-muted h-5 overflow-hidden rounded">
            <span
              className={cn(
                "block h-full w-(--bar) rounded",
                bar.best ? "bg-gain" : "bg-muted-foreground",
              )}
              style={{ "--bar": `${(toChartNumber(bar.value) / scale) * 100}%` }}
            />
          </span>
          <span className="text-right font-semibold tabular-nums">
            <Money value={bar.value} />
          </span>
        </div>
      ))}
    </div>
  );
}

function Breakdown({ result }: { result: CashOrAdvance }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quanto sai cada caminho</CardTitle>
      </CardHeader>
      <CardContent>
        <PathBars result={result} />
      </CardContent>
      <div className="border-border border-t">
        <CardContent data-flush>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parcela</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Meses adiantados</TableHead>
                <TableHead className="text-right">Paga ao adiantar</TableHead>
                <TableHead className="text-right">Desconto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.installments.map((row) => (
                <TableRow key={row.due_date}>
                  <TableCell>{row.months_ahead + 1}ª</TableCell>
                  <TableCell>{formatDate(row.due_date)}</TableCell>
                  <TableCell className="text-right">
                    <Money value={row.amount} />
                  </TableCell>
                  <TableCell
                    variant={row.months_ahead === 0 ? "muted" : undefined}
                    className="text-right"
                  >
                    {row.months_ahead === 0 ? "fatura atual" : row.months_ahead}
                  </TableCell>
                  <TableCell className="text-right">
                    <Money value={row.paid} />
                  </TableCell>
                  <TableCell className="text-right">
                    {row.months_ahead === 0 ? "—" : <Money value={row.discount} />}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow variant="total">
                <TableCell>Total</TableCell>
                <TableCell />
                <TableCell className="text-right">
                  <Money value={result.price} />
                </TableCell>
                <TableCell />
                <TableCell className="text-right">
                  <Money value={result.advanced_total} />
                </TableCell>
                <TableCell variant="gain" className="text-right">
                  <Money value={result.saved} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </div>
    </Card>
  );
}

/** Parcelar o preço cheio e adiantar logo em seguida, contra pagar à vista. */
export function CashOrAdvanceTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = readCashOrAdvance(searchParams);
  const { data, error } = useCashOrAdvance(value);

  return (
    <>
      <CashOrAdvanceForm
        value={value}
        onSubmit={(next) => setSearchParams((params) => writeCashOrAdvance(params, next))}
      />
      {error && <span className="text-destructive">{getApiErrorMessage(error)}</span>}
      {value && data && (
        <>
          <Verdict result={data} value={value} />
          <Breakdown result={data} />
        </>
      )}
    </>
  );
}
