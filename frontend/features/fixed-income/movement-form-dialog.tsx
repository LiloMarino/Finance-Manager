import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import {
  type MovementType,
  isMovementType,
  movementTypeLabels,
  movementTypes,
} from "@/features/fixed-income/labels";
import { useAddMovement } from "@/features/fixed-income/use-fixed-income";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { parseDecimalInput } from "@/types/decimal";

const schema = z
  .object({
    movement_type: z.custom<MovementType>(
      (value) => typeof value === "string" && isMovementType(value),
    ),
    movement_date: z.string().min(1, "Informe a data."),
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

export function MovementFormDialog({ investmentId }: { investmentId: number }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Nova movimentação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova movimentação</DialogTitle>
        </DialogHeader>
        {open && (
          <MovementForm investmentId={investmentId} onSaved={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface MovementFormProps {
  investmentId: number;
  onSaved: () => void;
}

function MovementForm({ investmentId, onSaved }: MovementFormProps) {
  const add = useAddMovement(investmentId);
  const defaultValues: z.input<typeof schema> = {
    movement_type: "application",
    movement_date: "",
    amount: "",
  };
  const form = useForm({ resolver: zodResolver(schema), defaultValues });
  const { errors } = form.formState;

  const submit = form.handleSubmit((body) => add.mutate(body, { onSuccess: onSaved }));

  return (
    <form onSubmit={(event) => void submit(event)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="movement-type">Tipo</FieldLabel>
          <Controller
            control={form.control}
            name="movement_type"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(next) => {
                  if (isMovementType(next)) field.onChange(next);
                }}
              >
                <SelectTrigger id="movement-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {movementTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {movementTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field data-invalid={Boolean(errors.movement_date)}>
          <FieldLabel htmlFor="movement-date">Data</FieldLabel>
          <Input id="movement-date" type="date" {...form.register("movement_date")} />
          <FieldError errors={[errors.movement_date]} />
        </Field>
        <Field data-invalid={Boolean(errors.amount)}>
          <FieldLabel htmlFor="movement-amount">Valor bruto</FieldLabel>
          <Input id="movement-amount" inputMode="decimal" {...form.register("amount")} />
          <FieldError errors={[errors.amount]} />
        </Field>
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Button type="submit" disabled={add.isPending}>
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}
