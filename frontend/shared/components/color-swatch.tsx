import { cn } from "@/shared/lib/utils";

interface ColorSwatchProps {
  /** A cor da série, como valor CSS: um token (`var(--chart-1)`) ou uma mistura deles. */
  color: string;
  /** Bolinha nas legendas de categoria; quadrado nos gráficos. */
  shape?: "dot" | "square";
}

/** O marcador de legenda na cor da série. */
export function ColorSwatch({ color, shape = "dot" }: ColorSwatchProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-2.5 shrink-0 bg-(--swatch)",
        shape === "dot" ? "rounded-full" : "rounded-xs",
      )}
      style={{ "--swatch": color }}
    />
  );
}
