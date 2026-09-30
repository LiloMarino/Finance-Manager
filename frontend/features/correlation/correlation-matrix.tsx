import { useState } from "react";

import { describeCorrelation } from "@/features/correlation/hints";
import type { CorrelationMatrix as Matrix } from "@/features/correlation/use-correlation";
import { ColorSwatch } from "@/shared/components/color-swatch";
import { cn } from "@/shared/lib/utils";

const correlationFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// A cor mais forte não chega a 100%: o número da célula continua legível
const MAX_INTENSITY = 80;
// Acima disso, a grade fica densa: célula e texto menores
const COMPACT_FROM = 13;

/** O fundo da célula: verde para +1, vermelho para −1, e o fundo do card no 0. */
function cellColor(value: number): string {
  const tone = value >= 0 ? "var(--gain)" : "var(--loss)";
  const intensity = Math.round(Math.min(Math.abs(value), 1) * MAX_INTENSITY);
  return `color-mix(in oklab, ${tone} ${intensity}%, var(--card))`;
}

interface Hovered {
  row: number;
  column: number;
  x: number;
  y: number;
}

interface CorrelationMatrixProps {
  matrix: Matrix;
  selected: [string, string] | null;
  onSelect: (pair: [string, string]) => void;
}

export function CorrelationMatrix({ matrix, selected, onSelect }: CorrelationMatrixProps) {
  const [hovered, setHovered] = useState<Hovered | null>(null);
  const { symbols, cells } = matrix;
  const isSelected = (row: number, column: number) =>
    selected !== null &&
    ((symbols[row] === selected[0] && symbols[column] === selected[1]) ||
      (symbols[row] === selected[1] && symbols[column] === selected[0]));
  const hoveredCell = hovered && cells[hovered.row]?.[hovered.column];
  const compact = symbols.length >= COMPACT_FROM;

  return (
    <div className="flex flex-col gap-4">
      {/* Grade da matriz */}
      <div className="overflow-x-auto">
        <div
          className={cn(
            "grid grid-cols-(--matrix-columns)",
            compact ? "text-2xs gap-0.5" : "gap-1 text-xs",
          )}
          style={{
            "--matrix-columns": `auto repeat(${symbols.length}, minmax(${compact ? "2.5rem" : "3.25rem"}, 6rem))`,
          }}
          onMouseLeave={() => setHovered(null)}
        >
          <span />
          {symbols.map((symbol, column) => (
            <span
              key={symbol}
              className={cn(
                "text-muted-foreground truncate pb-1 text-center",
                hovered?.column === column && "text-foreground font-medium",
              )}
            >
              {symbol}
            </span>
          ))}
          {symbols.map((rowSymbol, row) => (
            <div key={rowSymbol} className="contents">
              <span
                className={cn(
                  "text-muted-foreground flex items-center pr-2",
                  hovered?.row === row && "text-foreground font-medium",
                )}
              >
                {rowSymbol}
              </span>
              {cells[row]?.map((cell, column) => {
                const diagonal = row === column;
                const empty = diagonal || cell.value === null;
                const columnSymbol = symbols[column] ?? "";
                return (
                  <button
                    key={columnSymbol}
                    type="button"
                    aria-disabled={empty}
                    aria-label={`${rowSymbol} × ${columnSymbol}`}
                    className={cn(
                      "aspect-cell flex items-center justify-center rounded-md tabular-nums transition-shadow",
                      empty
                        ? "bg-muted text-muted-foreground cursor-default"
                        : "bg-(--cell) hover:ring-foreground/40 hover:ring-2",
                      isSelected(row, column) && "ring-foreground ring-2",
                    )}
                    style={
                      empty || cell.value === null ? undefined : { "--cell": cellColor(cell.value) }
                    }
                    onMouseEnter={(event) => {
                      const box = event.currentTarget.getBoundingClientRect();
                      setHovered({ row, column, x: box.left + box.width / 2, y: box.top });
                    }}
                    onClick={() => {
                      if (!empty) onSelect([rowSymbol, columnSymbol]);
                    }}
                  >
                    {cell.value === null ? "—" : correlationFormatter.format(cell.value)}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip no visual dos gráficos */}
      {hovered && hoveredCell && hovered.row !== hovered.column && (
        <div
          className="border-border/50 bg-background pointer-events-none fixed top-(--tooltip-y) left-(--tooltip-x) z-50 grid w-64 -translate-x-1/2 -translate-y-full gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl"
          style={{ "--tooltip-x": `${hovered.x}px`, "--tooltip-y": `${hovered.y - 6}px` }}
        >
          <span className="font-medium">
            {symbols[hovered.row]} × {symbols[hovered.column]}
          </span>
          {hoveredCell.value === null ? (
            <span className="text-muted-foreground">
              Só {hoveredCell.returns} retornos em comum, ou um dos dois não variou.
            </span>
          ) : (
            <>
              <span className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2">
                  <ColorSwatch shape="square" color={cellColor(hoveredCell.value)} />
                  Correlação
                </span>
                <span className="tabular-nums">
                  {correlationFormatter.format(hoveredCell.value)}
                </span>
              </span>
              <span className="text-muted-foreground">
                {describeCorrelation(hoveredCell.value)} {hoveredCell.returns} pregões.
              </span>
            </>
          )}
        </div>
      )}

      {/* Legenda da escala */}
      <div className="flex flex-col gap-1 text-xs">
        <div
          className="h-2 w-full rounded-full bg-linear-to-r from-(--low) via-(--middle) to-(--high)"
          style={{ "--low": cellColor(-1), "--middle": cellColor(0), "--high": cellColor(1) }}
        />
        <div className="text-muted-foreground flex justify-between">
          <span>−1 · sentidos opostos</span>
          <span>0 · sem relação</span>
          <span>+1 · andam juntos</span>
        </div>
      </div>
    </div>
  );
}
