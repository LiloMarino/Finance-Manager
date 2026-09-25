import { useSearchParams } from "react-router-dom";

import { CorrelationForm } from "@/features/correlation/correlation-form";
import { CorrelationMatrix } from "@/features/correlation/correlation-matrix";
import {
  readCorrelation,
  writePair,
  writeSymbols,
} from "@/features/correlation/correlation-params";
import { CorrelationSummary } from "@/features/correlation/correlation-summary";
import { matrixHint, normalizedHint, rollingHint } from "@/features/correlation/hints";
import { NormalizedChart } from "@/features/correlation/normalized-chart";
import { RollingChart } from "@/features/correlation/rolling-chart";
import {
  useCorrelationMatrix,
  useCorrelationPair,
} from "@/features/correlation/use-correlation";
import { MetricHint } from "@/shared/components/metric-hint";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";

export function CorrelationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = readCorrelation(searchParams);
  const matrix = useCorrelationMatrix(state.symbols, state.window);
  const pair = useCorrelationPair(state.pair, state.window);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Correlação</h1>
        <p className="text-muted-foreground">
          O quanto os ativos andam juntos, na carteira ou fora dela, e contra o IBOV ou
          o CDI.
        </p>
      </div>
      <Card>
        <CardContent>
          <CorrelationForm
            state={state}
            onSubmit={(symbols, window) =>
              setSearchParams((params) => writeSymbols(params, symbols, window))
            }
          />
        </CardContent>
      </Card>

      {state.symbols.length < 2 ? (
        <p className="text-muted-foreground">
          Escolha pelo menos dois itens. O histórico de um ticker fora da carteira é
          buscado na primeira vez e fica em cache.
        </p>
      ) : (
        <>
          {/* Matriz de correlação */}
          <Card>
            <CardHeader>
              <CardTitle>
                <MetricHint hint={matrixHint}>Matriz de correlação</MetricHint>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {matrix.error ? (
                <span className="text-destructive">
                  {getApiErrorMessage(matrix.error)}
                </span>
              ) : matrix.data ? (
                <CorrelationMatrix
                  matrix={matrix.data}
                  selected={state.pair}
                  onSelect={(next) => setSearchParams((params) => writePair(params, next))}
                />
              ) : (
                <Skeleton className="h-48 w-full" />
              )}
            </CardContent>
          </Card>

          {/* O par escolhido na matriz */}
          {state.pair &&
            (pair.error ? (
              <span className="text-destructive">{getApiErrorMessage(pair.error)}</span>
            ) : !pair.data ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <>
                <Card>
                  <CardContent>
                    <CorrelationSummary correlation={pair.data} />
                  </CardContent>
                </Card>
                <div className="grid gap-6 xl:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <MetricHint hint={normalizedHint}>Os dois partindo de 100</MetricHint>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <NormalizedChart correlation={pair.data} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <MetricHint hint={rollingHint(pair.data.rolling_window)}>
                          Correlação móvel ({pair.data.rolling_window} pregões)
                        </MetricHint>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {pair.data.rolling.length > 0 ? (
                        <RollingChart correlation={pair.data} />
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          O período tem menos de {pair.data.rolling_window} pregões em
                          comum: escolha uma janela maior.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            ))}
        </>
      )}
    </div>
  );
}
