import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  useAddCheck,
  useAddWithdrawal,
  useUpdateCashSettings,
} from "@/features/cash/use-cash";
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
import { type DecimalString, parseDecimalInput, toDecimalInput } from "@/types/decimal";

const amountField = z.string().transform((value, context) => {
  const parsed = parseDecimalInput(value);
  if (!parsed) {
    context.addIssue({ code: "custom", message: "Valor inválido." });
    return z.NEVER;
  }
  return parsed;
});

const datedSchema = z.object({
  day: z.string().min(1, "Informe a data."),
  amount: amountField,
});

interface CashDialogProps {
  trigger: ReactNode;
  title: string;
  description: string;
  children: (close: () => void) => ReactNode;
}

function CashDialog({ trigger, title, description, children }: CashDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {open && children(() => setOpen(false))}
      </DialogContent>
    </Dialog>
  );
}

interface DatedFormProps {
  amountLabel: string;
  pending: boolean;
  onSubmit: (day: string, amount: DecimalString) => void;
}

function DatedForm({ amountLabel, pending, onSubmit }: DatedFormProps) {
  const defaultValues: z.input<typeof datedSchema> = { day: "", amount: "" };
  const form = useForm({ resolver: zodResolver(datedSchema), defaultValues });
  const { errors } = form.formState;
  const submit = form.handleSubmit(({ day, amount }) => onSubmit(day, amount));

  return (
    <form onSubmit={(event) => void submit(event)}>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.day)}>
          <FieldLabel htmlFor="cash-day">Data</FieldLabel>
          <Input id="cash-day" type="date" {...form.register("day")} />
          <FieldError errors={[errors.day]} />
        </Field>
        <Field data-invalid={Boolean(errors.amount)}>
          <FieldLabel htmlFor="cash-amount">{amountLabel}</FieldLabel>
          <Input id="cash-amount" inputMode="decimal" {...form.register("amount")} />
          <FieldError errors={[errors.amount]} />
        </Field>
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Button type="submit" disabled={pending}>
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CheckDialog({ trigger, opened }: { trigger: ReactNode; opened: boolean }) {
  const add = useAddCheck();

  return (
    <CashDialog
      trigger={trigger}
      title={opened ? "Conferir com o extrato" : "Abrir o saldo"}
      description={
        opened
          ? "O saldo do extrato no fim do dia substitui o saldo calculado, e a diferença fica registrada no extrato abaixo."
          : "O saldo do extrato da corretora no fim do dia. Daqui em diante, venda, provento e vencimento entram no saldo, e compra e aplicação saem dele."
      }
    >
      {(close) => (
        <DatedForm
          amountLabel="Saldo no extrato"
          pending={add.isPending}
          onSubmit={(day, balance) =>
            add.mutate({ check_date: day, balance }, { onSuccess: close })
          }
        />
      )}
    </CashDialog>
  );
}

export function WithdrawalDialog({ trigger }: { trigger: ReactNode }) {
  const add = useAddWithdrawal();

  return (
    <CashDialog
      trigger={trigger}
      title="Registrar saque"
      description="Dinheiro que saiu do saldo para fora dos investimentos."
    >
      {(close) => (
        <DatedForm
          amountLabel="Valor"
          pending={add.isPending}
          onSubmit={(day, amount) =>
            add.mutate({ withdrawal_date: day, amount }, { onSuccess: close })
          }
        />
      )}
    </CashDialog>
  );
}

const thresholdSchema = z.object({ threshold: amountField });

interface ThresholdDialogProps {
  trigger: ReactNode;
  threshold: DecimalString;
}

export function ThresholdDialog({ trigger, threshold }: ThresholdDialogProps) {
  return (
    <CashDialog
      trigger={trigger}
      title="Limite de saldo parado"
      description="Acima dele, o saldo aparece em Saúde dos dados e no alerta diário."
    >
      {(close) => <ThresholdForm threshold={threshold} onSaved={close} />}
    </CashDialog>
  );
}

function ThresholdForm({
  threshold,
  onSaved,
}: {
  threshold: DecimalString;
  onSaved: () => void;
}) {
  const update = useUpdateCashSettings();
  const values: z.input<typeof thresholdSchema> = { threshold: toDecimalInput(threshold) };
  const form = useForm({ resolver: zodResolver(thresholdSchema), values });
  const { errors } = form.formState;
  const submit = form.handleSubmit(({ threshold: next }) =>
    update.mutate({ alert_threshold: next }, { onSuccess: onSaved }),
  );

  return (
    <form onSubmit={(event) => void submit(event)}>
      <Field data-invalid={Boolean(errors.threshold)}>
        <FieldLabel htmlFor="cash-threshold">Limite</FieldLabel>
        <Input id="cash-threshold" inputMode="decimal" {...form.register("threshold")} />
        <FieldError errors={[errors.threshold]} />
      </Field>
      <DialogFooter className="mt-6">
        <Button type="submit" disabled={update.isPending}>
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}
