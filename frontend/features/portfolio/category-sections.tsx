import {
  type ReactTable,
  type RowData,
  type SortingState,
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { Link } from "react-router-dom";

import { type Category, categoryLabels } from "@/features/portfolio/labels";
import {
  MetricHint,
  dayChangeHint,
  totalChangeHint,
} from "@/features/portfolio/metric-hint";
import { SortableHeader } from "@/features/portfolio/sortable-header";
import type { Portfolio } from "@/features/portfolio/use-portfolio";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { describeRate, fixedIncomeTypeLabels } from "@/shared/lib/labels";
import {
  type DecimalString,
  formatBRL,
  formatPercent,
  formatQuantity,
  formatSignedBRL,
  formatSignedPercent,
  toChartNumber,
} from "@/types/decimal";

type Position = Portfolio["positions"][number];
type Holding = Portfolio["fixed_income"][number];
type CategoryAllocation = Portfolio["categories"][number];

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

/** Valor com sinal e, embaixo, o percentual; "—" quando não há valor. */
function Change({ value, ratio }: { value: DecimalString | null; ratio: DecimalString | null }) {
  if (value === null) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <>
      {formatSignedBRL(value)}
      {ratio && (
        <span className="text-muted-foreground block text-xs">
          {formatSignedPercent(ratio)}
        </span>
      )}
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
      <>
        <Link to={`/assets/${row.original.asset_id}`} className="font-medium hover:underline">
          {row.original.ticker}
        </Link>
        <span className="text-muted-foreground block text-xs">
          {row.original.sector
            ? `${row.original.sector} / ${row.original.segment}`
            : "Sem classificação"}
        </span>
      </>
    ),
  }),
  positionHelper.accessor((row) => sortKey(row.average_price), {
    id: "average_price",
    ...numeric,
    header: ({ column }) => <SortableHeader column={column}>Preço médio</SortableHeader>,
    cell: ({ row }) => formatBRL(row.original.average_price),
  }),
  positionHelper.accessor((row) => sortKey(row.price), {
    id: "price",
    ...numeric,
    header: ({ column }) => <SortableHeader column={column}>Preço atual</SortableHeader>,
    cell: ({ row }) =>
      row.original.price ? (
        <>
          {formatBRL(row.original.price)}
          {row.original.unrealized_return && (
            <span className="text-muted-foreground block text-xs">
              {formatSignedPercent(row.original.unrealized_return)} sobre o PM
            </span>
          )}
        </>
      ) : (
        <span className="text-muted-foreground">sem cotação</span>
      ),
  }),
  positionHelper.accessor((row) => sortKey(row.quantity), {
    id: "quantity",
    ...numeric,
    header: ({ column }) => <SortableHeader column={column}>Quantidade</SortableHeader>,
    cell: ({ row }) => formatQuantity(row.original.quantity),
  }),
  positionHelper.accessor((row) => sortKey(row.market_value), {
    id: "value",
    ...numeric,
    header: ({ column }) => <SortableHeader column={column}>Valor</SortableHeader>,
    cell: ({ row }) => formatBRL(row.original.market_value),
  }),
  positionHelper.accessor((row) => sortKey(row.day_change), {
    id: "day_change",
    ...numeric,
    header: ({ column }) => (
      <SortableHeader column={column}>
        <MetricHint hint={dayChangeHint}>Variação do dia</MetricHint>
      </SortableHeader>
    ),
    cell: ({ row }) => <Change value={row.original.day_change} ratio={row.original.day_return} />,
  }),
  positionHelper.accessor((row) => sortKey(row.unrealized_result), {
    id: "total_change",
    ...numeric,
    header: ({ column }) => (
      <SortableHeader column={column}>
        <MetricHint hint={totalChangeHint}>Variação total</MetricHint>
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

const holdingHelper = createColumnHelper<typeof features, Holding>();
const holdingColumns = holdingHelper.columns([
  holdingHelper.accessor("label", {
    id: "label",
    sortFn: "alphanumeric",
    header: ({ column }) => <SortableHeader column={column}>Título</SortableHeader>,
    cell: ({ row }) => (
      <>
        <Link
          to={`/fixed-income/${row.original.investment_id}`}
          className="font-medium hover:underline"
        >
          {row.original.label}
        </Link>
        <span className="text-muted-foreground block text-xs">
          {describeRate(row.original.indexer, row.original.rate)}
        </span>
      </>
    ),
  }),
  holdingHelper.accessor((row) => fixedIncomeTypeLabels[row.product_type], {
    id: "product_type",
    sortFn: "alphanumeric",
    header: ({ column }) => <SortableHeader column={column}>Tipo</SortableHeader>,
    cell: ({ row }) => (
      <Badge variant="secondary">{fixedIncomeTypeLabels[row.original.product_type]}</Badge>
    ),
  }),
  holdingHelper.accessor((row) => sortKey(row.invested), {
    id: "invested",
    ...numeric,
    header: ({ column }) => <SortableHeader column={column}>Aplicado</SortableHeader>,
    cell: ({ row }) => formatBRL(row.original.invested),
  }),
  holdingHelper.accessor((row) => sortKey(row.gross_value), {
    id: "value",
    ...numeric,
    header: ({ column }) => <SortableHeader column={column}>Valor bruto</SortableHeader>,
    cell: ({ row }) => formatBRL(row.original.gross_value),
  }),
  holdingHelper.accessor((row) => sortKey(row.day_change), {
    id: "day_change",
    ...numeric,
    header: ({ column }) => (
      <SortableHeader column={column}>
        <MetricHint hint={dayChangeHint}>Variação do dia</MetricHint>
      </SortableHeader>
    ),
    cell: ({ row }) => <Change value={row.original.day_change} ratio={row.original.day_return} />,
  }),
  holdingHelper.accessor((row) => sortKey(row.unrealized_result), {
    id: "total_change",
    ...numeric,
    header: ({ column }) => (
      <SortableHeader column={column}>
        <MetricHint hint={totalChangeHint}>Variação total</MetricHint>
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

// A primeira coluna é o nome; as outras são números, alinhados à direita
function SortedTable<TData extends RowData>({
  table,
}: {
  table: ReactTable<typeof features, TData>;
}) {
  return (
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
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getAllCells().map((cell, index) => (
              <TableCell
                key={cell.id}
                className={index > 0 ? "text-right tabular-nums" : undefined}
              >
                <table.FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

interface SortedSectionProps<TData> {
  data: TData[];
  sorting: SortingState;
  onSortingChange: (next: SortingState) => void;
}

function PositionsSection({ data, sorting, onSortingChange }: SortedSectionProps<Position>) {
  const table = useTable({
    features,
    columns: positionColumns,
    data,
    state: { sorting },
    onSortingChange: (updater) =>
      onSortingChange(typeof updater === "function" ? updater(sorting) : updater),
  });
  return <SortedTable table={table} />;
}

function HoldingsSection({ data, sorting, onSortingChange }: SortedSectionProps<Holding>) {
  const table = useTable({
    features,
    columns: holdingColumns,
    data,
    state: { sorting },
    onSortingChange: (updater) =>
      onSortingChange(typeof updater === "function" ? updater(sorting) : updater),
  });
  return <SortedTable table={table} />;
}

function CategoryHeader({ allocation }: { allocation: CategoryAllocation }) {
  const count = allocation.asset_count;
  const noun = allocation.category === "fixed_income" ? "título" : "ativo";

  return (
    <div className="grid flex-1 grid-cols-2 items-center gap-x-6 gap-y-2 pr-4 sm:grid-cols-5">
      <span>
        <span className="text-base font-semibold">{categoryLabels[allocation.category]}</span>
        <span className="text-muted-foreground block text-xs font-normal">
          {count} {count === 1 ? noun : `${noun}s`}
        </span>
      </span>
      <span className="text-right tabular-nums">
        <span className="text-muted-foreground block text-xs font-normal">Variação total</span>
        <Change value={allocation.unrealized_result} ratio={allocation.unrealized_return} />
      </span>
      <span className="text-right tabular-nums">
        <span className="text-muted-foreground block text-xs font-normal">Variação do dia</span>
        <Change value={allocation.day_change} ratio={allocation.day_return} />
      </span>
      <span className="text-right tabular-nums">
        <span className="text-muted-foreground block text-xs font-normal">Valor</span>
        {formatBRL(allocation.value)}
      </span>
      <span className="col-span-2 flex flex-col gap-1 sm:col-span-1">
        <span className="text-right text-xs font-normal tabular-nums">
          {formatPercent(allocation.share)} da carteira
        </span>
        <Progress value={toChartNumber(allocation.share) * 100} />
      </span>
    </div>
  );
}

/** Uma seção recolhível por categoria, com as posições dela. As seções de renda
variável ordenam juntas; a de renda fixa tem colunas e ordenação próprias. */
export function CategorySections({ portfolio }: { portfolio: Portfolio }) {
  const [equitySorting, setEquitySorting] = useState<SortingState>([]);
  const [holdingSorting, setHoldingSorting] = useState<SortingState>([]);
  const categories: Category[] = portfolio.categories.map((item) => item.category);

  if (categories.length === 0) {
    return (
      <p className="text-muted-foreground">
        Nenhuma posição aberta. Registre ou importe operações para começar.
      </p>
    );
  }

  return (
    <Accordion type="multiple" defaultValue={categories}>
      {portfolio.categories.map((allocation) => (
        <AccordionItem key={allocation.category} value={allocation.category}>
          <AccordionTrigger className="items-center hover:no-underline">
            <CategoryHeader allocation={allocation} />
          </AccordionTrigger>
          <AccordionContent>
            {allocation.category === "fixed_income" ? (
              <HoldingsSection
                data={portfolio.fixed_income}
                sorting={holdingSorting}
                onSortingChange={setHoldingSorting}
              />
            ) : (
              <PositionsSection
                data={portfolio.positions.filter(
                  (position) => position.asset_class === allocation.category,
                )}
                sorting={equitySorting}
                onSortingChange={setEquitySorting}
              />
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
