import { Fragment } from "react";

import { accumulatedHint, yearHint } from "@/features/monthly-returns/hints";
import { signClass } from "@/features/monthly-returns/months";
import { monthLabels } from "@/shared/lib/months";
import type {
  MonthlyReturns,
  YearReturns,
} from "@/features/monthly-returns/use-monthly-returns";
import { MetricHint } from "@/shared/components/metric-hint";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { type Benchmark, benchmarkConfig } from "@/shared/lib/benchmark";
import { cn } from "@/shared/lib/utils";
import { type DecimalString, formatSignedPercent } from "@/types/decimal";

function ReturnCell({
  value,
  reference,
  strong,
}: {
  value: DecimalString | null | undefined;
  reference: boolean;
  strong?: boolean;
}) {
  return (
    <TableCell
      className={cn(
        "text-right tabular-nums",
        strong && "font-semibold",
        value && (reference ? "text-muted-foreground" : signClass(value)),
      )}
    >
      {value ? formatSignedPercent(value) : <span className="text-muted-foreground">—</span>}
    </TableCell>
  );
}

function ReturnsRow({
  label,
  returns,
  reference = false,
}: {
  label: string;
  returns: YearReturns | undefined;
  reference?: boolean;
}) {
  return (
    <TableRow className={cn(reference && "border-b-2")}>
      <TableCell className={cn("font-medium", reference && "text-muted-foreground")}>
        {label}
      </TableCell>
      {monthLabels.map((month, index) => (
        <ReturnCell key={month} value={returns?.months[index]} reference={reference} />
      ))}
      <ReturnCell value={returns?.year_return} reference={reference} strong />
      <ReturnCell value={returns?.accumulated} reference={reference} strong />
    </TableRow>
  );
}

interface MonthlyReturnsTableProps {
  monthly: MonthlyReturns;
  benchmark: Benchmark | undefined;
}

export function MonthlyReturnsTable({ monthly, benchmark }: MonthlyReturnsTableProps) {
  const reference = monthly.benchmarks.find((found) => found.series === benchmark);
  const referenceYears = new Map(reference?.years.map((found) => [found.year, found]));
  // O ano mais recente no topo
  const years = [...monthly.years].reverse();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ano</TableHead>
          {monthLabels.map((month) => (
            <TableHead key={month} className="text-right">
              {month}
            </TableHead>
          ))}
          <TableHead className="text-right">
            <MetricHint hint={yearHint}>No ano</MetricHint>
          </TableHead>
          <TableHead className="text-right">
            <MetricHint hint={accumulatedHint}>Acumulado</MetricHint>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {years.map((found) => (
          <Fragment key={found.year}>
            <ReturnsRow label={String(found.year)} returns={found} />
            {benchmark && (
              <ReturnsRow
                label={benchmarkConfig[benchmark].label}
                returns={referenceYears.get(found.year)}
                reference
              />
            )}
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
}
