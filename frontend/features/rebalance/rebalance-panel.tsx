import { TriangleAlert } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { imbalanceHint } from "@/features/rebalance/hints";
import { ShareDonut, ShareLabel } from "@/features/rebalance/share-donut";
import { type Plan, usePlan } from "@/features/rebalance/use-rebalance";
import { itemColors } from "@/features/subportfolios/item-colors";
import { MetricHint } from "@/shared/components/metric-hint";
import { Money, Quantity } from "@/shared/components/money";
import { MoneyInput } from "@/shared/components/money-input";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
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
import { formatPercent } from "@/types/decimal";
import {
  type DecimalString,
  decimalSign,
  formatPoints,
  formatSignedPoints,
  isZero,
  parseDecimalInput,
  parseDecimalText,
  toMoneyInput,
} from "@/types/decimal";

interface AmountFormProps {
  amount: DecimalString | null;
  /** O saldo de investimento da carteira geral, nulo antes da abertura. */
  cash: DecimalString | null;
  allowSales: boolean;
  onAmount: (amount: DecimalString | null) => void;
  onSales: (allowSales: boolean) => void;
}

// O texto digitado é passageiro; só o valor calculado vai para a URL
function AmountForm({ amount, cash, allowSales, onAmount, onSales }: AmountFormProps) {
  const [text, setText] = useState(amount ? toMoneyInput(amount) : "");
  const parsed = parseDecimalInput(text);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onAmount(text.trim() === "" ? null : parsed);
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-4">
      <Field className="w-44">
        <FieldLabel htmlFor="contribution">Aporte</FieldLabel>
        <MoneyInput
          id="contribution"
          value={text}
          onChange={(event) => setText(maskMoney(event.target.value))}
        />
      </Field>
      {cash && !isZero(cash) && (
        <Button type="button" variant="ghost" onClick={() => onAmount(cash)}>
          Usar o saldo de <Money value={cash} />
        </Button>
      )}
      <label className="text-ink-2 flex h-control-md items-center gap-2">
        <Switch checked={allowSales} onCheckedChange={onSales} />
        Permitir vender o que passou da meta
      </label>
      <Button type="submit" className="ml-auto" disabled={text.trim() !== "" && !parsed}>
        Calcular
      </Button>
      {allowSales && (
        <span className="text-caption text-muted-foreground basis-full">
          Vendendo, o cálculo só tira dinheiro do que vira dinheiro antes do vencimento: ações, FIIs
          e renda fixa de liquidez diária. O que só vence no futuro fica onde está.
        </span>
      )}
    </form>
  );
}

function orderBadge(amount: DecimalString, isAsset: boolean) {
  return decimalSign(amount) < 0 ? (
    <Badge variant="sell">Vender</Badge>
  ) : (
    <Badge variant="buy">{isAsset ? "Comprar" : "Aplicar"}</Badge>
  );
}

function Suggestion({ plan }: { plan: Plan }) {
  const orders = plan.orders.filter((order) => !isZero(order.amount));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sugestão</CardTitle>
      </CardHeader>
      <CardContent data-flush>
        {orders.length === 0 ? (
          <p className="text-caption text-muted-foreground px-5">
            Nada a mexer: com esse aporte, os itens já estão o mais perto da meta que as cotas
            inteiras permitem.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ordem</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Cotas</TableHead>
                <TableHead className="text-right">Preço de referência</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={`${order.asset_id}-${order.label}`}>
                  <TableCell>{orderBadge(order.amount, order.asset_id !== null)}</TableCell>
                  <TableCell>
                    <span className={order.asset_id === null ? undefined : "text-ticker font-mono"}>
                      {order.label}
                    </span>
                    {order.asset_id === null && (
                      <span className="text-caption text-muted-foreground">
                        {" "}
                        · em qualquer título dela
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {order.quantity === null ? "—" : <Quantity value={order.quantity} />}
                  </TableCell>
                  <TableCell className="text-right">
                    {order.price === null ? "—" : <Money value={order.price} />}
                  </TableCell>
                  <TableCell className="text-right">
                    <Money value={order.amount} signed />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className="border-border text-caption text-ink-2 mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t px-5 pt-3">
          <span>
            Usa do saldo: <Money value={plan.used} />
          </span>
          <span>
            Sobra no saldo: <Money value={plan.leftover} />
          </span>
          {plan.sells_equity && (
            <span className="flex items-center gap-1.5">
              <TriangleAlert className="text-warning size-3.5" />A venda de renda variável pode
              gerar DARF: a tela Fiscal mostra a apuração do mês.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function BeforeAfter({ plan }: { plan: Plan }) {
  const colors = itemColors(plan.lines);
  const items = (pick: (line: Plan["lines"][number]) => DecimalString | null) =>
    plan.lines.map((line, index) => ({
      key: `${line.asset_id}-${line.label}`,
      label: line.label,
      isAsset: line.asset_id !== null,
      color: colors[index] ?? "var(--border-strong)",
      share: pick(line),
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <MetricHint hint={imbalanceHint}>Antes e depois</MetricHint>
        </CardTitle>
        <CardAction>
          <Badge variant="gain">
            Desbalanceamento de {formatPoints(plan.imbalance_before)} para{" "}
            {formatPoints(plan.imbalance_after)}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <ShareDonut
          heading="Antes"
          caption="como a subcarteira está hoje"
          items={items((line) => line.share_before)}
        />
        <ShareDonut
          heading="Depois"
          caption="com a sugestão aplicada"
          items={items((line) => line.share_after)}
        />
      </CardContent>
      <div className="border-border border-t pt-2">
        <CardContent data-flush>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Cotas</TableHead>
                <TableHead className="text-right">Valor antes</TableHead>
                <TableHead className="text-right">Valor depois</TableHead>
                <TableHead className="text-right">Meta</TableHead>
                <TableHead className="text-right">Desvio antes</TableHead>
                <TableHead className="text-right">Desvio depois</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plan.lines.map((line, index) => (
                <TableRow key={`${line.asset_id}-${line.label}`}>
                  <TableCell>
                    <ShareLabel
                      item={{
                        label: line.label,
                        isAsset: line.asset_id !== null,
                        color: colors[index] ?? "var(--border-strong)",
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {line.quantity_before === null || line.quantity_after === null ? (
                      "—"
                    ) : line.quantity_before === line.quantity_after ? (
                      <Quantity value={line.quantity_after} />
                    ) : (
                      <>
                        <Quantity value={line.quantity_before} /> →{" "}
                        <Quantity value={line.quantity_after} />
                      </>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Money value={line.value_before} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Money value={line.value_after} />
                  </TableCell>
                  <TableCell className="text-right">{formatPercent(line.target)}</TableCell>
                  <TableCell className="text-right">
                    {formatSignedPoints(line.deviation_before)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatSignedPoints(line.deviation_after)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow variant="total">
                <TableCell>Total</TableCell>
                <TableCell />
                <TableCell className="text-right">
                  <Money value={plan.total_before} />
                </TableCell>
                <TableCell className="text-right">
                  <Money value={plan.total_after} />
                </TableCell>
                <TableCell className="text-right">100,00%</TableCell>
                <TableCell className="text-right">{formatPoints(plan.imbalance_before)}</TableCell>
                <TableCell className="text-right">{formatPoints(plan.imbalance_after)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </div>
    </Card>
  );
}

function PlanResult({
  subportfolioId,
  amount,
  allowSales,
}: {
  subportfolioId: number;
  amount: DecimalString;
  allowSales: boolean;
}) {
  const { data, isPending, error } = usePlan({ subportfolioId, amount, allowSales });
  if (isPending) return <Skeleton className="h-64 w-full" />;
  if (error) return <span className="text-destructive">{getApiErrorMessage(error)}</span>;

  return (
    <>
      <Suggestion plan={data} />
      <BeforeAfter plan={data} />
      <Alert>
        <AlertTitle>É só uma sugestão: nada é gravado</AlertTitle>
        <AlertDescription>
          O preço que você vai pagar não é o do último fechamento. O rebalanceamento passa a valer
          quando você lançar as operações ou importar a nota de corretagem do dia.
        </AlertDescription>
        <AlertAction>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/import" />}>
            Importar nota
          </Button>
        </AlertAction>
      </Alert>
    </>
  );
}

interface RebalancePanelProps {
  subportfolioId: number;
  cash: DecimalString | null;
}

/** O aporte e a opção de venda moram na URL (`?amount=&sales=1`): recarregar mantém a
sugestão. */
export function RebalancePanel({ subportfolioId, cash }: RebalancePanelProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const amount = parseDecimalText(searchParams.get("amount") ?? "");
  const allowSales = searchParams.get("sales") === "1";

  const update = (next: { amount?: DecimalString | null; sales?: boolean }) =>
    setSearchParams(
      (params) => {
        if (next.amount !== undefined) {
          if (next.amount === null) params.delete("amount");
          else params.set("amount", next.amount);
        }
        if (next.sales !== undefined) {
          if (next.sales) params.set("sales", "1");
          else params.delete("sales");
        }
        return params;
      },
      { replace: true },
    );

  return (
    <>
      <Card>
        <CardContent>
          <AmountForm
            key={amount ?? ""}
            amount={amount}
            cash={cash}
            allowSales={allowSales}
            onAmount={(next) => update({ amount: next })}
            onSales={(next) => update({ sales: next })}
          />
        </CardContent>
      </Card>
      {amount && (
        <PlanResult subportfolioId={subportfolioId} amount={amount} allowSales={allowSales} />
      )}
    </>
  );
}
