import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import {
  type InstallmentMode,
  type SimulationParams,
  defaultInvestment,
  isInstallmentMode,
  modeLabels,
} from "@/features/installments/simulation-params";
import { InvestmentTermsFields } from "@/shared/components/investment-terms-fields";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { investmentTermsSchema } from "@/shared/lib/investment-terms";
import { isoDate } from "@/shared/lib/period";
import { parseDecimalInput, toDecimalInput } from "@/types/decimal";

const MAX_INSTALLMENTS = 60;

// O mesmo campo muda de sentido com o modo
const fieldLabels: Record<
  InstallmentMode,
  { amount: string; installments: string; firstDue: string; discount: string }
> = {
  purchase: {
    amount: "Preço (R$)",
    installments: "Parcelas",
    firstDue: "Primeira parcela",
    discount: "Desconto à vista (%)",
  },
  prepayment: {
    amount: "Valor de cada parcela (R$)",
    installments: "Parcelas que faltam",
    firstDue: "Próxima parcela",
    discount: "Desconto para adiantar (%)",
  },
};

const schema = z
  .object({
    mode: z.custom<InstallmentMode>(
      (value) => typeof value === "string" && isInstallmentMode(value),
    ),
    amount: z.string(),
    installments: z.string(),
    first_due_date: z.string().min(1, "Informe a data."),
    cash_discount: z.string(),
    investment: investmentTermsSchema,
  })
  .transform((values, context): SimulationParams => {
    const amount = parseDecimalInput(values.amount);
    const installments = Number(values.installments);
    const discount = values.cash_discount.trim()
      ? parseDecimalInput(values.cash_discount)
      : null;
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
      context.addIssue({
        code: "custom",
        path: ["cash_discount"],
        message: "Desconto inválido.",
      });
    }
    if (!amount || !validCount || (values.cash_discount.trim() && !discount)) {
      return z.NEVER;
    }
    return {
      mode: values.mode,
      amount,
      installments,
      first_due_date: values.first_due_date,
      cash_discount: discount,
      investment: values.investment,
    };
  });

function nextMonth(): string {
  const today = new Date();
  return isoDate(new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()));
}

interface SimulationFormProps {
  simulation: SimulationParams | null;
  onSubmit: (simulation: SimulationParams) => void;
}

export function SimulationForm({ simulation, onSubmit }: SimulationFormProps) {
  const form = useForm({
    resolver: zodResolver(schema),
    values: {
      mode: simulation?.mode ?? "purchase",
      amount: simulation ? toDecimalInput(simulation.amount) : "",
      installments: String(simulation?.installments ?? 10),
      first_due_date: simulation?.first_due_date ?? nextMonth(),
      cash_discount: simulation?.cash_discount ? toDecimalInput(simulation.cash_discount) : "",
      investment: simulation
        ? { ...simulation.investment, rate: toDecimalInput(simulation.investment.rate) }
        : defaultInvestment,
    },
  });
  const { errors } = form.formState;
  const mode = useWatch({ control: form.control, name: "mode" });
  const labels = fieldLabels[mode];

  return (
    <form onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="mode"
          render={({ field }) => (
            <Tabs
              value={field.value}
              onValueChange={(next) => {
                if (isInstallmentMode(next)) field.onChange(next);
              }}
            >
              <TabsList>
                {Object.entries(modeLabels).map(([value, label]) => (
                  <TabsTrigger key={value} value={value}>
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
        />

        {/* A compra ou as parcelas que faltam */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field data-invalid={Boolean(errors.amount)}>
            <FieldLabel htmlFor="simulation-amount">{labels.amount}</FieldLabel>
            <Input id="simulation-amount" inputMode="decimal" {...form.register("amount")} />
            <FieldError errors={[errors.amount]} />
          </Field>
          <Field data-invalid={Boolean(errors.installments)}>
            <FieldLabel htmlFor="simulation-installments">{labels.installments}</FieldLabel>
            <Input
              id="simulation-installments"
              inputMode="numeric"
              {...form.register("installments")}
            />
            <FieldError errors={[errors.installments]} />
          </Field>
          <Field data-invalid={Boolean(errors.first_due_date)}>
            <FieldLabel htmlFor="simulation-first-due">{labels.firstDue}</FieldLabel>
            <Input id="simulation-first-due" type="date" {...form.register("first_due_date")} />
            <FieldError errors={[errors.first_due_date]} />
          </Field>
          <Field data-invalid={Boolean(errors.cash_discount)}>
            <FieldLabel htmlFor="simulation-discount">{labels.discount}</FieldLabel>
            <Input
              id="simulation-discount"
              inputMode="decimal"
              placeholder="Opcional"
              {...form.register("cash_discount")}
            />
            <FieldDescription>Sem desconto, sai só o desconto que empata.</FieldDescription>
            <FieldError errors={[errors.cash_discount]} />
          </Field>
        </div>

        {/* Onde o dinheiro fica enquanto as parcelas não vencem */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Controller
            control={form.control}
            name="investment"
            render={({ field }) => (
              <InvestmentTermsFields
                id="simulation"
                value={field.value}
                onChange={field.onChange}
                rateError={errors.investment?.rate}
              />
            )}
          />
        </div>
      </FieldGroup>
      <Button type="submit" className="mt-6">
        Simular
      </Button>
    </form>
  );
}
