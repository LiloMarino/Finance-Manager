import { Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { FixedIncomeFormDialog } from "@/features/fixed-income/fixed-income-form-dialog";
import { LiquiditySplitCard, MaturitiesCard } from "@/features/fixed-income/fixed-income-liquidity";
import { FixedIncomeTable } from "@/features/fixed-income/fixed-income-table";
import {
  type FixedIncomeSummary,
  useFixedIncomeSummary,
} from "@/features/fixed-income/use-fixed-income";
import { Metric, MetricStrip } from "@/shared/components/metric";
import { Money } from "@/shared/components/money";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { type FixedIncome, useFixedIncomeList } from "@/shared/hooks/use-fixed-income-list";
import { getApiErrorMessage } from "@/shared/lib/api";
import {
  type FixedIncomeType,
  fixedIncomeTypeLabels,
  fixedIncomeTypes,
  isFixedIncomeType,
} from "@/shared/lib/labels";
import { signClass } from "@/shared/lib/sign";
import { formatSignedPercent } from "@/types/decimal";

const taxHint =
  "O IR da renda fixa cai com o tempo de aplicação: 22,5% até 6 meses, 20% até 1 ano, 17,5% até 2 anos e 15% depois. Incide só sobre o rendimento, e LCI, LCA, CRI, CRA e debênture incentivada são isentas. Ex.: R$ 1.000 que renderam R$ 100 em 8 meses pagam R$ 20.";

// Nulo é todos os tipos
const typeItems = [
  { value: null, label: "Todos os tipos" },
  ...fixedIncomeTypes.map((type) => ({ value: type, label: fixedIncomeTypeLabels[type] })),
];

export function FixedIncomePage() {
  const list = useFixedIncomeList();
  const summary = useFixedIncomeSummary();
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  const selectedType = typeParam && isFixedIncomeType(typeParam) ? typeParam : null;

  const selectType = (value: FixedIncomeType | null) =>
    setSearchParams((params) => {
      if (value) params.set("type", value);
      else params.delete("type");
      return params;
    });

  const error = list.error ?? summary.error;

  return (
    <>
      <PageHeader
        title="Renda fixa"
        description="Valor marcado pela curva do indexador, com o IR regressivo estimado."
        actions={
          <FixedIncomeFormDialog
            trigger={
              <Button>
                <Plus />
                Novo título
              </Button>
            }
          />
        }
      >
        {/* Filtro de tipo */}
        <div className="flex items-center gap-2">
          <Select items={typeItems} value={selectedType} onValueChange={selectType}>
            <SelectTrigger size="sm" className="w-48" aria-label="Filtrar por tipo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typeItems.map((item) => (
                <SelectItem key={item.label} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      {error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : !list.data || !summary.data ? (
        <Skeleton className="h-40 w-full" />
      ) : list.data.length === 0 ? (
        <p className="text-muted-foreground">
          Nenhum título cadastrado. Cadastre o título com a primeira aplicação.
        </p>
      ) : (
        <FixedIncomeContent
          investments={list.data.filter(
            (item) => selectedType === null || item.product_type === selectedType,
          )}
          summary={summary.data}
          selectedType={selectedType}
        />
      )}
    </>
  );
}

function FixedIncomeContent({
  investments,
  summary,
  selectedType,
}: {
  investments: FixedIncome[];
  summary: FixedIncomeSummary;
  selectedType: FixedIncomeType | null;
}) {
  // Com um tipo escolhido, as somas são as do grupo dele
  const group = summary.by_type.find((item) => item.product_type === selectedType);
  const shown =
    selectedType === null
      ? summary
      : { ...summary, total: group ?? summary.total, by_type: group ? [group] : [] };
  const totals = shown.total;

  return (
    <>
      {/* Indicadores */}
      <MetricStrip>
        <Metric
          label="Valor bruto"
          size="lg"
          value={<Money value={totals.gross_value} />}
          detail={`${totals.count} ${totals.count === 1 ? "título" : "títulos"}, marcados hoje`}
        />
        <Metric
          label="Aplicado"
          size="lg"
          value={<Money value={totals.invested} />}
          detail={
            <span className={signClass(totals.gross_result)}>
              <Money value={totals.gross_result} signed />
              {totals.gross_return && ` ${formatSignedPercent(totals.gross_return)}`} de rendimento
              bruto
            </span>
          }
        />
        <Metric
          label="IR estimado"
          hint={taxHint}
          size="lg"
          value={<Money value={totals.estimated_tax} />}
          detail="se resgatar hoje"
        />
        <Metric
          label="Valor líquido"
          size="lg"
          value={<Money value={totals.net_value} />}
          detail="o que cai no saldo hoje"
        />
      </MetricStrip>

      {/* Títulos */}
      <FixedIncomeTable investments={investments} summary={shown} />

      {/* Liquidez e vencimentos */}
      {selectedType === null && (
        <div className="grid gap-4 lg:grid-cols-2">
          <LiquiditySplitCard summary={summary} />
          <MaturitiesCard investments={investments} />
        </div>
      )}
    </>
  );
}
