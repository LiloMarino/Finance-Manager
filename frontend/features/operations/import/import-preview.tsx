import { useState } from "react";

import {
  type ImportPreview as Preview,
  type PreviewRow,
  useConfirmImport,
} from "@/features/operations/import/use-import";
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
import { type AssetClass, operationTypeLabels } from "@/shared/lib/labels";
import { formatDate } from "@/shared/lib/format";
import { formatBRL, formatQuantity } from "@/types/decimal";

type Status = PreviewRow["status"];

const statusLabels: Record<Status, string> = {
  new: "Nova",
  existing: "Já existe",
  possible_duplicate: "Possível duplicata",
  repeated_in_batch: "Repetida no lote",
};

const statusVariants: Record<Status, "default" | "secondary" | "destructive" | "outline"> = {
  new: "default",
  existing: "secondary",
  possible_duplicate: "destructive",
  repeated_in_batch: "outline",
};

// Só entra no confirmar o que o banco ainda não tem; a possível duplicata fica a
// critério do usuário e começa desmarcada
const selectable: Status[] = ["new", "possible_duplicate"];

interface ImportPreviewProps {
  preview: Preview;
  onDone: () => void;
}

export function ImportPreview({ preview, onDone }: ImportPreviewProps) {
  const confirm = useConfirmImport();
  const [selected, setSelected] = useState(
    () =>
      new Set(
        preview.rows.flatMap((row, index) => (row.status === "new" ? [index] : [])),
      ),
  );
  const [classes, setClasses] = useState<Record<string, AssetClass>>(() =>
    Object.fromEntries(preview.new_assets.map((asset) => [asset.ticker, asset.asset_class])),
  );

  const toggle = (index: number, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(index);
      else next.delete(index);
      return next;
    });

  const chosen = preview.rows.filter((_, index) => selected.has(index));
  const chosenTickers = new Set(chosen.map((row) => row.ticker));
  const counts = Object.fromEntries(
    Object.keys(statusLabels).map((status) => [
      status,
      preview.rows.filter((row) => row.status === status).length,
    ]),
  );

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
        new_assets: Object.entries(classes)
          .filter(([ticker]) => chosenTickers.has(ticker))
          .map(([ticker, asset_class]) => ({ ticker, asset_class })),
      },
      { onSuccess: onDone },
    );

  return (
    <div className="flex flex-col gap-6">
      {/* Resumo */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusLabels).map(([status, label]) => (
          <Badge key={status} variant="outline">
            {label}: {counts[status]}
          </Badge>
        ))}
        <Badge variant="outline">Ignoradas: {preview.ignored.length}</Badge>
      </div>

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

      {/* Linhas */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>Arquivo</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Quantidade</TableHead>
            <TableHead className="text-right">Preço</TableHead>
            <TableHead>Situação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {preview.rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                <Checkbox
                  aria-label="Importar esta linha"
                  checked={selected.has(index)}
                  disabled={!selectable.includes(row.status)}
                  onCheckedChange={(checked) => toggle(index, checked === true)}
                />
              </TableCell>
              <TableCell className="max-w-48 truncate">{row.file}</TableCell>
              <TableCell className="tabular-nums">{formatDate(row.operation_date)}</TableCell>
              <TableCell className="font-medium">{row.ticker}</TableCell>
              <TableCell>{operationTypeLabels[row.operation_type]}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatQuantity(row.quantity)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatBRL(row.unit_price)}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariants[row.status]}>{statusLabels[row.status]}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
        <Button variant="outline" onClick={onDone} disabled={confirm.isPending}>
          Cancelar
        </Button>
        <Button onClick={submit} disabled={chosen.length === 0 || confirm.isPending}>
          Confirmar {chosen.length} operações
        </Button>
      </div>
    </div>
  );
}
