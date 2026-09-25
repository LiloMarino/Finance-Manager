import { Trash2 } from "lucide-react";

import { type IncomeEvent, useDeleteIncome } from "@/features/income/use-income";
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
import { incomeTypeLabels } from "@/shared/lib/labels";
import { formatBRL } from "@/types/decimal";

export function DeleteIncomeDialog({ event }: { event: IncomeEvent }) {
  const remove = useDeleteIncome();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Apagar provento">
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apagar provento?</AlertDialogTitle>
          <AlertDialogDescription>
            {incomeTypeLabels[event.income_type]} de {event.ticker} de{" "}
            {formatBRL(event.amount)}, pago em {formatDate(event.payment_date)}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => remove.mutate(event)}>
            Apagar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
