import { ArrowUpFromLine, ListChecks, Settings2 } from "lucide-react";

import { CheckDialog, ThresholdDialog, WithdrawalDialog } from "@/features/cash/cash-dialogs";
import { EntriesTable } from "@/features/cash/entries-table";
import { cashHint } from "@/features/cash/labels";
import { useCash } from "@/features/cash/use-cash";
import { MetricHint } from "@/shared/components/metric-hint";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";
import { formatDate } from "@/shared/lib/format";
import { formatBRL } from "@/types/decimal";

export function CashPage() {
  const { data, isPending, error } = useCash();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Saldo</h1>
        <p className="text-muted-foreground">
          O dinheiro de investimento parado na corretora, calculado das operações, dos proventos e
          da renda fixa desde a abertura.
        </p>
      </div>

      {isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : (
        <>
          {/* Saldo de hoje */}
          <Card>
            <CardHeader>
              <CardDescription>
                <MetricHint hint={cashHint}>
                  <span>Saldo a reinvestir</span>
                </MetricHint>
              </CardDescription>
              {data.balance !== null && data.opened_on !== null ? (
                <>
                  <p className="flex flex-wrap items-center gap-3 text-4xl font-semibold">
                    {formatBRL(data.balance)}
                    {data.above_threshold && <Badge variant="destructive">Acima do limite</Badge>}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Aberto em {formatDate(data.opened_on)}. Limite de saldo parado:{" "}
                    {formatBRL(data.alert_threshold)}.
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">
                  O saldo ainda não foi aberto. Informe o saldo do extrato da corretora num dia, e
                  ele passa a ser calculado dali em diante.
                </p>
              )}
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <CheckDialog
                opened={data.opened_on !== null}
                trigger={
                  <Button>
                    <ListChecks />
                    {data.opened_on !== null ? "Conferir com o extrato" : "Abrir o saldo"}
                  </Button>
                }
              />
              {data.opened_on !== null && (
                <WithdrawalDialog
                  trigger={
                    <Button variant="outline">
                      <ArrowUpFromLine />
                      Registrar saque
                    </Button>
                  }
                />
              )}
              <ThresholdDialog
                threshold={data.alert_threshold}
                trigger={
                  <Button variant="outline">
                    <Settings2 />
                    Limite
                  </Button>
                }
              />
            </CardContent>
          </Card>

          {/* Extrato */}
          {data.entries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Extrato</CardTitle>
              </CardHeader>
              <CardContent>
                <EntriesTable entries={data.entries} />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
