import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { formatMonth } from "@/features/tax/labels";
import {
  type MonthlyTax,
  useDeleteDarfPayment,
  useSaveDarfPayment,
} from "@/features/tax/use-tax";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { parseDecimalInput } from "@/types/decimal";

const schema = z
  .object({
    paid_on: z.string().min(1, "Informe a data do pagamento."),
    amount: z.string(),
  })
  .transform((values, context) => {
    const amount = parseDecimalInput(values.amount);
    if (!amount) {
      context.addIssue({ code: "custom", path: ["amount"], message: "Valor inválido." });
      return z.NEVER;
    }
    return { ...values, amount };
  });

export function DarfPaymentDialog({ month }: { month: MonthlyTax }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={month.payment ? "ghost" : "outline"} size="sm">
          {month.payment ? "Editar pagamento" : "Marcar pago"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>DARF de {formatMonth(month.year, month.month)}</DialogTitle>
          <DialogDescription>
            Registre o que foi pago de fato. O relatório do IRPF usa este valor.
          </DialogDescription>
        </DialogHeader>
        {open && <DarfPaymentForm month={month} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}

interface DarfPaymentFormProps {
  month: MonthlyTax;
  onDone: () => void;
}

function DarfPaymentForm({ month, onDone }: DarfPaymentFormProps) {
  const save = useSaveDarfPayment(month);
  const remove = useDeleteDarfPayment(month);
  const values: z.input<typeof schema> = {
    paid_on: month.payment?.paid_on ?? "",
    amount: month.payment?.amount ?? month.darf_amount ?? "",
  };
  const form = useForm({ resolver: zodResolver(schema), values });
  const { errors } = form.formState;

  const submit = form.handleSubmit((body) => save.mutate(body, { onSuccess: onDone }));

  return (
    <form onSubmit={(event) => void submit(event)}>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.paid_on)}>
          <FieldLabel htmlFor="darf-paid-on">Data do pagamento</FieldLabel>
          <Input id="darf-paid-on" type="date" {...form.register("paid_on")} />
          <FieldError errors={[errors.paid_on]} />
        </Field>
        <Field data-invalid={Boolean(errors.amount)}>
          <FieldLabel htmlFor="darf-amount">Valor pago</FieldLabel>
          <Input id="darf-amount" inputMode="decimal" {...form.register("amount")} />
          <FieldError errors={[errors.amount]} />
        </Field>
      </FieldGroup>
      <DialogFooter className="mt-6">
        {month.payment && (
          <Button
            type="button"
            variant="outline"
            disabled={remove.isPending}
            onClick={() => remove.mutate(undefined, { onSuccess: onDone })}
          >
            Remover pagamento
          </Button>
        )}
        <Button type="submit" disabled={save.isPending}>
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}
