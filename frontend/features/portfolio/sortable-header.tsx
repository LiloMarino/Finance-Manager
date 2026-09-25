import type { SortDirection } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/shared/components/ui/button";

// A parte da coluna do TanStack Table que a ordenação usa
interface SortableColumn {
  getIsSorted: () => false | SortDirection;
  getToggleSortingHandler: () => undefined | ((event: unknown) => void);
}

/** Cabeçalho que alterna a ordenação da coluna: decrescente, crescente, nenhuma. */
export function SortableHeader({
  column,
  children,
}: {
  column: SortableColumn;
  children: ReactNode;
}) {
  const sorted = column.getIsSorted();
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;

  return (
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
}
