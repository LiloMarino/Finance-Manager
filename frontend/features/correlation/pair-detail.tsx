import { pairColors, type CorrelationWindow } from "@/features/correlation/correlation-params";
import { formatCorrelation } from "@/features/correlation/format";
import {
  correlationHint,
  describeCorrelation,
  normalizedHint,
  returnsHint,
  rollingHint,
} from "@/features/correlation/hints";
import { NormalizedChart } from "@/features/correlation/normalized-chart";
import { RollingChart } from "@/features/correlation/rolling-chart";
import { useCorrelationPair } from "@/features/correlation/use-correlation";
import { ChartLegend } from "@/shared/components/chart-legend";
import { Metric } from "@/shared/components/metric";
import { MetricHint } from "@/shared/components/metric-hint";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";
import { formatDate } from "@/shared/lib/format";

interface PairDetailProps {
  pair: [string, string];
  window: CorrelationWindow;
}

/** O par aberto na matriz: a correlação, os dois partindo de 100 e a correlação móvel. */
export function PairDetail({ pair, window }: PairDetailProps) {
  const { data, error } = useCorrelationPair(pair, window);

  if (error) return <span className="text-destructive">{getApiErrorMessage(error)}</span>;
  if (!data) return <Skeleton className="h-96 w-full" />;

  const [firstColor, secondColor] = pairColors(data.first, data.second);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="font-mono">
            {data.first} × {data.second}
          </span>
        </CardTitle>
        <CardAction>
          <span className="text-caption text-muted-foreground">
            {describeCorrelation(data.correlation)}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Indicadores do par */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
          <Metric
            label="Correlação"
            hint={correlationHint}
            value={formatCorrelation(data.correlation)}
          />
          <Metric label="Pregões em comum" hint={returnsHint} value={data.returns} />
          <Metric
            label="Período"
            hint="Do primeiro ao último pregão em que os dois têm fechamento, dentro da janela escolhida."
            value={`${formatDate(data.start)} a ${formatDate(data.end)}`}
          />
        </div>

        {/* Os dois gráficos */}
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-label">
                <MetricHint hint={normalizedHint}>Os dois partindo de 100</MetricHint>
              </h3>
              <ChartLegend
                entries={[
                  { key: "first", label: data.first, color: firstColor, shape: "line" },
                  { key: "second", label: data.second, color: secondColor, shape: "line" },
                ]}
              />
            </div>
            <NormalizedChart correlation={data} />
          </div>
          <div className="xl:border-border flex flex-col gap-3 xl:border-l xl:pl-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-label">
                <MetricHint hint={rollingHint(data.rolling_window)}>
                  Correlação móvel de {data.rolling_window} pregões
                </MetricHint>
              </h3>
              <span className="text-caption text-muted-foreground">
                Cada ponto olha os {data.rolling_window} pregões anteriores
              </span>
            </div>
            {data.rolling.length > 0 ? (
              <RollingChart correlation={data} />
            ) : (
              <p className="text-caption text-muted-foreground">
                O período tem menos de {data.rolling_window} pregões em comum: escolha uma janela
                maior.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
