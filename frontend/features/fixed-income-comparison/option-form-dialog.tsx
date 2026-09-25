import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import type { ComparisonOption } from "@/features/fixed-income-comparison/options";
import { InvestmentTermsFields } from "@/shared/components/investment-terms-fields";
import { Button } from "@/shared/components/ui/button";
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
import { parseDecimalInput, toDecimalInput } from "@/types/decimal";

const schema = z
  .object({
    label: z.string().trim().min(1, "Informe um nome para a opção."),
    investment: investmentTermsSchema,
    amount: z.string(),
    application_date: z.string().min(1, "Informe a data."),
    redemption_date: z.string().min(1, "Informe a data."),
  })
  .transform((values, context) => {
    const amount = parseDecimalInput(values.amount);
    if (!amount) {
      context.addIssue({ code: "custom", path: ["amount"], message: "Valor inválido." });
    }
    // Data ISO se compara como texto
    if (values.redemption_date <= values.application_date) {
      context.addIssue({
        code: "custom",
        path: ["redemption_date"],
        message: "O resgate vem depois da aplicação.",
      });
    }
    if (!amount || values.redemption_date <= values.application_date) return z.NEVER;
    const { investment, ...rest } = values;
    return { ...rest, ...investment, amount };
  });

interface OptionFormDialogProps {
  title: string;
  /** A opção de partida: a que se edita, ou a sugerida para uma nova. */
  option: ComparisonOption;
  onSave: (option: ComparisonOption) => void;
  trigger: ReactNode;
}

export function OptionFormDialog({ title, option, onSave, trigger }: OptionFormDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {open && (
          <OptionForm
            option={option}
            onSave={(saved) => {
              onSave(saved);
              setOpen(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function OptionForm({
  option,
  onSave,
}: {
  option: ComparisonOption;
  onSave: (option: ComparisonOption) => void;
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    values: {
      label: option.label,
      investment: {
        product_type: option.product_type,
        indexer: option.indexer,
        rate: toDecimalInput(option.rate),
      },
      amount: toDecimalInput(option.amount),
      application_date: option.application_date,
      redemption_date: option.redemption_date,
    },
  });
  const { errors } = form.formState;

  return (
    <form onSubmit={(event) => void form.handleSubmit(onSave)(event)}>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.label)}>
          <FieldLabel htmlFor="option-label">Nome</FieldLabel>
          <Input id="option-label" placeholder="CDB Banco X" {...form.register("label")} />
          <FieldError errors={[errors.label]} />
        </Field>
        <Controller
          control={form.control}
          name="investment"
          render={({ field }) => (
            <InvestmentTermsFields
              id="option"
              value={field.value}
              onChange={field.onChange}
              rateError={errors.investment?.rate}
            />
          )}
        />
        <Field data-invalid={Boolean(errors.amount)}>
          <FieldLabel htmlFor="option-amount">Valor aplicado (R$)</FieldLabel>
          <Input id="option-amount" inputMode="decimal" {...form.register("amount")} />
          <FieldError errors={[errors.amount]} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={Boolean(errors.application_date)}>
            <FieldLabel htmlFor="option-application">Aplicação</FieldLabel>
            <Input
              id="option-application"
              type="date"
              {...form.register("application_date")}
            />
            <FieldError errors={[errors.application_date]} />
          </Field>
          <Field data-invalid={Boolean(errors.redemption_date)}>
            <FieldLabel htmlFor="option-redemption">Resgate</FieldLabel>
            <Input
              id="option-redemption"
              type="date"
              {...form.register("redemption_date")}
            />
            <FieldError errors={[errors.redemption_date]} />
          </Field>
        </div>
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Button type="submit">Salvar</Button>
      </DialogFooter>
    </form>
  );
}
