import { useParams } from "react-router-dom";

import { FixedIncomeFormDialog } from "@/features/fixed-income/fixed-income-form-dialog";
import { MovementFormDialog } from "@/features/fixed-income/movement-form-dialog";
import { MovementsTable } from "@/features/fixed-income/movements-table";
import { useFixedIncome } from "@/features/fixed-income/use-fixed-income";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Alert } from "@/shared/components/ui/alert";
import { PageHeader } from "@/shared/components/page-header";
import { Metric, MetricStrip } from "@/shared/components/metric";
import { Money } from "@/shared/components/money";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";
import { formatDate } from "@/shared/lib/format";
import { describeRate, fixedIncomeTypeLabels, indexerLabels } from "@/shared/lib/labels";

export function FixedIncomeDetailPage() {
  const investmentId = Number(useParams().investmentId);
  const { data, isPending, error } = useFixedIncome(investmentId);

  if (error) {
    return <span className="text-destructive">{getApiErrorMessage(error)}</span>;
  }
  if (isPending) {
    return <Skeleton className="h-40 w-full" />;
  }

  return (
    <>
      <PageHeader
        title={data.label}
        breadcrumb={{
          parents: [{ label: "Renda fixa", to: "/fixed-income" }],
          current: data.label,
        }}
        description={
          describeRate(data.indexer, data.rate) +
          (data.maturity_date ? ` · vence em ${formatDate(data.maturity_date)}` : "")
        }
        actions={
          <>
            <FixedIncomeFormDialog
              investment={data}
              trigger={<Button variant="outline">Editar</Button>}
            />
            <MovementFormDialog investmentId={investmentId} />
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{fixedIncomeTypeLabels[data.product_type]}</Badge>
          {data.tax_exempt && <Badge variant="outline">Isento</Badge>}
          {data.daily_liquidity && <Badge variant="outline">Liquidez diária</Badge>}
        </div>
      </PageHeader>

      {/* Marcação em data */}
      <MetricStrip>
        <Metric label="Aplicado" size="lg" value={<Money value={data.invested} />} />
        <Metric
          label="Valor bruto"
          size="lg"
          value={<Money value={data.gross_value} />}
          detail={`marcado em ${formatDate(data.as_of)}`}
        />
        <Metric
          label="IR estimado"
          size="lg"
          value={<Money value={data.estimated_tax} />}
          detail={data.tax_exempt ? "título isento" : "pelo tempo de cada aplicação"}
        />
        <Metric
          label="Valor líquido"
          size="lg"
          value={<Money value={data.net_value} />}
          detail="se resgatar hoje"
        />
      </MetricStrip>

      {/* Movimentações */}
      <MovementsTable movements={data.movements} />

      {/* Nota sobre a série */}
      {data.indexer !== "prefixed" && (
        <Alert>
          {data.series_date
            ? `${indexerLabels[data.indexer]} publicado até ${formatDate(data.series_date)}; depois disso, o último valor se repete.`
            : `Sem a série do ${indexerLabels[data.indexer]} em cache: o valor fica sem rendimento até a próxima atualização.`}
        </Alert>
      )}
    </>
  );
}
