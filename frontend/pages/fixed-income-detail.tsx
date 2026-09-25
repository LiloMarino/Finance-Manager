import { Pencil } from "lucide-react";
import { useParams } from "react-router-dom";

import { FixedIncomeFormDialog } from "@/features/fixed-income/fixed-income-form-dialog";
import { MovementFormDialog } from "@/features/fixed-income/movement-form-dialog";
import { MovementsTable } from "@/features/fixed-income/movements-table";
import { useFixedIncome } from "@/features/fixed-income/use-fixed-income";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";
import { formatDate } from "@/shared/lib/format";
import { describeRate, fixedIncomeTypeLabels, indexerLabels } from "@/shared/lib/labels";
import { formatBRL } from "@/types/decimal";

export function FixedIncomeDetailPage() {
  const investmentId = Number(useParams().investmentId);
  const { data, isPending, error } = useFixedIncome(investmentId);

  if (error) {
    return <span className="text-destructive">{getApiErrorMessage(error)}</span>;
  }
  if (isPending) {
    return <Skeleton className="h-40 w-full" />;
  }

  const summary = [
    { label: "Aplicado", value: data.invested },
    { label: "Valor bruto", value: data.gross_value },
    { label: "IR estimado", value: data.estimated_tax },
    { label: "Valor líquido", value: data.net_value },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{data.label}</h1>
            <Badge variant="outline">{fixedIncomeTypeLabels[data.product_type]}</Badge>
            {data.tax_exempt && <Badge variant="secondary">Isento</Badge>}
            {data.daily_liquidity && <Badge variant="secondary">Liquidez diária</Badge>}
          </div>
          <p className="text-muted-foreground">
            {describeRate(data.indexer, data.rate)}
            {data.maturity_date && ` · vence em ${formatDate(data.maturity_date)}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FixedIncomeFormDialog
            investment={data}
            trigger={
              <Button variant="outline">
                <Pencil />
                Editar
              </Button>
            }
          />
          <MovementFormDialog investmentId={investmentId} />
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Marcação em {formatDate(data.as_of)}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            {summary.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="tabular-nums">{formatBRL(value)}</dd>
              </div>
            ))}
          </dl>
          {data.indexer !== "prefixed" && (
            <p className="text-muted-foreground text-sm">
              {data.series_date
                ? `${indexerLabels[data.indexer]} publicado até ${formatDate(data.series_date)}; depois disso, o último valor se repete.`
                : `Sem a série do ${indexerLabels[data.indexer]} em cache: o valor fica sem rendimento até a próxima atualização.`}
            </p>
          )}
        </CardContent>
      </Card>

      <MovementsTable movements={data.movements} />
    </div>
  );
}
