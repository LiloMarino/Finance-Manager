import { useSearchParams } from "react-router-dom";

import { ComparisonChart } from "@/features/fixed-income-comparison/comparison-chart";
import { chartHint } from "@/features/fixed-income-comparison/hints";
import { OptionCard } from "@/features/fixed-income-comparison/option-card";
import { type ComparisonOption } from "@/features/fixed-income-comparison/options";
import { useComparison } from "@/features/fixed-income-comparison/use-comparison";
import { MetricHint } from "@/shared/components/metric-hint";
import { ProjectionForm } from "@/shared/components/projection-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { CurrentRates } from "@/shared/hooks/use-current-rates";
import { getApiErrorMessage } from "@/shared/lib/api";
import {
  completeProjection,
  isProjectionEdited,
  projectionDraft,
  writeProjection,
} from "@/shared/lib/projection";

interface ComparatorProps {
  current: CurrentRates;
  options: ComparisonOption[];
  onChange: (options: ComparisonOption[]) => void;
}

/** A projeção das taxas, as opções lado a lado e o líquido de cada uma no tempo. */
export function Comparator({ current, options, onChange }: ComparatorProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const draft = projectionDraft(searchParams, current);
  const projection = completeProjection(draft);
  const { data, error } = useComparison(projection && { options, projection });
  // Enquanto a resposta nova não chega, a anterior pode ter outro número de opções
  const comparison = data && data.results.length === options.length ? data : undefined;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent>
          <ProjectionForm
            current={current}
            draft={draft}
            edited={isProjectionEdited(searchParams)}
            onApply={(next) => setSearchParams((params) => writeProjection(params, next, current))}
            onReset={() => setSearchParams((params) => writeProjection(params, null, current))}
          />
        </CardContent>
      </Card>

      {error && <span className="text-destructive">{getApiErrorMessage(error)}</span>}
      {!projection && (
        <p className="text-muted-foreground">
          Falta a projeção de alguma série: informe as três taxas acima.
        </p>
      )}
      {options.length === 0 ? (
        <p className="text-muted-foreground">
          Adicione as opções que quer comparar: cada uma com o tipo, a taxa, o valor e as datas de
          aplicação e resgate.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {options.map((option, index) => (
            <OptionCard
              key={index}
              option={option}
              index={index}
              result={comparison?.results[index]}
              best={comparison?.best === index && options.length > 1}
              onSave={(saved) =>
                onChange(options.map((item, position) => (position === index ? saved : item)))
              }
              onRemove={() => onChange(options.filter((_, position) => position !== index))}
            />
          ))}
        </div>
      )}

      {/* Evolução do líquido */}
      {comparison && comparison.points.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              <MetricHint hint={chartHint}>Líquido se resgatar em cada mês</MetricHint>
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
