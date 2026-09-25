import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { type IncomeEvent, useSaveIncome } from "@/features/income/use-income";
import { AssetSelect } from "@/shared/components/asset-select";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  type IncomeType,
  incomeTypeLabels,
  incomeTypes,
  isIncomeType,
} from "@/shared/lib/labels";
import { parseDecimalInput } from "@/types/decimal";

const schema = z
  .object({
    asset_id: z.string().min(1, "Escolha o ativo."),
    payment_date: z.string().min(1, "Informe a data do pagamento."),
    income_type: z.custom<IncomeType>(
      (value) => typeof value === "string" && isIncomeType(value),
    ),
    quantity: z.string(),
    unit_price: z.string(),
    amount: z.string(),
  })
  .transform((values, context) => {
    const parsed = {
      quantity: parseDecimalInput(values.quantity),
      unit_price: parseDecimalInput(values.unit_price),
      amount: parseDecimalInput(values.amount),
    };
    for (const [path, value] of Object.entries(parsed)) {
      if (!value) {
        context.addIssue({ code: "custom", path: [path], message: "Valor inválido." });
      }
    }
    if (!parsed.quantity || !parsed.unit_price || !parsed.amount) {
      return z.NEVER;
    }
    return {
      asset_id: Number(values.asset_id),
      payment_date: values.payment_date,
      income_type: values.income_type,
      quantity: parsed.quantity,
      unit_price: parsed.unit_price,
      amount: parsed.amount,
    };
  });

interface IncomeFormDialogProps {
  /** Provento a editar; sem ele, o formulário cadastra um novo. */
  event?: IncomeEvent;
  trigger: ReactNode;
}

export function IncomeFormDialog({ event, trigger }: IncomeFormDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event ? "Editar provento" : "Novo provento"}</DialogTitle>
        </DialogHeader>
        {open && <IncomeForm event={event} onSaved={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function IncomeForm({ event, onSaved }: { event?: IncomeEvent; onSaved: () => void }) {
  const save = useSaveIncome(event?.id);
  const form = useForm({
    resolver: zodResolver(schema),
    values: {
      asset_id: event ? String(event.asset_id) : "",
      payment_date: event?.payment_date ?? "",
      income_type: event?.income_type ?? "dividend",
      quantity: event?.quantity ?? "",
      unit_price: event?.unit_price ?? "",
      amount: event?.amount ?? "",
    },
  });
  const { errors } = form.formState;

  const submit = form.handleSubmit((body) => save.mutate(body, { onSuccess: onSaved }));

  return (
    <form onSubmit={(event) => void submit(event)}>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.asset_id)}>
          <FieldLabel htmlFor="income-asset">Ativo</FieldLabel>
          <Controller
            control={form.control}
            name="asset_id"
            render={({ field }) => (
              <AssetSelect id="income-asset" value={field.value} onChange={field.onChange} />
            )}
          />
          <FieldError errors={[errors.asset_id]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="income-type">Tipo</FieldLabel>
          <Controller
            control={form.control}
            name="income_type"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(next) => {
                  if (isIncomeType(next)) field.onChange(next);
                }}
              >
                <SelectTrigger id="income-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {incomeTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {incomeTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field data-invalid={Boolean(errors.payment_date)}>
          <FieldLabel htmlFor="income-date">Data do pagamento</FieldLabel>
          <Input id="income-date" type="date" {...form.register("payment_date")} />
          <FieldError errors={[errors.payment_date]} />
        </Field>
        <Field data-invalid={Boolean(errors.quantity)}>
          <FieldLabel htmlFor="income-quantity">Quantidade</FieldLabel>
          <Input id="income-quantity" inputMode="decimal" {...form.register("quantity")} />
          <FieldError errors={[errors.quantity]} />
        </Field>
        <Field data-invalid={Boolean(errors.unit_price)}>
          <FieldLabel htmlFor="income-unit-price">Valor bruto por unidade</FieldLabel>
          <Input
            id="income-unit-price"
            inputMode="decimal"
            {...form.register("unit_price")}
          />
          <FieldError errors={[errors.unit_price]} />
        </Field>
        <Field data-invalid={Boolean(errors.amount)}>
          <FieldLabel htmlFor="income-amount">Valor líquido recebido</FieldLabel>
          <Input id="income-amount" inputMode="decimal" {...form.register("amount")} />
          <FieldDescription>
            O que caiu na conta, já sem o IR retido no JCP e no rendimento de ETF.
          </FieldDescription>
          <FieldError errors={[errors.amount]} />
        </Field>
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Button type="submit" disabled={save.isPending}>
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}
