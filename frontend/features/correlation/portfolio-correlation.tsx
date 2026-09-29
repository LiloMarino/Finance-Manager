import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { CorrelationMatrix } from "@/features/correlation/correlation-matrix";
import {
  type CorrelationWindow,
  isCorrelationWindow,
  windowLabels,
  writePair,
  writeSymbols,
} from "@/features/correlation/correlation-params";
import { describeCorrelation, strongestPairsHint } from "@/features/correlation/hints";
import { usePortfolioCorrelation } from "@/features/correlation/use-correlation";
import { MetricHint } from "@/shared/components/metric-hint";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { getApiErrorMessage } from "@/shared/lib/api";
import type { PortfolioCategory } from "@/shared/lib/portfolio-category";

const correlationFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** O endereço da ferramenta Correlação com o par aberto. */
function pairLink(pair: [string, string], window: CorrelationWindow): string {
  const params = writePair(writeSymbols(new URLSearchParams(), pair, window), pair);
  return `/correlation?${params.toString()}`;
}

interface PortfolioCorrelationProps {
  category?: PortfolioCategory;
  subportfolioId?: number;
}

export function PortfolioCorrelation({ category, subportfolioId }: PortfolioCorrelationProps) {
  const [window, setWindow] = useState<CorrelationWindow>("1y");
  const navigate = useNavigate();
  const { data, error } = usePortfolioCorrelation({
    window,
    category,
    subportfolio_id: subportfolioId,
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Janela */}
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={0}
        className="self-start"
        value={window}
        onValueChange={(next) => {
          if (isCorrelationWindow(next)) setWindow(next);
        }}
      >
        {Object.entries(windowLabels).map(([value, label]) => (
          <ToggleGroupItem key={value} value={value}>
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {category === "fixed_income" ? (
        <p className="text-muted-foreground">
          A correlação cobre só a renda variável: a renda fixa não tem cotação diária.
        </p>
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : !data ? (
        <Skeleton className="h-48 w-full" />
      ) : data.matrix.symbols.length < 2 ? (
        <p className="text-muted-foreground">
          A correlação precisa de pelo menos dois ativos em carteira neste filtro.
        </p>
      ) : (
        <>
          {/* Matriz da carteira */}
          <div className="flex flex-col gap-2">
            <CorrelationMatrix
              matrix={data.matrix}
              selected={null}
              onSelect={(pair) => void navigate(pairLink(pair, window))}
            />
            {data.missing.length > 0 && (
              <p className="text-muted-foreground text-sm">
                Sem cotação na janela, e por isso sem correlação: {data.missing.join(", ")}.
              </p>
            )}
          </div>

          {/* Pares mais correlacionados */}
          <div className="flex flex-col gap-2">
            <h3 className="font-medium">
              <MetricHint hint={strongestPairsHint}>Pares mais correlacionados</MetricHint>
            </h3>
            {data.pairs.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhum par com retornos em comum suficientes na janela.
              </p>
            ) : (
              <ul className="divide-border flex flex-col divide-y">
                {data.pairs.map((pair) => (
                  <li key={`${pair.first}-${pair.second}`}>
                    <Link
                      to={pairLink([pair.first, pair.second], window)}
                      className="hover:bg-muted/50 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-md px-2 py-2"
                    >
                      <span className="font-medium">
                        {pair.first} × {pair.second}
                      </span>
                      <span className="tabular-nums">
                        {correlationFormatter.format(pair.value)}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {describeCorrelation(pair.value)} {pair.returns} pregões.
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
