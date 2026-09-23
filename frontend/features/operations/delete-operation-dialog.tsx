import { Trash2 } from "lucide-react";

import { type Operation, useDeleteOperation } from "@/features/operations/use-operations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { formatDate } from "@/shared/lib/format";
import { operationTypeLabels } from "@/shared/lib/labels";

export function DeleteOperationDialog({ operation }: { operation: Operation }) {
  const remove = useDeleteOperation();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Apagar operação">
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apagar operação?</AlertDialogTitle>
          <AlertDialogDescription>
            {operationTypeLabels[operation.operation_type]} de {operation.ticker} em{" "}
            {formatDate(operation.operation_date)}. A posição e o preço médio são
            recalculados sem ela.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => remove.mutate(operation)}>
            Apagar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
