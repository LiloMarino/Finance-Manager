import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import {
  MAX_INSTALLMENTS,
  type PurchaseParams,
  defaultInvestment,
  nextMonth,
} from "@/features/installments/installments-params";
import { ProjectionLine } from "@/features/installments/projection-line";
import { InvestmentTermsFields } from "@/shared/components/investment-terms-fields";
import { MoneyInput } from "@/shared/components/money-input";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { UnitInput } from "@/shared/components/unit-input";
import type { CurrentRates } from "@/shared/hooks/use-current-rates";
import { investmentTermsSchema } from "@/shared/lib/investment-terms";
import { maskInteger, maskMoney, maskPercent, withMask } from "@/shared/lib/mask";
import { parseDecimalInput, toDecimalInput, toMoneyInput } from "@/types/decimal";

const schema = z
  .object({
    amount: z.string(),
    installments: z.string(),
    first_due_date: z.string().min(1, "Informe a data."),
    cash_discount: z.string(),
    investment: investmentTermsSchema,
  })
  .transform((values, context): PurchaseParams => {
    const amount = parseDecimalInput(values.amount);
    const installments = Number(values.installments);
    const discount = values.cash_discount.trim() ? parseDecimalInput(values.cash_discount) : null;
    if (!amount) {
      context.addIssue({ code: "custom", path: ["amount"], message: "Valor inválido." });
    }
    const validCount =
      Number.isInteger(installments) && installments >= 1 && installments <= MAX_INSTALLMENTS;
    if (!validCount) {
      context.addIssue({
        code: "custom",
        path: ["installments"],
        message: `De 1 a ${MAX_INSTALLMENTS} parcelas.`,
      });
    }
    if (values.cash_discount.trim() && !discount) {
      context.addIssue({ code: "custom", path: ["cash_discount"], message: "Desconto inválido." });
    }
    if (!amount || !validCount || (values.cash_discount.trim() && !discount)) {
      return z.NEVER;
    }
    return {
      amount,
      installments,
      first_due_date: values.first_due_date,
      cash_discount: discount,
      investment: values.investment,
    };
  });

interface PurchaseFormProps {
  purchase: PurchaseParams | null;
  current: CurrentRates;
  onSubmit: (purchase: PurchaseParams) => void;
}

export function PurchaseForm({ purchase, current, onSubmit }: PurchaseFormProps) {
  const form = useForm({
    resolver: zodResolver(schema),
    values: {
      amount: purchase ? toMoneyInput(purchase.amount) : "",
      installments: String(purchase?.installments ?? 10),
      first_due_date: purchase?.first_due_date ?? nextMonth(),
      cash_discount: purchase?.cash_discount ? toDecimalInput(purchase.cash_discount) : "",
      investment: purchase
        ? { ...purchase.investment, rate: toDecimalInput(purchase.investment.rate) }
        : defaultInvestment,
    },
  });
  const { errors } = form.formState;

  return (
    <Card>
      <CardContent>
        <form
          className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
          onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
        >
          {/* A compra */}
          <div className="flex flex-col gap-3">
            <span className="text-eyebrow text-muted-foreground uppercase">A compra</span>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.amount)}>
                <FieldLabel htmlFor="purchase-amount">Preço</FieldLabel>
                <MoneyInput
                  id="purchase-amount"
                  className="text-right"
                  {...withMask(form.register("amount"), maskMoney)}
                />
                <FieldError errors={[errors.amount]} />
              </Field>
              <Field data-invalid={Boolean(errors.installments)}>
                <FieldLabel htmlFor="purchase-installments">Parcelas</FieldLabel>
                <Input
                  id="purchase-installments"
                  inputMode="numeric"
                  className="text-right"
                  {...withMask(form.register("installments"), maskInteger)}
                />
                <FieldError errors={[errors.installments]} />
              </Field>
              <Field data-invalid={Boolean(errors.first_due_date)}>
                <FieldLabel htmlFor="purchase-first-due">Primeira parcela</FieldLabel>
                <Input id="purchase-first-due" type="date" {...form.register("first_due_date")} />
                <FieldError errors={[errors.first_due_date]} />
              </Field>
              <Field data-invalid={Boolean(errors.cash_discount)}>
                <FieldLabel htmlFor="purchase-discount">
                  Desconto à vista
                  <span className="text-muted-foreground font-normal">· opcional</span>
                </FieldLabel>
                <UnitInput
                  id="purchase-discount"
                  unit="%"
                  {...withMask(form.register("cash_discount"), maskPercent)}
                />
                <FieldError errors={[errors.cash_discount]} />
              </Field>
            </div>
          </div>

          {/* Onde o dinheiro fica até cada parcela */}
          <div className="lg:border-border-subtle flex flex-col gap-3 lg:border-l lg:pl-6">
            <span className="text-eyebrow text-muted-foreground uppercase">
              Onde o dinheiro fica até cada parcela
            </span>
            <div className="grid gap-3 sm:grid-cols-3">
              <Controller
                control={form.control}
                name="investment"
                render={({ field }) => (
                  <InvestmentTermsFields
                    id="purchase"
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
