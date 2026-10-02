import { useSearchParams } from "react-router-dom";

import { MatrixCard } from "@/features/correlation/correlation-matrix";
import { CorrelationForm } from "@/features/correlation/correlation-form";
import {
  pairsFromMatrix,
  readCorrelation,
  writePair,
  writeSymbols,
} from "@/features/correlation/correlation-params";
import { matrixHint } from "@/features/correlation/hints";
import { PairDetail } from "@/features/correlation/pair-detail";
import { PairsCard } from "@/features/correlation/pairs-card";
import { useCorrelationMatrix } from "@/features/correlation/use-correlation";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";

export function AssetCorrelationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = readCorrelation(searchParams);
  const matrix = useCorrelationMatrix(state.symbols, state.window);
  const select = (next: [string, string]) => setSearchParams((params) => writePair(params, next));

  return (
    <>
      <PageHeader
        title="Correlação entre ativos"
        description="O quanto quaisquer ativos andam juntos, na carteira ou fora dela, e contra o IBOV ou o CDI."
      />
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
          Escolha pelo menos dois itens. O histórico de um ticker fora da carteira é buscado na
          primeira vez e fica em cache.
        </p>
      ) : matrix.error ? (
        <span className="text-destructive">{getApiErrorMessage(matrix.error)}</span>
      ) : !matrix.data ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <>
          {/* Matriz e pares */}
          <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)]">
            <MatrixCard
              hint={matrixHint}
              matrix={matrix.data}
              selected={state.pair}
              onSelect={select}
            />
            <PairsCard
              pairs={pairsFromMatrix(matrix.data)}
              selected={state.pair}
              onSelect={select}
            />
          </div>

          {/* Par escolhido */}
          {state.pair && <PairDetail pair={state.pair} window={state.window} />}
        </>
      )}
    </>
  );
}
