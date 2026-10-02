import { ChevronDown } from "lucide-react";
import { useState } from "react";

import {
  type ImportPreview as Preview,
  type ImportStatus,
  useConfirmImport,
} from "@/features/imports/use-import";
import { AssetClassSelect } from "@/shared/components/asset-class-select";
import { Quantity } from "@/shared/components/money";
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
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { formatDate } from "@/shared/lib/format";
import { type AssetClass, incomeTypeLabels, operationTypeLabels } from "@/shared/lib/labels";
import { Money } from "@/shared/components/money";

const statusLabels: Record<ImportStatus, string> = {
  new: "Nova",
  existing: "Já existe",
  possible_duplicate: "Possível duplicata",
  repeated_in_batch: "Repetida no lote",
};

const statusVariants: Record<ImportStatus, "buy" | "outline" | "warning"> = {
  new: "buy",
  existing: "outline",
  possible_duplicate: "warning",
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
  const [showIgnored, setShowIgnored] = useState(true);
  const [showRepeatedIncome, setShowRepeatedIncome] = useState(false);

  const chosen = preview.rows.filter((_, index) => operations.selected.has(index));
  const chosenIncome = preview.income_rows.filter((_, index) => income.selected.has(index));
  const chosenTickers = new Set([...chosen, ...chosenIncome].map((row) => row.ticker));
  const total = chosen.length + chosenIncome.length;

  const errorsCount = preview.files.filter((file) => file.error).length;
  const newOpsCount = preview.rows.filter((r) => r.status === "new").length;
  const dupOpsCount = preview.rows.filter((r) => r.status === "possible_duplicate").length;
  const existingOpsCount = preview.rows.filter((r) => r.status === "existing").length;
  const batchOpsCount = preview.rows.filter((r) => r.status === "repeated_in_batch").length;
  const newIncomeCount = preview.income_rows.filter((r) => r.status === "new").length;
  const repeatedIncomeCount = preview.income_rows.filter((r) =>
    ["existing", "repeated_in_batch"].includes(r.status),
  ).length;

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
    <>
      {/* Barra de confirmação sticky */}
      <Card variant="sticky" className="sticky top-2 z-10">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex-1 min-w-64">
            <div className="font-semibold">{total} linhas marcadas para gravar</div>
            <p className="text-sm text-ink-2">
              {chosen.length} {chosen.length === 1 ? "operação" : "operações"} e{" "}
              {chosenIncome.length} {chosenIncome.length === 1 ? "provento" : "proventos"}, de{" "}
              {preview.files.length} {preview.files.length === 1 ? "arquivo" : "arquivos"}.
              {preview.new_assets.length > 0 && (
                <>
                  {" "}
                  {preview.new_assets.length}{" "}
                  {preview.new_assets.length === 1 ? "ativo novo" : "ativos novos"} entram junto.
                </>
              )}
            </p>
          </div>
          <Button variant="ghost" onClick={onCancel} disabled={confirm.isPending}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={total === 0 || confirm.isPending}>
            Confirmar {total} {total === 1 ? "linha" : "linhas"}
          </Button>
        </div>
      </Card>

      <div className="flex flex-col gap-6">
        {/* Arquivos com erro */}
        {errorsCount > 0 && (
          <Alert variant="warning">
            <AlertTitle>
              {errorsCount}{" "}
              {errorsCount === 1 ? "arquivo não foi lido" : "arquivos não foram lidos"}
            </AlertTitle>
            <AlertDescription className="flex flex-col gap-1 text-sm mt-2">
              {preview.files
                .filter((file) => file.error)
                .map((file) => (
                  <div key={file.name}>
                    <span className="font-medium">{file.name}</span>: {file.error}
                  </div>
                ))}
            </AlertDescription>
          </Alert>
        )}

        {/* Ativos novos */}
        {preview.new_assets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ativos novos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {preview.new_assets.map(({ ticker }) => (
                  <div key={ticker} className="flex flex-col gap-1">
                    <label className="text-ticker text-label font-mono">{ticker}</label>
                    <AssetClassSelect
                      value={classes[ticker] ?? "stock"}
                      onChange={(assetClass) =>
                        setClasses((current) => ({ ...current, [ticker]: assetClass }))
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Operações */}
        {preview.rows.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Operações</CardTitle>
              <div className="flex flex-wrap gap-2 mt-3">
                {newOpsCount > 0 && (
                  <Badge variant="buy">
                    {newOpsCount} nova{newOpsCount === 1 ? "" : "s"}
                  </Badge>
                )}
                {dupOpsCount > 0 && (
                  <Badge variant="warning">
                    {dupOpsCount} possível{dupOpsCount === 1 ? " " : "s "}duplicata
                    {dupOpsCount === 1 ? "" : "s"}
                  </Badge>
                )}
                {existingOpsCount > 0 && (
                  <Badge variant="outline">
                    {existingOpsCount} já exist{existingOpsCount === 1 ? "e" : "em"}
                  </Badge>
                )}
                {batchOpsCount > 0 && (
                  <Badge variant="outline">
                    {batchOpsCount} repetida{batchOpsCount === 1 ? "" : "s"} no lote
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent data-flush="true">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-9" />
                      <TableHead>Situação</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ativo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Preço</TableHead>
                      <TableHead>Arquivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.rows.map((row, index) => (
                      <TableRow
                        key={index}
                        variant={!selectable.includes(row.status) ? "divider" : undefined}
                      >
                        <TableCell className="w-9">
                          <Checkbox
                            aria-label={`Gravar ${row.ticker} de ${formatDate(row.operation_date)}`}
                            checked={operations.selected.has(index)}
                            disabled={!selectable.includes(row.status)}
                            onCheckedChange={(checked) =>
                              operations.toggle(index, checked === true)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[row.status]}>
                            {statusLabels[row.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-table">
                          {formatDate(row.operation_date)}
                        </TableCell>
                        <TableCell className="text-ticker font-mono">{row.ticker}</TableCell>
                        <TableCell>{operationTypeLabels[row.operation_type]}</TableCell>
                        <TableCell className="text-right text-table">
                          <Quantity value={row.quantity} />
                        </TableCell>
                        <TableCell className="text-right text-table">
                          <Money value={row.unit_price} />
                        </TableCell>
                        <TableCell variant="muted" className="text-table max-w-48 truncate">
                          {row.file}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Proventos */}
        {preview.income_rows.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Proventos</CardTitle>
                <label className="flex items-center gap-2 text-sm font-normal text-ink-2">
                  <Checkbox
                    checked={showRepeatedIncome}
                    onCheckedChange={(checked) => setShowRepeatedIncome(checked === true)}
                  />
                  Mostrar repetidos
                </label>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {newIncomeCount > 0 && (
                  <Badge variant="buy">
                    {newIncomeCount} novo{newIncomeCount === 1 ? "" : "s"}
                  </Badge>
                )}
                {repeatedIncomeCount > 0 && (
                  <Badge variant="outline">
                    {repeatedIncomeCount} repetido{repeatedIncomeCount === 1 ? "" : "s"} no lote
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent data-flush="true">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-9" />
                      <TableHead>Situação</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Ativo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Bruto por unidade</TableHead>
                      <TableHead className="text-right">Líquido</TableHead>
                      <TableHead>Arquivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.income_rows
                      .filter(
                        (row) =>
                          row.status === "new" ||
                          (showRepeatedIncome &&
                            ["existing", "repeated_in_batch"].includes(row.status)),
                      )
                      .map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="w-9">
                            <Checkbox
                              aria-label={`Gravar provento de ${row.ticker}`}
                              checked={income.selected.has(preview.income_rows.indexOf(row))}
                              disabled={!selectable.includes(row.status)}
                              onCheckedChange={(checked) =>
                                income.toggle(preview.income_rows.indexOf(row), checked === true)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariants[row.status]}>
                              {statusLabels[row.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-table">
                            {formatDate(row.payment_date)}
                          </TableCell>
                          <TableCell className="text-ticker font-mono">{row.ticker}</TableCell>
                          <TableCell>{incomeTypeLabels[row.income_type]}</TableCell>
                          <TableCell className="text-right text-table">
                            <Quantity value={row.quantity} />
                          </TableCell>
                          <TableCell className="text-right text-table">
                            <Money value={row.unit_price} />
                          </TableCell>
                          <TableCell className="text-right text-table">
                            <Money value={row.amount} />
                          </TableCell>
                          <TableCell variant="muted" className="text-table max-w-48 truncate">
                            {row.file}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ignoradas */}
        {preview.ignored.length > 0 && (
          <Card>
            <details open={showIgnored} onToggle={(e) => setShowIgnored(e.currentTarget.open)}>
              <summary className="flex cursor-pointer items-center justify-between p-4 hover:bg-muted">
                <span className="font-semibold">
                  {preview.ignored.length} movimentações ignoradas
                </span>
                <span className="text-ink-2 text-sm">não mudam posição nem saldo</span>
                <ChevronDown
                  className={`size-5 text-muted-foreground transition-transform ${!showIgnored ? "-rotate-90" : ""}`}
                />
              </summary>
              <div className="border-t overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Ativo</TableHead>
                      <TableHead>Movimento</TableHead>
                      <TableHead>Por que ficou de fora</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.ignored.map((item, index) => (
                      <TableRow key={index} variant="divider">
                        <TableCell className="text-table">{item.movement_date}</TableCell>
                        <TableCell className="text-ticker font-mono">{item.ticker}</TableCell>
                        <TableCell>{item.movement}</TableCell>
                        <TableCell variant="muted">{item.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </details>
          </Card>
        )}
      </div>
    </>
  );
}
