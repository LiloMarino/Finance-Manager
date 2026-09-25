import { useSearchParams } from "react-router-dom";

import { CorrelationForm } from "@/features/correlation/correlation-form";
import { readCorrelation, writeCorrelation } from "@/features/correlation/correlation-params";
import { CorrelationSummary } from "@/features/correlation/correlation-summary";
import { normalizedHint, rollingHint } from "@/features/correlation/hints";
import { NormalizedChart } from "@/features/correlation/normalized-chart";
import { RollingChart } from "@/features/correlation/rolling-chart";
import { useCorrelation } from "@/features/correlation/use-correlation";
import { MetricHint } from "@/shared/components/metric-hint";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";

export function CorrelationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = readCorrelation(searchParams);
  const { data, error, isFetching } = useCorrelation(query);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Correlação</h1>
        <p className="text-muted-foreground">
          O quanto dois ativos andam juntos, na carteira ou fora dela, ou um ativo e o
          IBOV ou o CDI.
        </p>
      </div>
      <Card>
        <CardContent>
          <CorrelationForm
            query={query}
            onSubmit={(next) =>
              setSearchParams((params) => writeCorrelation(params, next))
            }
          />
        </CardContent>
      </Card>

      {error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : !query ? (
        <p className="text-muted-foreground">
          Escolha o ticker e com o que compará-lo. O histórico de um ticker fora da
          carteira é buscado na primeira vez e fica em cache.
        </p>
      ) : !data || (isFetching && data.first !== query.first.toUpperCase()) ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <>
          <Card>
            <CardContent>
              <CorrelationSummary correlation={data} />
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
                <NormalizedChart correlation={data} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                  <MetricHint hint={rollingHint(data.rolling_window)}>
                    Correlação móvel ({data.rolling_window} pregões)
                  </MetricHint>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.rolling.length > 0 ? (
                  <RollingChart correlation={data} />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    O período tem menos de {data.rolling_window} pregões em comum: escolha
                    uma janela maior.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
