import { Trash2 } from "lucide-react";

import { movementTypeLabels } from "@/features/fixed-income/labels";
import { type Movement, useDeleteMovement } from "@/features/fixed-income/use-fixed-income";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatDate } from "@/shared/lib/format";
import { formatBRL } from "@/types/decimal";

export function MovementsTable({ movements }: { movements: Movement[] }) {
  if (movements.length === 0) {
    return <p className="text-muted-foreground">Nenhuma movimentação registrada.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead className="text-right">Valor bruto</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((movement) => (
          <TableRow key={movement.id}>
            <TableCell className="tabular-nums">
              {formatDate(movement.movement_date)}
            </TableCell>
            <TableCell>{movementTypeLabels[movement.movement_type]}</TableCell>
            <TableCell className="text-right tabular-nums">
              {formatBRL(movement.amount)}
            </TableCell>
            <TableCell className="text-right">
              <DeleteMovementDialog movement={movement} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function DeleteMovementDialog({ movement }: { movement: Movement }) {
  const remove = useDeleteMovement();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Apagar movimentação">
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apagar movimentação?</AlertDialogTitle>
          <AlertDialogDescription>
            {movementTypeLabels[movement.movement_type]} de {formatBRL(movement.amount)}{" "}
            em {formatDate(movement.movement_date)}. O valor do título é recalculado sem
            ela.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => remove.mutate(movement)}>
            Apagar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
