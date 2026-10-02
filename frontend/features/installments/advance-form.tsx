import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { bankRateHint, bankTotalHint } from "@/features/installments/hints";
import {
  type AdvanceParams,
  MAX_INSTALLMENTS,
  defaultInvestment,
  nextMonth,
} from "@/features/installments/installments-params";
import { ProjectionLine } from "@/features/installments/projection-line";
import { InvestmentTermsFields } from "@/shared/components/investment-terms-fields";
import { MetricHint } from "@/shared/components/metric-hint";
import { MoneyInput } from "@/shared/components/money-input";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { UnitInput } from "@/shared/components/unit-input";
import type { CurrentRates } from "@/shared/hooks/use-current-rates";
import { investmentTermsSchema } from "@/shared/lib/investment-terms";
import { maskInteger, maskMoney, maskPercent, withMask } from "@/shared/lib/mask";
import { parseDecimalInput, toDecimalInput, toMoneyInput } from "@/types/decimal";

type BankMode = AdvanceParams["bank_discount"]["kind"];

function isBankMode(value: unknown): value is BankMode {
  return value === "rate" || value === "total";
}

const schema = z
  .object({
    amount: z.string(),
    installments: z.string(),
    next_due_date: z.string().min(1, "Informe a data."),
    bank_mode: z.custom<BankMode>(isBankMode),
    bank_value: z.string(),
    investment: investmentTermsSchema,
  })
  .transform((values, context): AdvanceParams => {
    const amount = parseDecimalInput(values.amount);
    const installments = Number(values.installments);
    const bankValue = parseDecimalInput(values.bank_value);
    const validCount =
      Number.isInteger(installments) && installments >= 1 && installments <= MAX_INSTALLMENTS;
    if (!amount) {
      context.addIssue({ code: "custom", path: ["amount"], message: "Valor inválido." });
    }
    if (!validCount) {
      context.addIssue({
        code: "custom",
        path: ["installments"],
        message: `De 1 a ${MAX_INSTALLMENTS} parcelas.`,
      });
    }
    if (!bankValue) {
      context.addIssue({
        code: "custom",
        path: ["bank_value"],
        message: values.bank_mode === "rate" ? "Taxa inválida." : "Valor inválido.",
      });
    }
    if (!amount || !validCount || !bankValue) return z.NEVER;
    return {
      amount,
      installments,
      next_due_date: values.next_due_date,
      bank_discount:
        values.bank_mode === "rate"
          ? { kind: "rate", monthly_rate: bankValue }
          : { kind: "total", bank_total: bankValue },
      chosen: null,
      investment: values.investment,
    };
  });

interface AdvanceFormProps {
  value: AdvanceParams | null;
  current: CurrentRates;
  onSubmit: (value: AdvanceParams) => void;
}

export function AdvanceForm({ value, current, onSubmit }: AdvanceFormProps) {
  const discount = value?.bank_discount;
  const form = useForm({
    resolver: zodResolver(schema),
    values: {
      amount: value ? toMoneyInput(value.amount) : "",
      installments: String(value?.installments ?? 12),
      next_due_date: value?.next_due_date ?? nextMonth(),
      bank_mode: discount?.kind ?? "rate",
      bank_value: !discount
        ? ""
        : discount.kind === "rate"
          ? toDecimalInput(discount.monthly_rate)
          : toMoneyInput(discount.bank_total),
      investment: value
        ? { ...value.investment, rate: toDecimalInput(value.investment.rate) }
        : defaultInvestment,
    },
  });
  const { errors } = form.formState;
  const mode = useWatch({ control: form.control, name: "bank_mode" });
  const bankField = form.register("bank_value");

  return (
    <Card>
      <CardContent>
        <form
          className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
          onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
        >
          {/* O parcelamento no banco */}
          <div className="flex flex-col gap-3">
            <span className="text-eyebrow text-muted-foreground uppercase">
              O parcelamento no banco
            </span>
            <div className="grid items-start gap-3 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.amount)}>
                <FieldLabel htmlFor="advance-amount">Valor de cada parcela</FieldLabel>
                <MoneyInput
                  id="advance-amount"
                  className="text-right"
                  {...withMask(form.register("amount"), maskMoney)}
                />
                <FieldError errors={[errors.amount]} />
              </Field>
              <Field data-invalid={Boolean(errors.installments)}>
                <FieldLabel htmlFor="advance-installments">Parcelas que faltam</FieldLabel>
                <Input
                  id="advance-installments"
                  inputMode="numeric"
                  className="text-right"
                  {...withMask(form.register("installments"), maskInteger)}
                />
                <FieldError errors={[errors.installments]} />
              </Field>
              <Field data-invalid={Boolean(errors.next_due_date)}>
                <FieldLabel htmlFor="advance-next-due">Próxima parcela</FieldLabel>
                <Input id="advance-next-due" type="date" {...form.register("next_due_date")} />
                <FieldDescription>Está na fatura atual: não tem desconto.</FieldDescription>
                <FieldError errors={[errors.next_due_date]} />
              </Field>
              <Field data-invalid={Boolean(errors.bank_value)}>
                <FieldLabel htmlFor="advance-bank">
                  <MetricHint hint={mode === "rate" ? bankRateHint : bankTotalHint}>
                    Desconto do banco para adiantar
                  </MetricHint>
                </FieldLabel>
                <div className="flex items-center gap-2">
                  <Controller
                    control={form.control}
                    name="bank_mode"
                    render={({ field }) => (
                      <ToggleGroup
                        variant="segmented"
                        size="sm"
                        aria-label="Informar o desconto pela"
                        value={[field.value]}
                        onValueChange={([next]) => {
                          if (!isBankMode(next) || next === field.value) return;
                          field.onChange(next);
                          // O número digitado muda de unidade com o modo
                          form.setValue("bank_value", "");
                        }}
                      >
                        <ToggleGroupItem value="rate">Taxa</ToggleGroupItem>
                        <ToggleGroupItem value="total">Valor</ToggleGroupItem>
                      </ToggleGroup>
                    )}
                  />
                  {mode === "rate" ? (
                    <UnitInput
                      id="advance-bank"
                      unit="% ao mês"
                      {...withMask(bankField, maskPercent)}
                    />
                  ) : (
                    <MoneyInput
                      id="advance-bank"
                      className="text-right"
                      {...withMask(bankField, maskMoney)}
                    />
                  )}
                </div>
                <FieldDescription>
                  Em Valor, você digita o que o banco cobra para adiantar todas, menos a da fatura
                  atual, e o app acha a taxa.
                </FieldDescription>
                <FieldError errors={[errors.bank_value]} />
              </Field>
            </div>
          </div>

          {/* Onde o dinheiro fica se não adiantar */}
          <div className="lg:border-border-subtle flex flex-col gap-3 lg:border-l lg:pl-6">
            <span className="text-eyebrow text-muted-foreground uppercase">
              Onde o dinheiro fica se não adiantar
            </span>
            <div className="grid gap-3 sm:grid-cols-3">
              <Controller
                control={form.control}
                name="investment"
                render={({ field }) => (
                  <InvestmentTermsFields
                    id="advance"
                    compact
                    value={field.value}
                    onChange={field.onChange}
                    rateError={errors.investment?.rate}
                  />
                )}
              />
            </div>
            <ProjectionLine current={current} />
            <Button type="submit" className="mt-auto self-end">
              Calcular
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
