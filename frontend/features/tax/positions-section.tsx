import { Fragment, useState } from "react";

import type { PeriodReport } from "@/features/tax/use-tax";
import { Money, Quantity } from "@/shared/components/money";
import { TickerLabel } from "@/shared/components/ticker-label";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { assetClassLabels, assetClasses } from "@/shared/lib/labels";

type Moment = "opening" | "closing";

interface PositionsSectionProps {
  report: Pick<PeriodReport, "opening" | "closing">;
  /** "mês" ou "ano": o recorte que os rótulos do botão citam */
  period: "mês" | "ano";
}

/** As posições no início ou no fim do recorte, agrupadas pela classe do ativo. */
export function PositionsSection({ report, period }: PositionsSectionProps) {
  const [moment, setMoment] = useState<Moment>("closing");
  const positions = report[moment];
  const groups = assetClasses
    .map((assetClass) => ({
      assetClass,
      items: positions.filter((position) => position.asset_class === assetClass),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Posições</CardTitle>
        <CardAction>
          <ToggleGroup
            variant="segmented"
            size="sm"
            aria-label="Momento"
            value={[moment]}
            onValueChange={([next]) => {
              if (next === "opening" || next === "closing") setMoment(next);
            }}
          >
            <ToggleGroupItem value="opening">No início do {period}</ToggleGroupItem>
            <ToggleGroupItem value="closing">No fim do {period}</ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent data-flush>
        {groups.length === 0 ? (
          <p className="text-caption text-muted-foreground px-5">Nenhuma posição.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ativo</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Preço médio</TableHead>
                <TableHead className="text-right">Custo total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <Fragment key={group.assetClass}>
                  <TableRow variant="group">
                    <TableCell colSpan={4} variant="group">
                      {assetClassLabels[group.assetClass]}
                    </TableCell>
                  </TableRow>
                  {group.items.map((position) => (
                    <TableRow key={position.asset_id} to={`/assets/${position.asset_id}`}>
                      <TableCell>
                        <TickerLabel
                          ticker={position.ticker}
                          category={position.asset_class}
                          to={`/assets/${position.asset_id}`}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Quantity value={position.quantity} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Money value={position.average_price} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Money value={position.total_cost} />
                      </TableCell>
                    </TableRow>
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
