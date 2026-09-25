import { Bar, BarChart, XAxis, YAxis } from "recharts";

import type { Portfolio } from "@/features/portfolio/use-portfolio";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { type DecimalString, formatBRL, formatPercent, toChartNumber } from "@/types/decimal";

const UNCLASSIFIED = "Sem classificação";

// Uma cor só: a barra compara tamanhos, e o número de setores não cabe na paleta
const chartConfig = {
  value: { label: "Valor", color: "var(--chart-1)" },
} satisfies ChartConfig;

interface Slice {
  label: string;
  value: DecimalString;
  share: DecimalString;
}

export function SectorDistribution({
  sectors,
  segments,
}: {
  sectors: Portfolio["sectors"];
  segments: Portfolio["segments"];
}) {
  const bySector = sectors.map((item) => ({
    label: item.sector ?? UNCLASSIFIED,
    value: item.value,
    share: item.share,
  }));
  const bySegment = segments.map((item) => ({
    label: item.sector ? `${item.sector} · ${item.segment}` : UNCLASSIFIED,
    value: item.value,
    share: item.share,
  }));

  return (
    <Tabs defaultValue="sector">
      <TabsList>
        <TabsTrigger value="sector">Setor</TabsTrigger>
        <TabsTrigger value="segment">Segmento</TabsTrigger>
      </TabsList>
      <TabsContent value="sector">
        <Distribution slices={bySector} heading="Setor" />
      </TabsContent>
      <TabsContent value="segment">
        <Distribution slices={bySegment} heading="Segmento" />
      </TabsContent>
    </Tabs>
  );
}

function Distribution({ slices, heading }: { slices: Slice[]; heading: string }) {
  const byLabel = new Map(slices.map((item) => [item.label, item]));
  const data = slices.map((item) => ({ label: item.label, value: toChartNumber(item.value) }));

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Barras horizontais, do maior valor para o menor */}
      <ChartContainer
        config={chartConfig}
        className="aspect-auto w-full lg:w-1/2"
        style={{ height: slices.length * 36 + 16 }}
      >
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <XAxis type="number" dataKey="value" hide />
          <YAxis
            type="category"
            dataKey="label"
            width={160}
            tickLine={false}
            axisLine={false}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(_, __, entry) => {
                  const item = byLabel.get(String(entry.payload.label));
                  if (!item) return null;
                  return (
                    <span className="flex w-full justify-between gap-4">
                      <span>{item.label}</span>
                      <span className="tabular-nums">
                        {formatBRL(item.value)} · {formatPercent(item.share)}
                      </span>
                    </span>
                  );
                }}
              />
            }
          />
          <Bar dataKey="value" fill="var(--color-value)" radius={4} />
        </BarChart>
      </ChartContainer>

      {/* Valores */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{heading}</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">% da renda variável</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {slices.map((item) => (
            <TableRow key={item.label}>
              <TableCell>{item.label}</TableCell>
              <TableCell className="text-right tabular-nums">{formatBRL(item.value)}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatPercent(item.share)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
