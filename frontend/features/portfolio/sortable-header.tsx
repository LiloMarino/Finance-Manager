import type { SortDirection } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";

import { MetricHint } from "@/shared/components/metric-hint";
import { Button } from "@/shared/components/ui/button";

// A parte da coluna do TanStack Table que a ordenação usa
interface SortableColumn {
  getIsSorted: () => false | SortDirection;
  getToggleSortingHandler: () => undefined | ((event: unknown) => void);
}

/** Cabeçalho que alterna a ordenação da coluna: decrescente, crescente, nenhuma. A
dica fica ao lado do botão, e não dentro dele: o `Button` tira o ponteiro dos ícones
que contém, e clicar nela não ordena. */
export function SortableHeader({
  column,
  hint,
  children,
}: {
  column: SortableColumn;
  hint?: string;
  children: ReactNode;
}) {
  const sorted = column.getIsSorted();
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;
  const button = (
    <Button
      variant="ghost"
      size="sm"
      className="-mx-2 h-8"
      onClick={column.getToggleSortingHandler()}
    >
      {children}
      <Icon className={sorted ? "" : "text-muted-foreground"} />
    </Button>
  );

  return hint ? <MetricHint hint={hint}>{button}</MetricHint> : button;
}
