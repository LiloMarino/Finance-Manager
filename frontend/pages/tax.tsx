import { useState } from "react";

import { OperationsTable } from "@/features/operations/operations-table";
import { useOperations } from "@/features/operations/use-operations";
import { DarfCard } from "@/features/tax/darf-card";
import { formatMonth } from "@/features/tax/labels";
import { LossesSection } from "@/features/tax/losses-section";
import { MonthsTable } from "@/features/tax/months-table";
import { type Period, PeriodNavigator } from "@/features/tax/period-navigator";
import { PositionsSection } from "@/features/tax/positions-section";
import { type MonthlyTax, useTaxMonths, useTaxPeriod } from "@/features/tax/use-tax";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { getApiErrorMessage } from "@/shared/lib/api";

export function TaxPage() {
  const { data, isPending, error } = useTaxMonths();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Fiscal</h1>
        <p className="text-muted-foreground">
          Apuração mensal do IR sobre renda variável, pelas regras da Receita, com o DARF
          de cada mês.
        </p>
      </div>

      {isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : (
        <TaxTabs months={data} />
      )}
    </div>
  );
}

function isoDate(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
}

function TaxTabs({ months }: { months: MonthlyTax[] }) {
  const today = new Date();
  const [tab, setTab] = useState("monthly");
  const [period, setPeriod] = useState<Period>({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  });

  // Anos navegáveis: da primeira apuração até o ano corrente
  const firstYear = months[0]?.year ?? today.getFullYear();
  const lastYear = Math.max(today.getFullYear(), months.at(-1)?.year ?? firstYear);
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);

  const openMonth = (month: MonthlyTax) => {
    setPeriod({ year: month.year, month: month.month });
    setTab("monthly");
  };

  return (
    <Tabs value={tab} onValueChange={setTab} className="gap-6">
      <TabsList>
        <TabsTrigger value="monthly">Mensal</TabsTrigger>
        <TabsTrigger value="yearly">Anual</TabsTrigger>
        <TabsTrigger value="all">Todos os meses</TabsTrigger>
      </TabsList>

      <TabsContent value="monthly" className="flex flex-col gap-6">
        <PeriodNavigator
          years={years}
          year={period.year}
          month={period.month}
          onChange={setPeriod}
        />
        <PeriodView year={period.year} month={period.month} />
      </TabsContent>

      <TabsContent value="yearly" className="flex flex-col gap-6">
        <PeriodNavigator
          years={years}
          year={period.year}
          onChange={({ year }) => setPeriod({ ...period, year })}
        />
        <PeriodView year={period.year} onSelectMonth={openMonth} />
      </TabsContent>

      <TabsContent value="all">
        <MonthsTable months={[...months].reverse()} onSelect={openMonth} />
      </TabsContent>
    </Tabs>
  );
}

interface PeriodViewProps {
  year: number;
  /** Sem `month`, o ano inteiro. */
  month?: number;
  onSelectMonth?: (month: MonthlyTax) => void;
}

function PeriodView({ year, month, onSelectMonth }: PeriodViewProps) {
  const report = useTaxPeriod(year, month);
  const start = isoDate(year, month ?? 1, 1);
  const end = month === undefined ? isoDate(year, 12, 31) : isoDate(year, month + 1, 0);
  const operations = useOperations({ start, end });

  if (report.error) {
    return <span className="text-destructive">{getApiErrorMessage(report.error)}</span>;
  }
  if (report.isPending) {
    return <Skeleton className="h-40 w-full" />;
  }

  const byMonth = month !== undefined;
  const [assessed] = report.data.months;
  const lastMonth = report.data.months.at(-1);

  return (
    <div className="flex flex-col gap-6">
      <PositionsSection
        title={byMonth ? "Posições no início do mês" : "Posições no início do ano"}
        positions={report.data.opening}
      />

      <Card>
        <CardHeader>
          <CardTitle>Operações</CardTitle>
        </CardHeader>
        <CardContent>
          {operations.isPending ? (
            <Skeleton className="h-24 w-full" />
          ) : operations.error ? (
            <span className="text-destructive">{getApiErrorMessage(operations.error)}</span>
          ) : (
            <OperationsTable operations={operations.data} />
          )}
        </CardContent>
      </Card>

      <PositionsSection
        title={byMonth ? "Posições no fim do mês" : "Posições no fim do ano"}
        positions={report.data.closing}
      />

      {byMonth ? (
        assessed ? (
          <DarfCard month={assessed} />
        ) : (
          <p className="text-muted-foreground">
            Sem apuração em {formatMonth(year, month)}: o mês está fora do histórico de
            operações.
          </p>
        )
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Resumo de DARFs</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthsTable months={report.data.months} onSelect={onSelectMonth} />
          </CardContent>
        </Card>
      )}

      {lastMonth && (
        <LossesSection
          title={byMonth ? "Prejuízo a compensar no fim do mês" : "Prejuízo a compensar no fim do ano"}
          pools={lastMonth.pools}
        />
      )}
    </div>
  );
}
