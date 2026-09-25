import { type ReactNode, useState } from "react";

import {
  type ImportPreview as Preview,
  type ImportStatus,
  type IncomePreviewRow,
  type PreviewRow,
  useConfirmImport,
} from "@/features/imports/use-import";
import { AssetClassSelect } from "@/shared/components/asset-class-select";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatDate } from "@/shared/lib/format";
import { type AssetClass, incomeTypeLabels, operationTypeLabels } from "@/shared/lib/labels";
import { formatBRL, formatQuantity } from "@/types/decimal";

const statusLabels: Record<ImportStatus, string> = {
  new: "Nova",
  existing: "Já existe",
  possible_duplicate: "Possível duplicata",
  repeated_in_batch: "Repetida no lote",
};

const statusVariants: Record<
  ImportStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  new: "default",
  existing: "secondary",
  possible_duplicate: "destructive",
  repeated_in_batch: "outline",
};

// Só entra no confirmar o que o banco ainda não tem; a possível duplicata fica a
// critério do usuário e começa desmarcada
const selectable: ImportStatus[] = ["new", "possible_duplicate"];

/** Os índices marcados de uma lista de linhas; começa com as novas. */
function useSelection(rows: { status: ImportStatus }[]) {
  const [selected, setSelected] = useState(
    () => new Set(rows.flatMap((row, index) => (row.status === "new" ? [index] : []))),
  );
  const toggle = (index: number, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(index);
      else next.delete(index);
      return next;
    });
  return { selected, toggle };
}

interface SelectableTableProps<Row extends { status: ImportStatus; file: string }> {
  rows: Row[];
  selected: Set<number>;
  onToggle: (index: number, checked: boolean) => void;
  headers: ReactNode;
  cells: (row: Row) => ReactNode;
}

function SelectableTable<Row extends { status: ImportStatus; file: string }>({
  rows,
  selected,
  onToggle,
  headers,
  cells,
}: SelectableTableProps<Row>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8" />
          <TableHead>Arquivo</TableHead>
          {headers}
          <TableHead>Situação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={index}>
            <TableCell>
              <Checkbox
                aria-label="Importar esta linha"
                checked={selected.has(index)}
                disabled={!selectable.includes(row.status)}
                onCheckedChange={(checked) => onToggle(index, checked === true)}
              />
            </TableCell>
            <TableCell className="max-w-48 truncate">{row.file}</TableCell>
            {cells(row)}
            <TableCell>
              <Badge variant={statusVariants[row.status]}>{statusLabels[row.status]}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function StatusCounts({ rows }: { rows: { status: ImportStatus }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(statusLabels).map(([status, label]) => (
        <Badge key={status} variant="outline">
          {label}: {rows.filter((row) => row.status === status).length}
        </Badge>
      ))}
    </div>
  );
}

interface ImportPreviewProps {
  preview: Preview;
  onCancel: () => void;
  /** Recebe a tela que mostra o que foi gravado. */
  onDone: (destination: string) => void;
}

export function ImportPreview({ preview, onCancel, onDone }: ImportPreviewProps) {
  const confirm = useConfirmImport();
  const operations = useSelection(preview.rows);
  const income = useSelection(preview.income_rows);
  const [classes, setClasses] = useState<Record<string, AssetClass>>(() =>
    Object.fromEntries(preview.new_assets.map((asset) => [asset.ticker, asset.asset_class])),
  );

  const chosen = preview.rows.filter((_, index) => operations.selected.has(index));
  const chosenIncome = preview.income_rows.filter((_, index) => income.selected.has(index));
  const chosenTickers = new Set([...chosen, ...chosenIncome].map((row) => row.ticker));
  const total = chosen.length + chosenIncome.length;

  const submit = () =>
    confirm.mutate(
      {
        operations: chosen.map(
          ({ ticker, operation_date, operation_type, quantity, unit_price }) => ({
            ticker,
            operation_date,
            operation_type,
            quantity,
            unit_price,
          }),
        ),
        income: chosenIncome.map(
          ({ ticker, payment_date, income_type, quantity, unit_price, amount }) => ({
            ticker,
            payment_date,
            income_type,
            quantity,
            unit_price,
            amount,
          }),
        ),
        new_assets: Object.entries(classes)
          .filter(([ticker]) => chosenTickers.has(ticker))
          .map(([ticker, asset_class]) => ({ ticker, asset_class })),
      },
      { onSuccess: () => onDone(chosen.length > 0 ? "/operations" : "/income") },
    );

  return (
    <div className="flex flex-col gap-6">
      {/* Arquivos com erro */}
      {preview.files.some((file) => file.error) && (
        <Card>
          <CardHeader>
            <CardTitle>Arquivos não lidos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            {preview.files
              .filter((file) => file.error)
              .map((file) => (
                <p key={file.name}>
                  <span className="font-medium">{file.name}</span>: {file.error}
                </p>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Ativos novos */}
      {preview.new_assets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ativos novos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {preview.new_assets.map(({ ticker }) => (
              <div key={ticker} className="flex items-center gap-3">
                <span className="w-20 font-medium">{ticker}</span>
                <AssetClassSelect
                  value={classes[ticker] ?? "stock"}
                  onChange={(assetClass) =>
                    setClasses((current) => ({ ...current, [ticker]: assetClass }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Operações */}
      {preview.rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Operações</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <StatusCounts rows={preview.rows} />
            <SelectableTable<PreviewRow>
              rows={preview.rows}
              selected={operations.selected}
              onToggle={operations.toggle}
              headers={
                <>
                  <TableHead>Data</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                </>
              }
              cells={(row) => (
                <>
                  <TableCell className="tabular-nums">
                    {formatDate(row.operation_date)}
                  </TableCell>
                  <TableCell className="font-medium">{row.ticker}</TableCell>
                  <TableCell>{operationTypeLabels[row.operation_type]}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatQuantity(row.quantity)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatBRL(row.unit_price)}
                  </TableCell>
                </>
              )}
            />
          </CardContent>
        </Card>
      )}

      {/* Proventos */}
      {preview.income_rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Proventos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <StatusCounts rows={preview.income_rows} />
            <SelectableTable<IncomePreviewRow>
              rows={preview.income_rows}
              selected={income.selected}
              onToggle={income.toggle}
              headers={
                <>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Bruto por unidade</TableHead>
                  <TableHead className="text-right">Líquido</TableHead>
                </>
              }
              cells={(row) => (
                <>
                  <TableCell className="tabular-nums">{formatDate(row.payment_date)}</TableCell>
                  <TableCell className="font-medium">{row.ticker}</TableCell>
                  <TableCell>{incomeTypeLabels[row.income_type]}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatQuantity(row.quantity)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatBRL(row.unit_price)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatBRL(row.amount)}
                  </TableCell>
                </>
              )}
            />
          </CardContent>
        </Card>
      )}

      {/* Ignoradas */}
      {preview.ignored.length > 0 && (
        <details>
          <summary className="cursor-pointer text-muted-foreground">
            {preview.ignored.length} movimentações ignoradas
          </summary>
          <Table>
            <TableBody>
              {preview.ignored.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="tabular-nums">{item.movement_date}</TableCell>
                  <TableCell className="font-medium">{item.ticker}</TableCell>
                  <TableCell>{item.movement}</TableCell>
                  <TableCell className="text-muted-foreground">{item.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </details>
      )}

      {/* Ações */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={confirm.isPending}>
          Cancelar
        </Button>
        <Button onClick={submit} disabled={total === 0 || confirm.isPending}>
          Confirmar {total} linhas
        </Button>
      </div>
    </div>
  );
}
