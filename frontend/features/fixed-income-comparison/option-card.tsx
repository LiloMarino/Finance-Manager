import { Pencil, Trash2 } from "lucide-react";

import {
  cdiEquivalentHint,
  incomeTaxHint,
  iofHint,
  netAnnualHint,
  netValueHint,
} from "@/features/fixed-income-comparison/hints";
import { OptionFormDialog } from "@/features/fixed-income-comparison/option-form-dialog";
import type { ComparisonOption } from "@/features/fixed-income-comparison/options";
import type { Comparison } from "@/features/fixed-income-comparison/use-comparison";
import { Metric } from "@/shared/components/metric";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { formatDate } from "@/shared/lib/format";
import { describeRate, fixedIncomeTypeLabels } from "@/shared/lib/labels";
import {
  formatBRL,
  formatPercent,
  formatRate,
  formatSignedBRL,
  isZero,
} from "@/types/decimal";

type OptionResult = Comparison["results"][number];

interface OptionCardProps {
  option: ComparisonOption;
  result: OptionResult | undefined;
  best: boolean;
  onSave: (option: ComparisonOption) => void;
  onRemove: () => void;
}

export function OptionCard({ option, result, best, onSave, onRemove }: OptionCardProps) {
  return (
    <Card>
      {/* Termos da opção */}
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          {option.label}
          {best && <Badge>Maior líquido</Badge>}
        </CardTitle>
        <CardDescription>
          {fixedIncomeTypeLabels[option.product_type]} ·{" "}
          {describeRate(option.indexer, option.rate)}
          <br />
          {formatBRL(option.amount)} de {formatDate(option.application_date)} a{" "}
          {formatDate(option.redemption_date)}
          {result && ` · ${result.calendar_days} dias`}
        </CardDescription>
        <CardAction className="flex gap-1">
          <OptionFormDialog
            title={`Editar ${option.label}`}
            option={option}
            onSave={onSave}
            trigger={
              <Button variant="ghost" size="icon-sm" aria-label="Editar opção">
                <Pencil />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Remover opção"
            onClick={onRemove}
          >
            <Trash2 />
          </Button>
        </CardAction>
      </CardHeader>

      {/* Resultado no resgate */}
      <CardContent className="grid grid-cols-2 gap-4">
        {result ? (
          <>
            <Metric label="Líquido no resgate" hint={netValueHint} value={formatBRL(result.net_value)} />
            <Metric
              label="Ganho líquido"
              hint={netValueHint}
              value={formatSignedBRL(result.net_gain)}
            />
            <Metric
              label="Líquido ao ano"
              hint={netAnnualHint}
              value={
                result.net_annual_return === null
                  ? null
                  : formatPercent(result.net_annual_return)
              }
            />
            <Metric
              label="Equivalente em CDB"
              hint={cdiEquivalentHint}
              value={
                result.cdi_equivalent === null
                  ? null
                  : `${formatRate(result.cdi_equivalent)}% do CDI`
              }
            />
            <Metric
              label="IR"
              hint={incomeTaxHint}
              value={
                result.income_tax_rate === null
                  ? "Isento"
                  : `${formatBRL(result.income_tax)} (${formatPercent(result.income_tax_rate)})`
              }
            />
            {!isZero(result.iof) && (
              <Metric
                label="IOF"
                hint={iofHint}
                value={`${formatBRL(result.iof)} (${formatPercent(result.iof_rate)})`}
              />
            )}
          </>
        ) : (
          <span className="text-muted-foreground col-span-2 text-sm">Calculando…</span>
        )}
      </CardContent>
    </Card>
  );
}
