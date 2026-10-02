import { Pencil, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import {
  cdiEquivalentHint,
  incomeTaxHint,
  iofHint,
  netAnnualHint,
  netValueHint,
} from "@/features/fixed-income-comparison/hints";
import { OptionFormDialog } from "@/features/fixed-income-comparison/option-form-dialog";
import { optionStyle } from "@/features/fixed-income-comparison/option-style";
import type { ComparisonOption } from "@/features/fixed-income-comparison/options";
import type { Comparison } from "@/features/fixed-income-comparison/use-comparison";
import { ColorSwatch } from "@/shared/components/color-swatch";
import { MetricHint } from "@/shared/components/metric-hint";
import { Money } from "@/shared/components/money";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { formatDate } from "@/shared/lib/format";
import { describeRate, fixedIncomeTypeLabels } from "@/shared/lib/labels";
import { formatPercent, formatRate, isZero } from "@/types/decimal";

type OptionResult = Comparison["results"][number];

function Detail({ label, hint, children }: { label: string; hint: string; children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-caption text-muted-foreground">
        <MetricHint hint={hint}>{label}</MetricHint>
      </span>
      <span className="tabular-nums">{children}</span>
    </div>
  );
}

interface OptionCardProps {
  option: ComparisonOption;
  /** A posição da opção, que define o traço dela */
  index: number;
  result: OptionResult | undefined;
  best: boolean;
  onSave: (option: ComparisonOption) => void;
  onRemove: () => void;
}

export function OptionCard({ option, index, result, best, onSave, onRemove }: OptionCardProps) {
  const style = optionStyle(index);

  return (
    <Card variant={best ? "positive" : "default"}>
      {/* Termos da opção */}
      <CardHeader>
        <CardTitle>
          <ColorSwatch color={style.color} shape={style.shape} />
          {option.label}
        </CardTitle>
        <CardAction className="flex items-center gap-1">
          {best && <Badge variant="gain">Maior líquido</Badge>}
          <OptionFormDialog
            title={`Editar ${option.label}`}
            option={option}
            onSave={onSave}
            trigger={
              <Button variant="ghost" size="icon-sm" aria-label={`Editar ${option.label}`}>
                <Pencil />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Remover ${option.label}`}
            onClick={onRemove}
          >
            <Trash2 />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <span className="text-caption text-muted-foreground">
          {fixedIncomeTypeLabels[option.product_type]} · {describeRate(option.indexer, option.rate)}{" "}
          · <Money value={option.amount} /> de {formatDate(option.application_date)} a{" "}
          {formatDate(option.redemption_date)}
          {result && ` · ${result.calendar_days} dias`}
        </span>
        {result ? (
          <>
            <div className="flex flex-col gap-0.5">
              <span className="text-caption text-muted-foreground">
                <MetricHint hint={netValueHint}>Líquido no resgate</MetricHint>
              </span>
              <span className="text-kpi-sm tabular-nums">
                <Money value={result.net_value} />
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Detail label="Taxa efetiva ao ano" hint={netAnnualHint}>
                {result.net_annual_return === null
                  ? "—"
                  : `${formatPercent(result.net_annual_return)} líquido`}
              </Detail>
              <Detail label="Equivale a" hint={cdiEquivalentHint}>
                {result.cdi_equivalent === null
                  ? "—"
                  : `${formatRate(result.cdi_equivalent)}% do CDI`}
              </Detail>
              <Detail label="IR retido" hint={incomeTaxHint}>
                {result.income_tax_rate === null ? (
                  "Isento"
                ) : (
                  <>
                    <Money value={result.income_tax} /> ({formatPercent(result.income_tax_rate)})
                  </>
                )}
              </Detail>
              <Detail label="IOF" hint={iofHint}>
                {isZero(result.iof) ? (
                  <Money value={result.iof} />
                ) : (
                  <>
                    <Money value={result.iof} /> ({formatPercent(result.iof_rate)})
                  </>
                )}
              </Detail>
            </div>
          </>
        ) : (
          <span className="text-muted-foreground text-sm">Calculando…</span>
        )}
      </CardContent>
    </Card>
  );
}
