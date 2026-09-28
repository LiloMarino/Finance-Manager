import { cashEntryKindLabels } from "@/features/cash/labels";
import {
  type CashEntry,
  useDeleteCheck,
  useDeleteWithdrawal,
} from "@/features/cash/use-cash";
import { DeleteDialog } from "@/shared/components/delete-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatDate } from "@/shared/lib/format";
import { formatBRL, formatSignedBRL } from "@/types/decimal";

export function EntriesTable({ entries }: { entries: CashEntry[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Movimento</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="text-right">Saldo</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry, index) => (
          <TableRow key={`${entry.entry_date}-${entry.kind}-${index}`}>
            <TableCell className="tabular-nums">{formatDate(entry.entry_date)}</TableCell>
            <TableCell>
              {cashEntryKindLabels[entry.kind]}
              {entry.label && <span className="text-muted-foreground"> {entry.label}</span>}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatSignedBRL(entry.amount)}
            </TableCell>
            <TableCell className="text-right tabular-nums">{formatBRL(entry.balance)}</TableCell>
            <TableCell className="text-right">
              {entry.record_id !== null && (
                <DeleteEntry entry={entry} recordId={entry.record_id} />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Só a conferência e o saque são gravados; o resto do extrato é derivado deles
function DeleteEntry({ entry, recordId }: { entry: CashEntry; recordId: number }) {
  return entry.kind === "withdrawal" ? (
    <DeleteWithdrawal recordId={recordId} />
  ) : (
    <DeleteCheck recordId={recordId} opening={entry.kind === "opening"} />
  );
}

function DeleteWithdrawal({ recordId }: { recordId: number }) {
  const remove = useDeleteWithdrawal(recordId);
  return (
    <DeleteDialog
      name="o saque"
      description="O saldo é recalculado sem ele."
      remove={remove}
    />
  );
}

function DeleteCheck({ recordId, opening }: { recordId: number; opening: boolean }) {
  const remove = useDeleteCheck(recordId);
  return (
    <DeleteDialog
      name="a conferência"
      description={
        opening
          ? "A abertura passa para a conferência seguinte; sem nenhuma, o saldo deixa de existir."
          : "O saldo volta a ser o calculado nesse dia."
      }
      remove={remove}
    />
  );
}
