import { lossPoolLabels } from "@/features/tax/labels";
import type { MonthlyTax } from "@/features/tax/use-tax";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { formatBRL } from "@/types/decimal";

interface LossesSectionProps {
  title: string;
  pools: MonthlyTax["pools"];
}

export function LossesSection({ title, pools }: LossesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          {pools.map((pool) => (
            <div key={pool.pool}>
              <dt className="text-muted-foreground">{lossPoolLabels[pool.pool]}</dt>
              <dd className="tabular-nums">{formatBRL(pool.loss_after)}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
