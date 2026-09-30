import { TriangleAlert, Wallet } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { imbalanceHint } from "@/features/rebalance/hints";
import { usePlan } from "@/features/rebalance/use-rebalance";
import { MetricHint } from "@/shared/components/metric-hint";
import { MoneyInput } from "@/shared/components/money-input";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Switch } from "@/shared/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { getApiErrorMessage } from "@/shared/lib/api";
import { maskMoney } from "@/shared/lib/mask";
import {
  type DecimalString,
  formatBRL,
  formatPercent,
  formatPoints,
  formatQuantity,
  formatSignedBRL,
  isZero,
  parseDecimalInput,
  parseDecimalText,
  toMoneyInput,
} from "@/types/decimal";

interface ContributionCardProps {
  subportfolioId: number;
  /** O saldo de investimento da carteira geral, nulo antes da abertura. */
  cash: DecimalString | null;
}

/** O aporte e a opção de venda moram na URL (`?amount=&sales=1`): recarregar
mantém a sugestão. */
export function ContributionCard({ subportfolioId, cash }: ContributionCardProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const amount = parseDecimalText(searchParams.get("amount") ?? "");
  const allowSales = searchParams.get("sales") === "1";

  const update = (next: { amount?: DecimalString | null; sales?: boolean }) =>
    setSearchParams((params) => {
      if (next.amount !== undefined) {
        if (next.amount === null) params.delete("amount");
        else params.set("amount", next.amount);
      }
      if (next.sales !== undefined) {
        if (next.sales) params.set("sales", "1");
        else params.delete("sales");
      }
      return params;
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximo aporte</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <AmountForm
          key={amount ?? ""}
          amount={amount}
          onSubmit={(next) => update({ amount: next })}
        />
        <div className="flex flex-wrap items-center gap-4">
          {cash && !isZero(cash) && (
            <Button variant="outline" onClick={() => update({ amount: cash })}>
              <Wallet />
              Usar o saldo ({formatBRL(cash)})
            </Button>
          )}
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={allowSales}
              onCheckedChange={(checked) => update({ sales: checked })}
            />
            Permitir venda do que passou da meta
          </label>
        </div>
        {amount && (
          <PlanTable subportfolioId={subportfolioId} amount={amount} allowSales={allowSales} />
        )}
      </CardContent>
    </Card>
  );
}

interface AmountFormProps {
  amount: DecimalString | null;
  onSubmit: (amount: DecimalString | null) => void;
}

// O texto digitado é passageiro; só o valor calculado vai para a URL
function AmountForm({ amount, onSubmit }: AmountFormProps) {
  const [text, setText] = useState(amount ? toMoneyInput(amount) : "");
  const parsed = parseDecimalInput(text);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(text.trim() === "" ? null : parsed);
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
      <Field className="w-48">
        <FieldLabel htmlFor="contribution">Valor do aporte</FieldLabel>
        <MoneyInput
          id="contribution"
          value={text}
          onChange={(event) => setText(maskMoney(event.target.value))}
        />
      </Field>
      <Button type="submit" disabled={text.trim() !== "" && !parsed}>
        Dividir
      </Button>
    </form>
  );
}

interface PlanTableProps {
  subportfolioId: number;
  amount: DecimalString;
  allowSales: boolean;
}

function PlanTable({ subportfolioId, amount, allowSales }: PlanTableProps) {
  const { data, isPending, error } = usePlan({ subportfolioId, amount, allowSales });
  if (isPending) return <Skeleton className="h-40 w-full" />;
  if (error) return <span className="text-destructive">{getApiErrorMessage(error)}</span>;

  return (
    <div className="flex flex-col gap-4">
      {data.sells_equity && (
        <Alert>
          <TriangleAlert />
          <AlertTitle>A venda de renda variável pode gerar DARF</AlertTitle>
          <AlertDescription>
            Lucro em FII e ETF é tributado em qualquer valor; em ações, quando as vendas do mês
            passam de R$ 20 mil. A tela Fiscal mostra a apuração do mês.
          </AlertDescription>
        </Alert>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Cotas</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">Fica com</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.orders.map((order) => (
            <TableRow key={`${order.asset_id}-${order.label}`}>
              <TableCell className="font-medium">{order.label}</TableCell>
              <TableCell className="text-right tabular-nums">
                {order.quantity === null
                  ? order.asset_id === null
                    ? "—"
                    : "sem cotação"
                  : formatQuantity(order.quantity)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {isZero(order.amount) ? "—" : formatSignedBRL(order.amount)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatPercent(order.share_after)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <span>
          Sobra no saldo: <span className="text-foreground">{formatBRL(data.leftover)}</span>
        </span>
        <MetricHint hint={imbalanceHint}>
          <span>
            Desbalanceamento: {formatPoints(data.imbalance_before)} →{" "}
            <span className="text-foreground">{formatPoints(data.imbalance_after)}</span>
          </span>
        </MetricHint>
      </div>
    </div>
  );
}
