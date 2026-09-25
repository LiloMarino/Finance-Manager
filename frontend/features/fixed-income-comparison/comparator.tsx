import { Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { ComparisonChart } from "@/features/fixed-income-comparison/comparison-chart";
import { chartHint } from "@/features/fixed-income-comparison/hints";
import { OptionCard } from "@/features/fixed-income-comparison/option-card";
import { OptionFormDialog } from "@/features/fixed-income-comparison/option-form-dialog";
import {
  type ComparisonOption,
  MAX_OPTIONS,
  readOptions,
  writeOptions,
} from "@/features/fixed-income-comparison/options";
import { useComparison } from "@/features/fixed-income-comparison/use-comparison";
import { MetricHint } from "@/shared/components/metric-hint";
import { ProjectionForm } from "@/shared/components/projection-form";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { CurrentRates } from "@/shared/hooks/use-current-rates";
import { getApiErrorMessage } from "@/shared/lib/api";
import { isoDate } from "@/shared/lib/period";
import {
  completeProjection,
  isProjectionEdited,
  projectionDraft,
  writeProjection,
} from "@/shared/lib/projection";
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

export function Comparator({ current }: { current: CurrentRates }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const options = readOptions(searchParams);
  const draft = projectionDraft(searchParams, current);
  const projection = completeProjection(draft);
  const { data, error } = useComparison(projection && { options, projection });
  // Enquanto a resposta nova não chega, a anterior pode ter outro número de opções
  const comparison = data && data.results.length === options.length ? data : undefined;

  const saveOptions = (next: ComparisonOption[]) =>
    setSearchParams((params) => writeOptions(params, next));

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent>
          <ProjectionForm
            current={current}
            draft={draft}
            edited={isProjectionEdited(searchParams)}
            onApply={(next) =>
              setSearchParams((params) => writeProjection(params, next, current))
            }
            onReset={() => setSearchParams((params) => writeProjection(params, null, current))}
          />
        </CardContent>
      </Card>

      {/* Opções lado a lado */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Opções ({options.length})</h2>
        <OptionFormDialog
          title="Nova opção"
          option={suggestedOption(options)}
          onSave={(option) => saveOptions([...options, option])}
          trigger={
            <Button disabled={options.length >= MAX_OPTIONS}>
              <Plus />
              Adicionar opção
            </Button>
          }
        />
      </div>
      {error && <span className="text-destructive">{getApiErrorMessage(error)}</span>}
      {!projection && (
        <p className="text-muted-foreground">
          Falta a projeção de alguma série: informe as três taxas acima.
        </p>
      )}
      {options.length === 0 ? (
        <p className="text-muted-foreground">
          Adicione as opções que quer comparar: cada uma com o tipo, a taxa, o valor e
          as datas de aplicação e resgate.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {options.map((option, index) => (
            <OptionCard
              key={index}
              option={option}
              result={comparison?.results[index]}
              best={comparison?.best === index && options.length > 1}
              onSave={(saved) =>
                saveOptions(options.map((item, position) => (position === index ? saved : item)))
              }
              onRemove={() =>
                saveOptions(options.filter((_, position) => position !== index))
              }
            />
          ))}
        </div>
      )}

      {/* Evolução do líquido */}
      {comparison && comparison.points.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              <MetricHint hint={chartHint}>Valor líquido no tempo</MetricHint>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ComparisonChart options={options} comparison={comparison} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
