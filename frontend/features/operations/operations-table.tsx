import { Pencil } from "lucide-react";

import { DeleteOperationDialog } from "@/features/operations/delete-operation-dialog";
import { OperationFormDialog } from "@/features/operations/operation-form-dialog";
import type { Operation } from "@/features/operations/use-operations";
import { Money, Quantity } from "@/shared/components/money";
import { TickerLabel } from "@/shared/components/ticker-label";
import { Badge } from "@/shared/components/ui/badge";
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
import { type OperationType, operationTypeLabels } from "@/shared/lib/labels";

// Compra e venda com cor própria; os eventos corporativos ficam neutros
const operationTypeVariants = {
  buy: "buy",
  sell: "sell",
  bonus: "outline",
  split: "outline",
  reverse_split: "outline",
} as const satisfies Record<OperationType, "buy" | "sell" | "outline">;

interface OperationsTableProps {
  operations: Operation[];
  /** Na tela de um ativo só, a coluna dele sai. */
  showAsset?: boolean;
}

export function OperationsTable({ operations, showAsset = true }: OperationsTableProps) {
  if (operations.length === 0) {
    return <p className="text-muted-foreground">Nenhuma operação encontrada.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          {showAsset && <TableHead>Ativo</TableHead>}
          <TableHead>Tipo</TableHead>
          <TableHead className="text-right">Quantidade</TableHead>
          <TableHead className="text-right">Preço unitário</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="w-20" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {operations.map((operation) => (
          <TableRow key={operation.id}>
            <TableCell className="tabular-nums">{formatDate(operation.operation_date)}</TableCell>
            {showAsset && (
              <TableCell>
                <TickerLabel
                  ticker={operation.ticker}
                  category={operation.asset_class}
                  to={`/assets/${operation.asset_id}`}
                />
              </TableCell>
            )}
            <TableCell>
              <Badge variant={operationTypeVariants[operation.operation_type]}>
                {operationTypeLabels[operation.operation_type]}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Quantity value={operation.quantity} />
            </TableCell>
            <TableCell className="text-right">
              {operation.operation_type === "buy" || operation.operation_type === "sell" ? (
                <Money value={operation.unit_price} />
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              {operation.operation_type === "buy" || operation.operation_type === "sell" ? (
                <Money value={operation.total} />
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="text-right whitespace-nowrap">
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
