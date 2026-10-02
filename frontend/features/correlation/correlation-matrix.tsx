import { describeCorrelation } from "@/features/correlation/hints";
import { formatCorrelation } from "@/features/correlation/format";
import { isBenchmark } from "@/features/correlation/correlation-params";
import type { CorrelationMatrix as Matrix } from "@/features/correlation/use-correlation";
import { ColorSwatch } from "@/shared/components/color-swatch";
import { MetricHint } from "@/shared/components/metric-hint";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { benchmarkConfig } from "@/shared/lib/benchmark";
import { cn } from "@/shared/lib/utils";

// A cor mais forte não chega a 100%: o número da célula continua legível
const MAX_INTENSITY = 80;

/** O fundo da célula: verde para +1, azul para −1, e o neutro no 0. */
function cellColor(value: number): string {
  const tone = value >= 0 ? "var(--chart-1)" : "var(--chart-2)";
  const intensity = Math.round(Math.min(Math.abs(value), 1) * MAX_INTENSITY);
  return `color-mix(in oklab, ${tone} ${intensity}%, var(--muted))`;
}

/** A altura das células cai com o número de linhas, para a matriz caber na tela. */
function cellHeight(size: number): string {
  if (size <= 4) return "h-18";
  if (size <= 6) return "h-13";
  return "h-10";
}

interface CorrelationMatrixProps {
  matrix: Matrix;
  selected: [string, string] | null;
  onSelect: (pair: [string, string]) => void;
}

/** Só o triângulo de baixo: cada par aparece uma vez. A última linha pode ser uma
referência (IBOV, CDI), que mostra o quanto cada ativo a segue. */
function MatrixGrid({ matrix, selected, onSelect }: CorrelationMatrixProps) {
  const { symbols, cells } = matrix;
  const height = cellHeight(symbols.length);
  const isSelected = (row: number, column: number) =>
    selected !== null &&
    ((symbols[row] === selected[0] && symbols[column] === selected[1]) ||
      (symbols[row] === selected[1] && symbols[column] === selected[0]));
  const columns = symbols.slice(0, -1);

  return (
    <div className="overflow-x-auto">
      <div
        className="grid grid-cols-(--matrix-columns) gap-0.5"
        style={{
          "--matrix-columns": `5.25rem repeat(${columns.length}, minmax(${symbols.length <= 4 ? "4.5rem" : "4rem"}, 1fr))`,
        }}
      >
        {symbols.slice(1).map((rowSymbol, offset) => {
          const row = offset + 1;
          return (
            <div key={rowSymbol} className="contents">
              <span className="text-ticker text-ink-2 flex items-center gap-1.5 font-mono">
                {isBenchmark(rowSymbol) && (
                  <ColorSwatch
                    color={benchmarkConfig[rowSymbol === "IBOV" ? "ibov" : "cdi"].color}
                  />
                )}
                {rowSymbol}
              </span>
              {columns.map((columnSymbol, column) => {
                if (column >= row) return <span key={columnSymbol} className={height} />;
                const cell = cells[row]?.[column];
                const value = cell?.value ?? null;
                return (
                  <button
                    key={columnSymbol}
                    type="button"
                    disabled={value === null}
                    aria-label={`${rowSymbol} × ${columnSymbol}`}
                    title={
                      value === null
                        ? `Só ${cell?.returns ?? 0} retornos em comum, ou um dos dois não variou.`
                        : `${rowSymbol} × ${columnSymbol}: ${formatCorrelation(value)}. ${describeCorrelation(value)} ${cell?.returns} pregões.`
                    }
                    className={cn(
                      "text-caption text-foreground rounded-sm font-medium tabular-nums",
                      height,
                      value === null
                        ? "bg-muted text-muted-foreground cursor-default"
                        : "cursor-pointer bg-(--cell) hover:outline-2 hover:outline-foreground/40",
                      isSelected(row, column) && "outline-foreground outline-2 outline-offset-1",
                    )}
                    style={value === null ? undefined : { "--cell": cellColor(value) }}
                    onClick={() => onSelect([rowSymbol, columnSymbol])}
                  >
                    {value === null ? "—" : formatCorrelation(value)}
                  </button>
                );
              })}
            </div>
          );
        })}

        {/* Cabeçalho das colunas */}
        <span />
        {columns.map((symbol) => (
          <span key={symbol} className="text-ticker text-ink-2 truncate pt-1 text-center font-mono">
            {symbol}
          </span>
        ))}
      </div>
    </div>
  );
}

interface MatrixCardProps extends CorrelationMatrixProps {
  hint: string;
  /** O que a última linha mostra, quando há uma referência */
  note?: string;
}

/** O card da matriz, com a escala de cor embaixo. */
export function MatrixCard({ hint, note, ...props }: MatrixCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <MetricHint hint={hint}>Matriz</MetricHint>
        </CardTitle>
        <CardAction>
          <span className="text-caption text-muted-foreground">
            Clique numa célula para ver o par
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <MatrixGrid {...props} />

        {/* Escala de cor */}
        <div className="text-caption text-muted-foreground flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <span>−1 opostos</span>
            <span
              className="h-2 max-w-60 min-w-30 flex-1 rounded-full bg-linear-to-r from-(--low) via-(--middle) to-(--high)"
              style={{ "--low": cellColor(-1), "--middle": cellColor(0), "--high": cellColor(1) }}
            />
            <span>+1 juntos</span>
          </div>
          <span className="max-w-prose">Perto de 0: um diversifica o outro. {note}</span>
        </div>
      </CardContent>
    </Card>
  );
}
