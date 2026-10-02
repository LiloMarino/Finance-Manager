import { ArrowUpFromLine, ListChecks, Wallet } from "lucide-react";

import { CheckDialog, ThresholdDialog, WithdrawalDialog } from "@/features/cash/cash-dialogs";
import { EntriesTable } from "@/features/cash/entries-table";
import { cashHint } from "@/features/cash/labels";
import { useCash } from "@/features/cash/use-cash";
import { PageHeader } from "@/shared/components/page-header";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";
import { formatDate } from "@/shared/lib/format";
import { Money } from "@/shared/components/money";
import { Metric, MetricStrip } from "@/shared/components/metric";

// Calcula o número de dias entre duas datas (formato "AAAA-MM-DD")
function daysBetween(from: string): number {
  const start = new Date(from);
  const end = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((end.getTime() - start.getTime()) / msPerDay);
}

// Encontra a data da última conferência ou abertura nas entries
function getLastCheckDate(entries: any[]): string | null {
  const checkEntries = entries.filter((e) => e.kind === "check" || e.kind === "opening");
  return checkEntries.length > 0 ? checkEntries[0].entry_date : null;
}

export function CashPage() {
  const { data, isPending, error } = useCash();

  // Antes da abertura, o botão de abrir fica só no estado vazio
  const actions = data?.opened_on ? (
    <>
      <WithdrawalDialog
        trigger={
          <Button variant="outline">
            <ArrowUpFromLine />
            Registrar saque
          </Button>
        }
      />
      <CheckDialog
        opened
        trigger={
          <Button>
            <ListChecks />
            Conferir com o extrato
          </Button>
        }
      />
    </>
  ) : undefined;

  return (
    <>
      <PageHeader
        title="Saldo"
        description="O dinheiro de investimento parado na corretora, calculado das operações, dos proventos e da renda fixa desde a abertura."
        actions={!isPending && !error ? actions : undefined}
      />

      {isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : data.opened_on === null ? (
        // Estado vazio: saldo ainda não aberto
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Wallet />
            </EmptyMedia>
            <EmptyTitle>O saldo ainda não foi aberto</EmptyTitle>
            <EmptyDescription>
              Informe o saldo do extrato da corretora num dia. Dali em diante, venda, provento e
              vencimento entram no saldo, e compra e aplicação saem dele, sem você lançar nada.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CheckDialog
              opened={false}
              trigger={
                <Button>
                  <ListChecks />
                  Abrir o saldo
                </Button>
              }
            />
          </EmptyContent>
        </Empty>
      ) : (
        <>
          {/* Indicadores */}
          <MetricStrip>
            <Metric
              label="Saldo a reinvestir"
              hint={cashHint}
              size="lg"
              detail={
                data.above_threshold && data.above_since
                  ? `parado há ${daysBetween(data.above_since)} dias`
                  : undefined
              }
            >
              <div className="flex items-center gap-2">
                <Money value={(data.balance ?? "0") as any} />
                {data.above_threshold && <Badge variant="warning">Acima do limite</Badge>}
              </div>
            </Metric>
            <Metric
              label="Limite de saldo parado"
              hint="Acima dele, o saldo vira pendência e entra no alerta diário"
              size="lg"
            >
              <div className="flex items-center gap-2">
                <Money value={data.alert_threshold} />
                <ThresholdDialog
                  threshold={data.alert_threshold}
                  trigger={
                    <Button variant="ghost" size="sm">
                      Alterar
                    </Button>
                  }
                />
              </div>
            </Metric>
            <Metric
              label="Última conferência"
              size="lg"
              value={
                getLastCheckDate(data.entries) ? formatDate(getLastCheckDate(data.entries)!) : "—"
              }
              detail={data.opened_on && `saldo aberto em ${formatDate(data.opened_on)}`}
            />
          </MetricStrip>

          {/* Extrato */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Extrato</CardTitle>
              <span className="text-caption text-muted-foreground">O mais recente primeiro</span>
            </CardHeader>
            <CardContent data-flush>
              <EntriesTable entries={data.entries} />
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
