import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";

import { DeleteOperationDialog } from "@/features/operations/delete-operation-dialog";
import { OperationFormDialog } from "@/features/operations/operation-form-dialog";
import type { Operation } from "@/features/operations/use-operations";
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
import { operationTypeLabels } from "@/shared/lib/labels";
import { formatBRL, formatQuantity } from "@/types/decimal";

export function OperationsTable({ operations }: { operations: Operation[] }) {
  if (operations.length === 0) {
    return <p className="text-muted-foreground">Nenhuma operação encontrada.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Ativo</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead className="text-right">Quantidade</TableHead>
          <TableHead className="text-right">Preço unitário</TableHead>
          <TableHead className="w-24" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {operations.map((operation) => (
          <TableRow key={operation.id}>
            <TableCell className="tabular-nums">
              {formatDate(operation.operation_date)}
            </TableCell>
            <TableCell className="font-medium">
              <Link to={`/assets/${operation.asset_id}`} className="hover:underline">
                {operation.ticker}
              </Link>
            </TableCell>
            <TableCell>{operationTypeLabels[operation.operation_type]}</TableCell>
            <TableCell className="text-right tabular-nums">
              {formatQuantity(operation.quantity)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatBRL(operation.unit_price)}
            </TableCell>
            <TableCell className="text-right">
              <OperationFormDialog
                operation={operation}
                trigger={
                  <Button variant="ghost" size="icon-sm" aria-label="Editar operação">
                    <Pencil />
                  </Button>
                }
              />
              <DeleteOperationDialog operation={operation} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
