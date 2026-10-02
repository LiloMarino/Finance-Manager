import { useSearchParams } from "react-router-dom";

import { OperationsTable } from "@/features/operations/operations-table";
import { useOperations } from "@/features/operations/use-operations";
import { CategoryResultCard, DarfCard, PoolsCard } from "@/features/tax/darf-card";
import { IrpfReport } from "@/features/tax/irpf-report";
import { formatMonth } from "@/features/tax/labels";
import { MonthsTable } from "@/features/tax/months-table";
import { PeriodNavigator } from "@/features/tax/period-navigator";
import { PositionsSection } from "@/features/tax/positions-section";
import { type TaxParams, isTaxTab, readTaxParams, writeTaxParams } from "@/features/tax/tax-params";
import { type MonthlyTax, useIrpfReport, useTaxMonths, useTaxPeriod } from "@/features/tax/use-tax";
import { YearToggle } from "@/features/tax/year-toggle";
import { Metric, MetricStrip } from "@/shared/components/metric";
import { Money } from "@/shared/components/money";
import { PageHeader } from "@/shared/components/page-header";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { getApiErrorMessage } from "@/shared/lib/api";
import { monthLabel } from "@/shared/lib/months";

function isoDate(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
}

export function TaxPage() {
  const { data, isPending, error } = useTaxMonths();
  const today = new Date();
  const [searchParams, setSearchParams] = useSearchParams();
  const current = readTaxParams(searchParams, today);

  // A aba e o período moram na URL: as setas, a grade e o voltar do navegador andam
  // pelo histórico, e um link abre a mesma tela
  const go = (next: Partial<TaxParams>) =>
    setSearchParams((params) => writeTaxParams(params, { ...current, ...next }));

  return (
    <Tabs
      value={current.tab}
      onValueChange={(value) => {
        if (isTaxTab(value)) go({ tab: value });
      }}
      className="gap-6"
    >
      <PageHeader
        title="Fiscal"
        description="Apuração mensal do IR sobre renda variável, pelas regras da Receita, com o DARF de cada mês. Ainda sem o custo da bonificação, as taxas da nota e o IRRF retido: o imposto calculado só pode sair maior que o devido."
      >
        <TabsList>
          <TabsTrigger value="monthly">Mês</TabsTrigger>
          <TabsTrigger value="all">Todos os meses</TabsTrigger>
          <TabsTrigger value="irpf">IRPF</TabsTrigger>
        </TabsList>
      </PageHeader>

      {isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : (
        <TaxContent months={data} current={current} go={go} today={today} />
      )}
    </Tabs>
  );
}

interface TaxContentProps {
  months: MonthlyTax[];
  current: TaxParams;
  go: (next: Partial<TaxParams>) => void;
  today: Date;
}

function TaxContent({ months, current, go, today }: TaxContentProps) {
  const { year, month } = current;

  // Anos navegáveis: da primeira apuração até o ano corrente
  const firstYear = months[0]?.year ?? today.getFullYear();
  const lastYear = Math.max(today.getFullYear(), months.at(-1)?.year ?? firstYear);
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);

  const openMonth = (item: MonthlyTax) =>
    go({ tab: "monthly", year: item.year, month: item.month });

  return (
    <>
      <TabsContent value="monthly" className="flex flex-col gap-6">
        <PeriodNavigator years={years} year={year} month={month} onChange={go} />
        <MonthView year={year} month={month} />
      </TabsContent>

      <TabsContent value="all" className="flex flex-col gap-6">
        <YearToggle years={years} year={year} onChange={(next) => go({ year: next })} />
        <YearView year={year} months={months} onSelect={openMonth} />
      </TabsContent>

      <TabsContent value="irpf" className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <span className="text-caption text-muted-foreground">Declaração de</span>
          <YearToggle years={years} year={year} onChange={(next) => go({ year: next })} />
        </div>
        <IrpfView year={year} />
      </TabsContent>
    </>
  );
}

function MonthView({ year, month }: { year: number; month: number }) {
  const report = useTaxPeriod(year, month);
  const operations = useOperations({
    start: isoDate(year, month, 1),
    end: isoDate(year, month + 1, 0),
  });

  if (report.error) {
    return <span className="text-destructive">{getApiErrorMessage(report.error)}</span>;
  }
  if (report.isPending) {
    return <Skeleton className="h-40 w-full" />;
  }

  const [assessed] = report.data.months;

  return (
    <>
      {assessed ? (
        <>
          {/* O DARF primeiro, e o caminho até ele */}
          <DarfCard month={assessed} />
          <div className="grid gap-4 xl:grid-cols-2">
            <CategoryResultCard month={assessed} />
            <PoolsCard month={assessed} />
          </div>
        </>
      ) : (
        <p className="text-muted-foreground">
          Sem apuração em {formatMonth(year, month)}: o mês está fora do histórico de operações.
        </p>
      )}

      {/* Operações do mês */}
      <Card>
        <CardHeader>
          <CardTitle>Operações do mês</CardTitle>
          <CardAction>
            <CardDescription>
              {operations.data?.length ?? 0}{" "}
              {operations.data?.length === 1 ? "operação" : "operações"}
            </CardDescription>
          </CardAction>
        </CardHeader>
        <CardContent data-flush>
          {operations.isPending ? (
            <Skeleton className="h-24 w-full" />
          ) : operations.error ? (
            <span className="text-destructive">{getApiErrorMessage(operations.error)}</span>
          ) : (
            <OperationsTable operations={operations.data} />
          )}
        </CardContent>
      </Card>

      <PositionsSection report={report.data} period="mês" />
    </>
  );
}

interface YearViewProps {
  year: number;
  months: MonthlyTax[];
  onSelect: (month: MonthlyTax) => void;
}

function YearView({ year, months, onSelect }: YearViewProps) {
  const report = useTaxPeriod(year);

  if (report.error) {
    return <span className="text-destructive">{getApiErrorMessage(report.error)}</span>;
  }
  if (report.isPending) {
    return <Skeleton className="h-40 w-full" />;
  }

  const { data } = report;
  const firstUnpaid = data.months.find(
    (item) => item.status === "due" || item.status === "overdue",
  );

  return (
    <>
      <MetricStrip>
        <Metric
          label={`Imposto em ${year}`}
          size="lg"
          value={<Money value={data.darf_total} />}
          detail={`${data.darf_count} ${data.darf_count === 1 ? "DARF" : "DARFs"}`}
        />
        <Metric
          label="Pago"
          value={<Money value={data.paid_total} />}
          detail={`${data.paid_count} de ${data.darf_count} DARFs`}
        />
        <Metric
          label="A pagar"
          value={<Money value={data.to_pay_total} />}
          tone={data.to_pay_count > 0 ? "text-destructive" : ""}
          detail={
            firstUnpaid
              ? `${monthLabel(firstUnpaid.year, firstUnpaid.month)}${firstUnpaid.status === "overdue" ? ", vencido" : ""}`
              : "nada em aberto"
          }
        />
      </MetricStrip>

      <MonthsTable
        months={months
          .filter((item) => item.year === year && item.categories.length > 0)
          .toReversed()}
        onSelect={onSelect}
      />
    </>
  );
}

function IrpfView({ year }: { year: number }) {
  const { data, isPending, error } = useIrpfReport(year);

  if (error) {
    return <span className="text-destructive">{getApiErrorMessage(error)}</span>;
  }
  if (isPending) {
    return <Skeleton className="h-40 w-full" />;
  }
  return <IrpfReport report={data} />;
}
