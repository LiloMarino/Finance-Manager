import { useSearchParams } from "react-router-dom";

import { AdvanceChart, AdvanceLegend } from "@/features/installments/advance-chart";
import { AdvanceForm } from "@/features/installments/advance-form";
import { bankDiscountHint, earningsHint } from "@/features/installments/hints";
import {
  type AdvanceParams,
  readAdvance,
  writeAdvance,
  writeChosen,
} from "@/features/installments/installments-params";
import { type Advance, useAdvance } from "@/features/installments/use-installments";
import { VerdictCard } from "@/features/installments/verdict-card";
import { Metric } from "@/shared/components/metric";
import { Money } from "@/shared/components/money";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type { CurrentRates } from "@/shared/hooks/use-current-rates";
import { getApiErrorMessage } from "@/shared/lib/api";
import { formatDate } from "@/shared/lib/format";
import { fixedIncomeTypeLabels } from "@/shared/lib/labels";
import { isoDate } from "@/shared/lib/period";
import { completeProjection, projectionDraft } from "@/shared/lib/projection";
import { decimalAbs, decimalSign, formatRate } from "@/types/decimal";

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

function Verdict({ advance, value }: { advance: Advance; value: AdvanceParams }) {
  const sign = decimalSign(advance.difference);
  const gap = <Money value={decimalAbs(advance.difference)} />;
  const marked = plural(advance.chosen_count, "parcela marcada", "parcelas marcadas");
  const title =
    advance.installments.length === 0 ? (
      "Só falta a parcela da fatura atual"
    ) : advance.chosen_count === 0 ? (
      advance.recommended === 0 ? (
        "Deixar aplicado vence em todas as parcelas"
      ) : (
        "Nenhuma parcela marcada"
      )
    ) : sign > 0 ? (
      <>
        Adiantar {advance.chosen_count === 1 ? "a parcela marcada" : `as ${marked}`} vence por {gap}
      </>
    ) : sign < 0 ? (
      <>Deixar aplicado vence por {gap}</>
    ) : (
      "Adiantar e deixar aplicado empatam"
    );

  const rate = `${formatRate(advance.monthly_rate)}% ao mês`;
  const bank =
    value.bank_discount.kind === "rate"
      ? `O banco desconta ${rate}`
      : `Pelo valor que o banco pede, o desconto é de ${rate}`;
  const low = advance.earnings_rate_low && `${formatRate(advance.earnings_rate_low)}%`;
  const high = advance.earnings_rate_high && `${formatRate(advance.earnings_rate_high)}%`;
  const investment = fixedIncomeTypeLabels[value.investment.product_type];
  const earnings =
    low && high
      ? `; o ${investment} rende cerca de ${low === high ? low : `${low} a ${high}`} ao mês, já sem o IR`
      : "";
  const hint =
    advance.chosen_count === 0 && advance.recommended > 0
      ? ` O desconto vence o rendimento em ${plural(advance.recommended, "parcela", "parcelas")}: marque na tabela as que quer adiantar.`
      : "";
  const text = `${bank}${earnings}. A próxima parcela, da fatura atual, não entra.${hint}`;

  return (
    <VerdictCard title={title} text={text}>
      <Metric
        label="Paga hoje adiantando"
        value={<Money value={advance.paid_today} />}
        detail={
          <>
            {plural(advance.chosen_count, "parcela que soma", "parcelas que somam")}{" "}
            <Money value={advance.face} />
          </>
        }
      />
      <Metric
        label="Desconto do banco"
        hint={bankDiscountHint}
        tone="text-gain"
        value={<Money value={advance.discount} />}
        detail="confira com o desconto que o app do banco mostra"
      />
      <Metric
        label="Rendimento se deixar aplicado"
        hint={earningsHint}
        value={<Money value={advance.earnings} />}
        detail="líquido de IR, até cada vencimento"
      />
      <Metric
        label="Diferença"
        tone={sign > 0 ? "text-gain" : sign < 0 ? "text-loss" : ""}
        value={<Money value={advance.difference} signed />}
        detail={sign < 0 ? "a favor de deixar aplicado" : "a favor de adiantar"}
      />
    </VerdictCard>
  );
}

interface InstallmentsTableProps {
  advance: Advance;
  selected: number[];
  onToggle: (position: number, checked: boolean) => void;
}

function InstallmentsTable({ advance, selected, onToggle }: InstallmentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-7" />
          <TableHead>Vencimento</TableHead>
          <TableHead className="text-right">Parcela</TableHead>
          <TableHead className="text-right">Paga hoje</TableHead>
          <TableHead className="text-right">Desconto</TableHead>
          <TableHead className="text-right">Rendimento</TableHead>
          <TableHead>Melhor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* A parcela da fatura atual, que não se adianta */}
        <TableRow>
          <TableCell>
            <Checkbox
              checked={false}
              disabled
              aria-label={`A parcela de ${formatDate(advance.current_due_date)} está na fatura atual`}
            />
          </TableCell>
          <TableCell>{formatDate(advance.current_due_date)}</TableCell>
          <TableCell className="text-right">
            <Money value={advance.current_amount} />
          </TableCell>
          <TableCell variant="muted" className="text-right">
            fatura atual
          </TableCell>
          <TableCell variant="muted" className="text-right">
            —
          </TableCell>
          <TableCell variant="muted" className="text-right">
            —
          </TableCell>
          <TableCell>
            <Badge variant="outline">Sem desconto</Badge>
          </TableCell>
        </TableRow>
        {advance.installments.map((row) => (
          <TableRow key={row.position}>
            <TableCell>
              <Checkbox
                checked={selected.includes(row.position)}
                onCheckedChange={(checked) => onToggle(row.position, checked)}
                aria-label={`Adiantar a parcela de ${formatDate(row.due_date)}`}
              />
            </TableCell>
            <TableCell>{formatDate(row.due_date)}</TableCell>
            <TableCell className="text-right">
              <Money value={row.amount} />
            </TableCell>
            <TableCell className="text-right">
              <Money value={row.paid_today} />
            </TableCell>
            <TableCell className="text-right">
              <Money value={row.discount} />
            </TableCell>
            <TableCell className="text-right">
              <Money value={row.earnings} />
            </TableCell>
            <TableCell>
              {row.advance_wins ? (
                <Badge variant="gain">Adiantar</Badge>
              ) : (
                <Badge variant="outline">Deixar aplicado</Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
        <TableRow variant="total">
          <TableCell />
          <TableCell>{plural(advance.chosen_count, "marcada", "marcadas")}</TableCell>
          <TableCell className="text-right">
            <Money value={advance.face} />
          </TableCell>
          <TableCell className="text-right">
            <Money value={advance.paid_today} />
          </TableCell>
          <TableCell variant="gain" className="text-right">
            <Money value={advance.discount} />
          </TableCell>
          <TableCell className="text-right">
            <Money value={advance.earnings} />
          </TableCell>
          <TableCell />
        </TableRow>
      </TableBody>
    </Table>
  );
}

/** Adiantar as parcelas que faltam, com o desconto do banco, contra deixar o dinheiro
aplicado até cada vencimento. A escolha das parcelas mora na URL (`?pick=`). */
export function AdvanceTab({ current }: { current: CurrentRates }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = readAdvance(searchParams);
  const projection = completeProjection(projectionDraft(searchParams, current));
  // A decisão é tomada hoje: é daqui que o dinheiro fica aplicado
  const { data, error } = useAdvance(
    value && projection ? { ...value, start_date: isoDate(new Date()), projection } : null,
  );

  // A escolha da URL vale na hora; sem ela, a que o backend devolveu
  const selected =
    value?.chosen ??
    data?.installments.filter((row) => row.chosen).map((row) => row.position) ??
    [];
  const toggle = (position: number, checked: boolean) => {
    const next = checked
      ? [...selected, position].sort((a, b) => a - b)
      : selected.filter((item) => item !== position);
    setSearchParams((params) => writeChosen(params, next), { replace: true });
  };
  const resetChoice = () =>
    setSearchParams(
      (params) => {
        params.delete("pick");
        return params;
      },
      { replace: true },
    );

  return (
    <>
      <AdvanceForm
        value={value}
        current={current}
        onSubmit={(next) => setSearchParams((params) => writeAdvance(params, next))}
      />
      {error && <span className="text-destructive">{getApiErrorMessage(error)}</span>}
      {!projection && (
        <p className="text-muted-foreground">
          Falta a projeção de alguma série: informe as três taxas em Alterar.
        </p>
      )}
      {value && data && (
        <>
          <Verdict advance={data} value={value} />
          <Card>
            <CardHeader>
              <CardTitle>Desconto e rendimento, parcela a parcela</CardTitle>
              <CardAction className="flex items-center gap-4">
                <AdvanceLegend />
                {value.chosen && (
                  <Button variant="ghost" size="sm" onClick={resetChoice}>
                    Marcar as que o desconto vence
                  </Button>
                )}
              </CardAction>
            </CardHeader>
            <CardContent className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <div className="flex flex-col gap-2">
                {data.installments.length > 0 && <AdvanceChart advance={data} />}
                <span className="text-caption text-muted-foreground">
                  Quanto mais longe a parcela, maior o desconto: por isso, sem dinheiro para todas,
                  comece pelas últimas.
                </span>
              </div>
              <InstallmentsTable advance={data} selected={selected} onToggle={toggle} />
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
