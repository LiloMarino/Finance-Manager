import { useSearchParams } from "react-router-dom";

import { BalanceChart } from "@/features/installments/balance-chart";
import { BreakEvenChart } from "@/features/installments/break-even-chart";
import { balanceHint, curveHint } from "@/features/installments/hints";
import { SimulationForm } from "@/features/installments/simulation-form";
import { readSimulation, writeSimulation } from "@/features/installments/simulation-params";
import { SimulationSummary } from "@/features/installments/simulation-summary";
import { useInstallments } from "@/features/installments/use-installments";
import { MetricHint } from "@/shared/components/metric-hint";
import { ProjectionForm } from "@/shared/components/projection-form";
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

export function Simulator({ current }: { current: CurrentRates }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const simulation = readSimulation(searchParams);
  const draft = projectionDraft(searchParams, current);
  const projection = completeProjection(draft);
  // A decisão é tomada hoje: é daqui que o dinheiro fica aplicado
  const { data, error } = useInstallments(
    simulation && projection
      ? { ...simulation, start_date: isoDate(new Date()), projection }
      : null,
  );

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent>
          <SimulationForm
            simulation={simulation}
            onSubmit={(next) => setSearchParams((params) => writeSimulation(params, next))}
          />
        </CardContent>
      </Card>
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

      {error && <span className="text-destructive">{getApiErrorMessage(error)}</span>}
      {!projection && (
        <p className="text-muted-foreground">
          Falta a projeção de alguma série: informe as três taxas acima.
        </p>
      )}

      {simulation && data && (
        <>
          <Card>
            <CardContent>
              <SimulationSummary simulation={data} mode={simulation.mode} />
            </CardContent>
          </Card>
          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  <MetricHint hint={balanceHint}>Quanto sobra em cada caminho</MetricHint>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BalanceChart simulation={data} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                  <MetricHint hint={curveHint}>Desconto que empata por nº de parcelas</MetricHint>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <BreakEvenChart
                  simulation={data}
                  installments={simulation.installments}
                  discount={simulation.cash_discount}
                />
                <p className="text-muted-foreground text-sm">
                  Acima da curva, o à vista vence; abaixo, o parcelado.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
