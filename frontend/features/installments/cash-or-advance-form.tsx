import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { bankRateHint } from "@/features/installments/hints";
import {
  type CashOrAdvanceParams,
  MAX_INSTALLMENTS,
  nextMonth,
} from "@/features/installments/installments-params";
import { MetricHint } from "@/shared/components/metric-hint";
import { MoneyInput } from "@/shared/components/money-input";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { UnitInput } from "@/shared/components/unit-input";
import { maskInteger, maskMoney, maskPercent, withMask } from "@/shared/lib/mask";
import { parseDecimalInput, toDecimalInput, toMoneyInput } from "@/types/decimal";

const schema = z
  .object({
    price: z.string(),
    installments: z.string(),
    first_due_date: z.string().min(1, "Informe a data."),
    cash_discount: z.string(),
    monthly_rate: z.string(),
  })
  .transform((values, context): CashOrAdvanceParams => {
    const price = parseDecimalInput(values.price);
    const installments = Number(values.installments);
    const discount = parseDecimalInput(values.cash_discount);
    const rate = parseDecimalInput(values.monthly_rate);
    const validCount =
      Number.isInteger(installments) && installments >= 1 && installments <= MAX_INSTALLMENTS;
    if (!price) {
      context.addIssue({ code: "custom", path: ["price"], message: "Valor inválido." });
    }
    if (!validCount) {
      context.addIssue({
        code: "custom",
        path: ["installments"],
        message: `De 1 a ${MAX_INSTALLMENTS} parcelas.`,
      });
    }
    if (!discount) {
      context.addIssue({ code: "custom", path: ["cash_discount"], message: "Desconto inválido." });
    }
    if (!rate) {
      context.addIssue({ code: "custom", path: ["monthly_rate"], message: "Taxa inválida." });
    }
    if (!price || !validCount || !discount || !rate) return z.NEVER;
    return {
      price,
      installments,
      first_due_date: values.first_due_date,
      cash_discount: discount,
      monthly_rate: rate,
    };
  });

interface CashOrAdvanceFormProps {
  value: CashOrAdvanceParams | null;
  onSubmit: (value: CashOrAdvanceParams) => void;
}

export function CashOrAdvanceForm({ value, onSubmit }: CashOrAdvanceFormProps) {
  const form = useForm({
    resolver: zodResolver(schema),
    values: {
      price: value ? toMoneyInput(value.price) : "",
      installments: String(value?.installments ?? 12),
      first_due_date: value?.first_due_date ?? nextMonth(),
      cash_discount: value ? toDecimalInput(value.cash_discount) : "",
      monthly_rate: value ? toDecimalInput(value.monthly_rate) : "",
    },
  });
  const { errors } = form.formState;

  return (
    <Card>
      <CardContent>
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
        >
          <span className="text-eyebrow text-muted-foreground uppercase">A compra</span>
          <div className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.5fr)_auto]">
            <Field data-invalid={Boolean(errors.price)}>
              <FieldLabel htmlFor="vista-price">Preço</FieldLabel>
              <MoneyInput
                id="vista-price"
                className="text-right"
                {...withMask(form.register("price"), maskMoney)}
              />
              <FieldError errors={[errors.price]} />
            </Field>
            <Field data-invalid={Boolean(errors.installments)}>
              <FieldLabel htmlFor="vista-installments">Parcelas</FieldLabel>
              <Input
                id="vista-installments"
                inputMode="numeric"
                className="text-right"
                {...withMask(form.register("installments"), maskInteger)}
              />
              <FieldError errors={[errors.installments]} />
            </Field>
            <Field data-invalid={Boolean(errors.first_due_date)}>
              <FieldLabel htmlFor="vista-first-due">Primeira parcela</FieldLabel>
              <Input id="vista-first-due" type="date" {...form.register("first_due_date")} />
              <FieldError errors={[errors.first_due_date]} />
            </Field>
            <Field data-invalid={Boolean(errors.cash_discount)}>
              <FieldLabel htmlFor="vista-discount">Desconto à vista</FieldLabel>
              <UnitInput
                id="vista-discount"
                unit="%"
                {...withMask(form.register("cash_discount"), maskPercent)}
              />
              <FieldError errors={[errors.cash_discount]} />
            </Field>
            <Field data-invalid={Boolean(errors.monthly_rate)}>
              <FieldLabel htmlFor="vista-rate">
                <MetricHint hint={bankRateHint}>Desconto do banco para adiantar</MetricHint>
              </FieldLabel>
              <UnitInput
                id="vista-rate"
                unit="% ao mês"
                {...withMask(form.register("monthly_rate"), maskPercent)}
              />
              <FieldError errors={[errors.monthly_rate]} />
            </Field>
            <Button type="submit" className="self-end">
              Calcular
            </Button>
          </div>
          <span className="text-caption text-muted-foreground">
            Parcela o preço cheio e, logo depois, adianta tudo o que dá. A 1ª parcela cai na fatura
            atual e não tem desconto; as outras são descontadas pela taxa do banco, mais desconto
            quanto mais longe vencem.
          </span>
        </form>
      </CardContent>
    </Card>
  );
}
