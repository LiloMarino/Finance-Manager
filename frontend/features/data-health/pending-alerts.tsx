import { CircleAlert, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";

import { type DataIssue, useDataHealth } from "@/features/data-health/use-data-health";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { useValueFormat } from "@/shared/hooks/use-value-format";

// Na Carteira cabem poucas: o resto fica a um clique, na tela de Dados
const VISIBLE = 3;

const actionLabels: Partial<Record<DataIssue["kind"], string>> = {
  darf_due: "Ver no Fiscal",
  idle_cash: "Ver saldo",
  rebalance_breach: "Rebalancear",
  missing_prices: "Ver o ativo",
  late_series: "Ver mercado",
  fixed_income_without_application: "Ver o título",
};

/** Um aviso de pendência: o que falta no título, a consequência embaixo e o botão
que leva aonde se resolve. */
export function PendingAlert({ issue }: { issue: DataIssue }) {
  const format = useValueFormat();
  const critical = issue.severity === "critical";
  const Icon = critical ? CircleAlert : TriangleAlert;

  return (
    <Alert variant={critical ? "critical" : "warning"}>
      <Icon />
      <AlertTitle>{format.text(issue.missing)}</AlertTitle>
      <AlertDescription>
        {issue.kind === "darf_due" || issue.kind === "idle_cash"
          ? format.text(issue.affects)
          : `${issue.subject}: ${format.text(issue.affects)}`}
      </AlertDescription>
      <AlertAction>
        <Button variant="outline" size="sm" render={<Link to={issue.path} />}>
          {actionLabels[issue.kind] ?? "Resolver"}
        </Button>
      </AlertAction>
    </Alert>
  );
}

/** As pendências que pedem ação ou deixam um número errado, no topo da Carteira. */
export function PendingAlerts() {
  const { data: issues = [] } = useDataHealth();
  const pending = issues.filter((issue) => issue.severity !== "info");
  if (pending.length === 0) return null;

  return (
    <section aria-label="Pendências" className="flex flex-col gap-2">
      {pending.slice(0, VISIBLE).map((issue) => (
        <PendingAlert key={`${issue.kind}-${issue.subject}`} issue={issue} />
      ))}
      {pending.length > VISIBLE && (
        <Button variant="ghost" size="sm" className="self-start" render={<Link to="/data" />}>
          Ver as {pending.length} pendências
        </Button>
      )}
    </section>
  );
}
