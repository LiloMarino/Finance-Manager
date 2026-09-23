import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatDate } from "@/shared/lib/format";
import { formatQuantity } from "@/types/decimal";
import type { components } from "@/types/openapi.generated";

type LatestIndex = components["schemas"]["LatestIndexDTO"];

const seriesLabels: Record<LatestIndex["series"], string> = {
  cdi: "CDI (% ao dia)",
  selic: "Selic (% ao dia)",
  ipca: "IPCA (% no mês)",
};

export function IndexesTable({ indexes }: { indexes: LatestIndex[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Série</TableHead>
          <TableHead className="text-right">Último valor</TableHead>
          <TableHead className="text-right">Data</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {indexes.map((index) => (
          <TableRow key={index.series}>
            <TableCell className="font-medium">{seriesLabels[index.series]}</TableCell>
            <TableCell className="text-right tabular-nums">
              {index.value ? formatQuantity(index.value) : "—"}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {index.rate_date ? formatDate(index.rate_date) : "sem dado"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
