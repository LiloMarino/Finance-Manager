import { describeCorrelation, strongestPairsHint } from "@/features/correlation/hints";
import { formatCorrelation } from "@/features/correlation/format";
import type { CorrelatedPair } from "@/features/correlation/use-correlation";
import { MetricHint } from "@/shared/components/metric-hint";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

// Os pares que cabem ao lado da matriz
const VISIBLE_PAIRS = 6;

interface PairsCardProps {
  pairs: CorrelatedPair[];
  selected: [string, string] | null;
  onSelect: (pair: [string, string]) => void;
}

/** Os pares que mais andam juntos, do maior para o menor. */
export function PairsCard({ pairs, selected, onSelect }: PairsCardProps) {
  const isSelected = (pair: CorrelatedPair) =>
    selected !== null &&
    ((pair.first === selected[0] && pair.second === selected[1]) ||
      (pair.first === selected[1] && pair.second === selected[0]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <MetricHint hint={strongestPairsHint}>Pares que mais andam juntos</MetricHint>
        </CardTitle>
      </CardHeader>
      <CardContent data-flush>
        {pairs.length === 0 ? (
          <p className="text-caption text-muted-foreground px-5">
            Nenhum par com retornos em comum suficientes na janela.
          </p>
        ) : (
          pairs.slice(0, VISIBLE_PAIRS).map((pair) => (
            <button
              key={`${pair.first}-${pair.second}`}
              type="button"
              className="border-border-subtle hover:bg-muted data-[selected=true]:bg-muted flex w-full items-center justify-between gap-3 border-b px-5 py-2.5 text-left last:border-b-0"
              data-selected={isSelected(pair)}
              onClick={() => onSelect([pair.first, pair.second])}
            >
              <span className="flex flex-col gap-0.5">
                <span className="text-ticker font-mono">
                  {pair.first} × {pair.second}
                </span>
                <span className="text-caption text-muted-foreground">
                  {describeCorrelation(pair.value)}
                </span>
              </span>
              <span className="font-semibold tabular-nums">{formatCorrelation(pair.value)}</span>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}
