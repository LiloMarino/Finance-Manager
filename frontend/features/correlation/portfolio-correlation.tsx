import { useState } from "react";

import { MatrixCard } from "@/features/correlation/correlation-matrix";
import {
  type Benchmark,
  type CorrelationWindow,
  benchmarks,
  isBenchmark,
  isCorrelationWindow,
  windowLabels,
} from "@/features/correlation/correlation-params";
import { portfolioMatrixHint } from "@/features/correlation/hints";
import { PairDetail } from "@/features/correlation/pair-detail";
import { PairsCard } from "@/features/correlation/pairs-card";
import { usePortfolioCorrelation } from "@/features/correlation/use-correlation";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { getApiErrorMessage } from "@/shared/lib/api";

interface PortfolioCorrelationProps {
  subportfolioId?: number;
}

/** A correlação dos ativos da carteira (ou da subcarteira): janela e referências, a
matriz, os pares que mais andam juntos e o par escolhido. */
export function PortfolioCorrelation({ subportfolioId }: PortfolioCorrelationProps) {
  const [window, setWindow] = useState<CorrelationWindow>("1y");
  const [references, setReferences] = useState<Benchmark[]>(["IBOV"]);
  const [picked, setPicked] = useState<[string, string] | null>(null);
  const { data, error } = usePortfolioCorrelation({
    window,
    subportfolio_id: subportfolioId,
    benchmarks: references,
  });

  // O par escolhido vale enquanto os dois ainda estão na matriz; sem ele, o mais correlacionado
  const symbols = data?.matrix.symbols ?? [];
  const top = data?.pairs[0];
  const pair: [string, string] | null =
    picked && symbols.includes(picked[0]) && symbols.includes(picked[1])
      ? picked
      : top
        ? [top.first, top.second]
        : null;
  const assets = symbols.filter((symbol) => !isBenchmark(symbol));

  return (
    <>
      {/* Janela e referências */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-caption text-muted-foreground">Janela</span>
        <ToggleGroup
          variant="segmented"
          size="sm"
          aria-label="Janela"
          value={[window]}
          onValueChange={([next]) => {
            if (next && isCorrelationWindow(next)) setWindow(next);
          }}
        >
          {Object.entries(windowLabels).map(([value, label]) => (
            <ToggleGroupItem key={value} value={value}>
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <span className="text-caption text-muted-foreground ml-4">Comparar com</span>
        <ToggleGroup
          multiple
          variant="segmented"
          size="sm"
          aria-label="Referências"
          value={references}
          onValueChange={(values) => setReferences(values.filter(isBenchmark))}
        >
          {benchmarks.map((benchmark) => (
            <ToggleGroupItem key={benchmark} value={benchmark}>
              {benchmark}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <span className="text-caption text-muted-foreground ml-auto">
          Renda fixa fica de fora: não tem cotação diária.
        </span>
      </div>

      {error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : !data ? (
        <Skeleton className="h-96 w-full" />
      ) : assets.length < 2 ? (
        <p className="text-muted-foreground">
          A correlação precisa de pelo menos dois ativos em carteira.
        </p>
      ) : (
        <>
          {/* Matriz e pares */}
          <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)]">
            <MatrixCard
              hint={portfolioMatrixHint}
              matrix={data.matrix}
              selected={pair}
              onSelect={setPicked}
              note={
                references.length > 0
                  ? `A linha ${references.join(" e ")} mostra o quanto cada ativo segue a referência.`
                  : undefined
              }
            />
            <PairsCard pairs={data.pairs} selected={pair} onSelect={setPicked} />
          </div>
          {data.missing.length > 0 && (
            <p className="text-caption text-muted-foreground">
              Sem cotação na janela, e por isso sem correlação: {data.missing.join(", ")}.
            </p>
          )}

          {/* Par escolhido */}
          {pair && <PairDetail pair={pair} window={window} />}
        </>
      )}
    </>
  );
}
