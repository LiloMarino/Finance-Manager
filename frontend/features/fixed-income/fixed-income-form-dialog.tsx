import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import {
  type FixedIncome,
  useCreateFixedIncome,
  useUpdateFixedIncome,
} from "@/features/fixed-income/use-fixed-income";
import { InvestmentTermsFields } from "@/shared/components/investment-terms-fields";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { investmentTermsSchema } from "@/shared/lib/investment-terms";
import { parseDecimalInput } from "@/types/decimal";

// Na criação, a primeira aplicação é obrigatória; na edição, os campos dela ficam
// fora do formulário e do corpo enviado
function schemaFor(creating: boolean) {
  return z
    .object({
      label: z.string().trim().min(1, "Informe o nome do título."),
      investment: investmentTermsSchema,
      maturity_date: z.string(),
      daily_liquidity: z.boolean(),
      application_date: z.string(),
      application_amount: z.string(),
    })
    .transform((values, context) => {
      const { application_date, application_amount, investment, ...terms } = values;
      const amount = parseDecimalInput(application_amount);
      if (creating && !application_date) {
        context.addIssue({
          code: "custom",
          path: ["application_date"],
          message: "Informe a data.",
        });
      }
      if (creating && !amount) {
        context.addIssue({
          code: "custom",
          path: ["application_amount"],
          message: "Valor inválido.",
        });
      }
      if (creating && (!amount || !application_date)) {
        return z.NEVER;
      }
      return {
        terms: { ...terms, ...investment, maturity_date: terms.maturity_date || null },
        application: amount ? { movement_date: application_date, amount } : null,
      };
    });
}

interface FixedIncomeFormDialogProps {
  /** Título a editar; sem ele, o formulário cria um novo. */
  investment?: FixedIncome;
  trigger: ReactNode;
}

export function FixedIncomeFormDialog({ investment, trigger }: FixedIncomeFormDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {investment ? `Editar ${investment.label}` : "Novo título de renda fixa"}
          </DialogTitle>
        </DialogHeader>
        {open && (
          <FixedIncomeForm investment={investment} onSaved={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface FixedIncomeFormProps {
  investment?: FixedIncome;
  onSaved: () => void;
}

function FixedIncomeForm({ investment, onSaved }: FixedIncomeFormProps) {
  const creating = investment === undefined;
  const create = useCreateFixedIncome();
  const update = useUpdateFixedIncome();
  const form = useForm({
    resolver: zodResolver(schemaFor(creating)),
    values: {
      label: investment?.label ?? "",
      investment: {
        product_type: investment?.product_type ?? "cdb",
        indexer: investment?.indexer ?? "cdi",
        rate: investment?.rate ?? "",
      },
      maturity_date: investment?.maturity_date ?? "",
      daily_liquidity: investment?.daily_liquidity ?? false,
      application_date: "",
      application_amount: "",
    },
  });
  const { errors } = form.formState;

  const submit = form.handleSubmit(({ terms, application }) => {
    if (investment) {
      update.mutate({ investmentId: investment.id, body: terms }, { onSuccess: onSaved });
    } else if (application) {
      create.mutate({ ...terms, application }, { onSuccess: onSaved });
    }
  });

  return (
    <form onSubmit={(event) => void submit(event)}>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.label)}>
          <FieldLabel htmlFor="fixed-income-label">Nome</FieldLabel>
          <Input
            id="fixed-income-label"
            placeholder="CDB Banco X 2030"
            {...form.register("label")}
          />
          <FieldError errors={[errors.label]} />
        </Field>
        <Controller
          control={form.control}
          name="investment"
          render={({ field }) => (
            <InvestmentTermsFields
              id="fixed-income"
              value={field.value}
              onChange={field.onChange}
              rateError={errors.investment?.rate}
            />
          )}
        />
        <Field>
          <FieldLabel htmlFor="fixed-income-maturity">Vencimento (opcional)</FieldLabel>
          <Input
            id="fixed-income-maturity"
            type="date"
            {...form.register("maturity_date")}
          />
        </Field>
        <Controller
          control={form.control}
          name="daily_liquidity"
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox
                id="fixed-income-liquidity"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              <FieldLabel htmlFor="fixed-income-liquidity">Liquidez diária</FieldLabel>
            </Field>
          )}
        />

        {/* Primeira aplicação */}
        {creating && (
          <div className="grid grid-cols-2 gap-4">
            <Field data-invalid={Boolean(errors.application_date)}>
              <FieldLabel htmlFor="fixed-income-application-date">
                Data da aplicação
              </FieldLabel>
              <Input
                id="fixed-income-application-date"
                type="date"
                {...form.register("application_date")}
              />
              <FieldError errors={[errors.application_date]} />
            </Field>
            <Field data-invalid={Boolean(errors.application_amount)}>
              <FieldLabel htmlFor="fixed-income-application-amount">
                Valor aplicado (R$)
              </FieldLabel>
              <Input
                id="fixed-income-application-amount"
                inputMode="decimal"
                {...form.register("application_amount")}
              />
              <FieldError errors={[errors.application_amount]} />
            </Field>
          </div>
        )}
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Button type="submit" disabled={create.isPending || update.isPending}>
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}
