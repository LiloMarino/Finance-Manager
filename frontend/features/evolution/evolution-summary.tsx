import { growthHint } from "@/features/evolution/hints";
import type { Evolution } from "@/features/evolution/use-evolution";
import { MetricHint } from "@/shared/components/metric-hint";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { portfolioCategoryConfig } from "@/shared/lib/portfolio-category";
import { formatBRL, formatSignedBRL, formatSignedPercent } from "@/types/decimal";

function GrowthMetric({
  months,
  growth,
}: {
  months: number;
  growth: Evolution["last_6_months"];
}) {
  return (
    <div className="flex flex-col gap-1">
      <MetricHint hint={growthHint(months)}>
        <span className="text-muted-foreground text-sm">{months} meses</span>
      </MetricHint>
      <span className="text-xl font-semibold tabular-nums">
        {growth ? formatSignedBRL(growth.change) : "—"}
      </span>
      {growth?.growth_return && (
        <span className="text-muted-foreground text-sm tabular-nums">
          {formatSignedPercent(growth.growth_return)}
        </span>
      )}
    </div>
  );
}

export function EvolutionSummary({ evolution }: { evolution: Evolution }) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
      {/* Total e crescimento */}
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-muted-foreground text-sm">Patrimônio atual</p>
          <p className="text-4xl font-semibold tabular-nums">{formatBRL(evolution.total)}</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <GrowthMetric months={6} growth={evolution.last_6_months} />
          <GrowthMetric months={12} growth={evolution.last_12_months} />
          <GrowthMetric months={24} growth={evolution.last_24_months} />
        </div>
      </div>

      {/* Total por categoria */}
      <Table className="lg:max-w-sm">
        <TableHeader>
          <TableRow>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Hoje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {evolution.categories.map((item) => (
            <TableRow key={item.category}>
              <TableCell>
                <span className="flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: portfolioCategoryConfig[item.category].color }}
                  />
                  {portfolioCategoryConfig[item.category].label}
                </span>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatBRL(item.value)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
