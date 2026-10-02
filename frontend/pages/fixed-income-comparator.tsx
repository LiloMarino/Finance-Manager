import { Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { Comparator } from "@/features/fixed-income-comparison/comparator";
import { OptionFormDialog } from "@/features/fixed-income-comparison/option-form-dialog";
import {
  type ComparisonOption,
  MAX_OPTIONS,
  readOptions,
  writeOptions,
} from "@/features/fixed-income-comparison/options";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useCurrentRates } from "@/shared/hooks/use-current-rates";
import { getApiErrorMessage } from "@/shared/lib/api";
import { isoDate } from "@/shared/lib/period";
import { toDecimalString } from "@/types/decimal";

/** A nova opção herda o valor e as datas da última, que é o caso comum de comparar
títulos no mesmo prazo. */
function suggestedOption(options: ComparisonOption[]): ComparisonOption {
  const last = options.at(-1);
  const today = new Date();
  const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  return {
    label: `Opção ${options.length + 1}`,
    product_type: "cdb",
    indexer: "cdi",
    rate: toDecimalString("100"),
    amount: last?.amount ?? toDecimalString("1000"),
    application_date: last?.application_date ?? isoDate(today),
    redemption_date: last?.redemption_date ?? isoDate(nextYear),
  };
}

export function FixedIncomeComparatorPage() {
  const { data: current, error } = useCurrentRates();
  const [searchParams, setSearchParams] = useSearchParams();
  const options = readOptions(searchParams);

  const saveOptions = (next: ComparisonOption[]) =>
    setSearchParams((params) => writeOptions(params, next));

  return (
    <>
      <PageHeader
        title="Comparador de renda fixa"
        description="Opções lado a lado, pelo que entregam líquido de IR e IOF. Nada é gravado."
        actions={
          <OptionFormDialog
            title="Nova opção"
            option={suggestedOption(options)}
            onSave={(option) => saveOptions([...options, option])}
            trigger={
              <Button variant="outline" disabled={options.length >= MAX_OPTIONS}>
                <Plus />
                Adicionar opção
              </Button>
            }
          />
        }
      />
      {error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : current ? (
        <Comparator current={current} options={options} onChange={saveOptions} />
      ) : (
        <Skeleton className="h-40 w-full" />
      )}
    </>
  );
}
