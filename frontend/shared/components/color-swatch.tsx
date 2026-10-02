import { cn } from "@/shared/lib/utils";

interface ColorSwatchProps {
  /** A cor da série, como valor CSS: um token (`var(--chart-1)`) ou uma mistura deles. */
  color: string;
  /** Bolinha nas categorias, quadrado nas barras, traço nas linhas (tracejado nas
  referências). */
  shape?: "dot" | "square" | "line" | "dashed";
}

/** O marcador de legenda na cor da série. */
export function ColorSwatch({ color, shape = "dot" }: ColorSwatchProps) {
  const isLine = shape === "line" || shape === "dashed";
  return (
    <span
      aria-hidden
      className={cn(
        "shrink-0",
        isLine ? "h-0 w-3.5 border-t-2 border-(--swatch)" : "size-2.5 bg-(--swatch)",
        shape === "dot" && "rounded-full",
        shape === "square" && "rounded-xs",
        shape === "dashed" && "border-dashed",
      )}
      style={{ "--swatch": color }}
    />
  );
}
