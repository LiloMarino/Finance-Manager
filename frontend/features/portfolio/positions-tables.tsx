import {
  type SortingState,
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { dayChangeHint, totalChangeHint } from "@/features/portfolio/hints";
import { SortableHeader } from "@/features/portfolio/sortable-header";
import type { Portfolio } from "@/features/portfolio/use-portfolio";
import { ColorSwatch } from "@/shared/components/color-swatch";
import { Money, Quantity } from "@/shared/components/money";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { describeRate, fixedIncomeTypeLabels } from "@/shared/lib/labels";
import { portfolioCategoryConfig } from "@/shared/lib/portfolio-category";
import { signClass } from "@/shared/lib/sign";
import { type DecimalString, formatPercent, formatSignedPercent } from "@/types/decimal";

type Position = Portfolio["positions"][number];
type Holding = Portfolio["fixed_income"][number];
type Subtotal = NonNullable<Portfolio["equity"]>;

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
});

// A ordenação compara números; o valor exato continua no Decimal da célula
function sortKey(value: DecimalString | null): number | undefined {
  return value === null ? undefined : Number(value);
}

const numeric = { sortFn: "basic", sortUndefined: "last", sortDescFirst: true } as const;

// A ordem dos grupos da renda variável, a mesma das cores
const equityCategories = ["stock", "fii", "etf", "bdr"] as const;

/** O valor com sinal e o percentual ao lado, na cor de alta ou baixa. */
function Change({ value, ratio }: { value: DecimalString | null; ratio: DecimalString | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  return (
    <span className={signClass(value)}>
      <Money value={value} signed />
      {ratio && <span className="text-caption ml-1.5">{formatSignedPercent(ratio)}</span>}
    </span>
  );
}

/** A linha de grupo ou de total: a soma, nas colunas de valor da tabela. */
function SubtotalCells({ subtotal, valueOnly }: { subtotal: Subtotal; valueOnly?: boolean }) {
  return (
    <>
      <TableCell className="text-right">
        <Money value={subtotal.value} />
      </TableCell>
      <TableCell className="text-right">
        {valueOnly ? (
          subtotal.day_return && (
            <span className={signClass(subtotal.day_return)}>
              {formatSignedPercent(subtotal.day_return)}
            </span>
          )
        ) : (
          <Change value={subtotal.day_change} ratio={subtotal.day_return} />
        )}
      </TableCell>
      <TableCell className="text-right">
        <Change value={subtotal.unrealized_result} ratio={subtotal.unrealized_return} />
      </TableCell>
      <TableCell className="text-right">{formatPercent(subtotal.share)}</TableCell>
    </>
  );
}

const positionHelper = createColumnHelper<typeof features, Position>();
const positionColumns = positionHelper.columns([
  positionHelper.accessor("ticker", {
    id: "ticker",
    sortFn: "alphanumeric",
    header: ({ column }) => <SortableHeader column={column}>Ativo</SortableHeader>,
    cell: ({ row }) => (
      <Link
        to={`/assets/${row.original.asset_id}`}
        className="text-ticker text-foreground font-mono hover:underline"
      >
        {row.original.ticker}
      </Link>
    ),
  }),
  positionHelper.accessor((row) => sortKey(row.quantity), {
    id: "quantity",
    ...numeric,
    header: ({ column }) => <SortableHeader column={column}>Quantidade</SortableHeader>,
    cell: ({ row }) => <Quantity value={row.original.quantity} />,
  }),
  positionHelper.accessor((row) => sortKey(row.average_price), {
    id: "average_price",
    ...numeric,
    header: ({ column }) => <SortableHeader column={column}>Preço médio</SortableHeader>,
    cell: ({ row }) => <Money value={row.original.average_price} />,
  }),
  positionHelper.accessor((row) => sortKey(row.price), {
    id: "price",
    ...numeric,
    header: ({ column }) => <SortableHeader column={column}>Preço atual</SortableHeader>,
    cell: ({ row }) =>
      row.original.price ? (
        <Money value={row.original.price} />
      ) : (
        <span className="text-muted-foreground">sem cotação</span>
      ),
  }),
  positionHelper.accessor((row) => sortKey(row.market_value), {
    id: "value",
    ...numeric,
    header: ({ column }) => <SortableHeader column={column}>Valor</SortableHeader>,
    cell: ({ row }) => <Money value={row.original.market_value} />,
  }),
  positionHelper.accessor((row) => sortKey(row.day_change), {
    id: "day_change",
    ...numeric,
    header: ({ column }) => (
      <SortableHeader column={column} hint={dayChangeHint}>
        Variação do dia
      </SortableHeader>
    ),
    cell: ({ row }) => <Change value={row.original.day_change} ratio={row.original.day_return} />,
  }),
  positionHelper.accessor((row) => sortKey(row.unrealized_result), {
    id: "total_change",
    ...numeric,
    header: ({ column }) => (
      <SortableHeader column={column} hint={totalChangeHint}>
        Variação total
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <Change value={row.original.unrealized_result} ratio={row.original.unrealized_return} />
    ),
  }),
  positionHelper.accessor((row) => sortKey(row.share), {
    id: "share",
    ...numeric,
    header: ({ column }) => <SortableHeader column={column}>% da carteira</SortableHeader>,
    cell: ({ row }) => formatPercent(row.original.share),
  }),
]);

/** A renda variável numa tabela só, agrupada por categoria: cada grupo traz a soma
dele, e a última linha, o total. A ordenação vale dentro de cada grupo. */
export function EquityCard({ portfolio }: { portfolio: Portfolio }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useTable({
    features,
    columns: positionColumns,
    data: portfolio.positions,
    state: { sorting },
    onSortingChange: (updater) =>
      setSorting((current) => (typeof updater === "function" ? updater(current) : updater)),
  });
  const rows = table.getRowModel().rows;
  if (!portfolio.equity) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Renda variável</CardTitle>
        <CardAction>
          <CardDescription>
            {portfolio.equity.asset_count} {portfolio.equity.asset_count === 1 ? "ativo" : "ativos"}{" "}
            · clique numa linha para abrir o ativo
          </CardDescription>
        </CardAction>
      </CardHeader>
      <CardContent data-flush>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header, index) => (
                  <TableHead key={header.id} className={index > 0 ? "text-right" : undefined}>
                    <table.FlexRender header={header} />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {equityCategories.map((category) => {
              const allocation = portfolio.categories.find((item) => item.category === category);
              if (!allocation) return null;
              return [
                // Cabeçalho do grupo, com a soma da categoria
                <TableRow key={category} variant="group">
                  <TableCell variant="group" colSpan={4}>
                    <span className="flex items-center gap-2">
                      <ColorSwatch color={portfolioCategoryConfig[category].color} />
                      {portfolioCategoryConfig[category].label} · {allocation.asset_count}{" "}
                      {allocation.asset_count === 1 ? "ativo" : "ativos"}
                    </span>
                  </TableCell>
                  <SubtotalCells subtotal={allocation} valueOnly />
                </TableRow>,
                ...rows
                  .filter((row) => row.original.asset_class === category)
                  .map((row) => (
                    <TableRow key={row.id} to={`/assets/${row.original.asset_id}`}>
                      {row.getAllCells().map((cell, index) => (
                        <TableCell key={cell.id} className={index > 0 ? "text-right" : undefined}>
                          <table.FlexRender cell={cell} />
                        </TableCell>
                      ))}
                    </TableRow>
                  )),
              ];
            })}
            <TableRow variant="total">
              <TableCell colSpan={4}>Total</TableCell>
              <SubtotalCells subtotal={portfolio.equity} />
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

const holdingHelper = createColumnHelper<typeof features, Holding>();
const holdingColumns = holdingHelper.columns([
  holdingHelper.accessor("label", {
    id: "label",
    sortFn: "alphanumeric",
    header: ({ column }) => <SortableHeader column={column}>Título</SortableHeader>,
    cell: ({ row }) => (
      <Link
        to={`/fixed-income/${row.original.investment_id}`}
        className="text-foreground font-medium hover:underline"
      >
        {row.original.label}
      </Link>
    ),
  }),
  holdingHelper.accessor((row) => fixedIncomeTypeLabels[row.product_type], {
    id: "product_type",
    sortFn: "alphanumeric",
    header: ({ column }) => <SortableHeader column={column}>Tipo</SortableHeader>,
    cell: ({ row }) => (
      <span className="text-ink-2">
        {fixedIncomeTypeLabels[row.original.product_type]} ·{" "}
        {describeRate(row.original.indexer, row.original.rate)}
      </span>
    ),
  }),
  holdingHelper.accessor((row) => sortKey(row.invested), {
    id: "invested",
    ...numeric,
    header: ({ column }) => <SortableHeader column={column}>Aplicado</SortableHeader>,
    cell: ({ row }) => <Money value={row.original.invested} />,
  }),
  holdingHelper.accessor((row) => sortKey(row.gross_value), {
    id: "value",
    ...numeric,
    header: ({ column }) => <SortableHeader column={column}>Valor bruto</SortableHeader>,
    cell: ({ row }) => <Money value={row.original.gross_value} />,
  }),
  holdingHelper.accessor((row) => sortKey(row.day_change), {
    id: "day_change",
    ...numeric,
    header: ({ column }) => (
      <SortableHeader column={column} hint={dayChangeHint}>
        Variação do dia
      </SortableHeader>
    ),
    cell: ({ row }) => <Change value={row.original.day_change} ratio={row.original.day_return} />,
  }),
  holdingHelper.accessor((row) => sortKey(row.unrealized_result), {
    id: "total_change",
    ...numeric,
    header: ({ column }) => (
      <SortableHeader column={column} hint={totalChangeHint}>
        Variação total
      </SortableHeader>
    ),
    cell: ({ row }) => (
      <Change value={row.original.unrealized_result} ratio={row.original.unrealized_return} />
    ),
  }),
  holdingHelper.accessor((row) => sortKey(row.share), {
    id: "share",
    ...numeric,
    header: ({ column }) => <SortableHeader column={column}>% da carteira</SortableHeader>,
    cell: ({ row }) => formatPercent(row.original.share),
  }),
]);

/** Os títulos de renda fixa, com o total embaixo e o atalho para a liquidez e os
vencimentos, que moram na tela de Renda fixa. */
export function FixedIncomeCard({ portfolio }: { portfolio: Portfolio }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useTable({
    features,
    columns: holdingColumns,
    data: portfolio.fixed_income,
    state: { sorting },
    onSortingChange: (updater) =>
      setSorting((current) => (typeof updater === "function" ? updater(current) : updater)),
  });
  const allocation = portfolio.categories.find((item) => item.category === "fixed_income");
  if (!allocation) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <ColorSwatch color={portfolioCategoryConfig.fixed_income.color} />
          Renda fixa
        </CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" render={<Link to="/fixed-income" />}>
            Liquidez e vencimentos
            <ChevronRight />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent data-flush>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header, index) => (
                  <TableHead key={header.id} className={index > 1 ? "text-right" : undefined}>
                    <table.FlexRender header={header} />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} to={`/fixed-income/${row.original.investment_id}`}>
                {row.getAllCells().map((cell, index) => (
                  <TableCell key={cell.id} className={index > 1 ? "text-right" : undefined}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
            <TableRow variant="total">
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right">
                <Money value={allocation.cost} />
              </TableCell>
              <SubtotalCells subtotal={allocation} />
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
