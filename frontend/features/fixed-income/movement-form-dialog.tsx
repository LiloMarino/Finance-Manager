import { zodResolver } from "@hookform/resolvers/zod";
import { CornerDownLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import {
  type MovementType,
  isMovementType,
  movementTypeLabels,
  movementTypes,
} from "@/features/fixed-income/labels";
import { useAddMovement } from "@/features/fixed-income/use-fixed-income";
import { MetricHint } from "@/shared/components/metric-hint";
import { MoneyInput } from "@/shared/components/money-input";
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
import { Kbd } from "@/shared/components/ui/kbd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { maskMoney, withMask } from "@/shared/lib/mask";
import { parseDecimalInput } from "@/types/decimal";

const schema = z
  .object({
    movement_type: z.custom<MovementType>(
      (value) => typeof value === "string" && isMovementType(value),
    ),
    movement_date: z.string().min(1, "Informe a data."),
    amount: z.string(),
    net: z.boolean(),
  })
  .transform((values, context) => {
    const amount = parseDecimalInput(values.amount);
    if (!amount) {
      context.addIssue({ code: "custom", path: ["amount"], message: "Valor inválido." });
      return z.NEVER;
    }
    return { ...values, amount };
  });

const netHint =
  "O banco retém o IOF e o IR no resgate: cai na conta o líquido. Marcado, o app acha o bruto que deixa esse líquido e grava o bruto.";

export function MovementFormDialog({ investmentId }: { investmentId: number }) {
  const [open, setOpen] = useState(false);
  const [createMore, setCreateMore] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus />
        Nova movimentação
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova movimentação</DialogTitle>
        </DialogHeader>
        {open && (
          <MovementForm
            investmentId={investmentId}
            createMore={createMore}
            onCreateMoreChange={setCreateMore}
            onSaved={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface MovementFormProps {
  investmentId: number;
  createMore: boolean;
  onCreateMoreChange: (createMore: boolean) => void;
  onSaved: () => void;
}

function MovementForm({
  investmentId,
  createMore,
  onCreateMoreChange,
  onSaved,
}: MovementFormProps) {
  const add = useAddMovement(investmentId);
  const defaultValues: z.input<typeof schema> = {
    movement_type: "application",
    movement_date: "",
    amount: "",
    net: true,
  };
  const form = useForm({ resolver: zodResolver(schema), defaultValues });
  const { errors } = form.formState;
  const [movementType, net] = useWatch({ control: form.control, name: ["movement_type", "net"] });
  const redemption = movementType === "redemption";

  const submit = form.handleSubmit((body) =>
    add.mutate(body, {
      onSuccess: () => {
        if (!createMore) {
          onSaved();
          return;
        }
        // A próxima movimentação herda o tipo e a data desta: só o valor recomeça
        form.reset({ ...form.getValues(), amount: "" });
        form.setFocus("amount");
      },
    }),
  );

  return (
    <form
      onSubmit={(event) => void submit(event)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          event.currentTarget.requestSubmit();
        }
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="movement-type">Tipo</FieldLabel>
          <Controller
            control={form.control}
            name="movement_type"
            render={({ field }) => (
              <Select
                items={movementTypeLabels}
                value={field.value}
                onValueChange={(next) => {
                  if (next !== null && isMovementType(next)) field.onChange(next);
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
          <FieldLabel htmlFor="movement-amount">
            {redemption && net ? "Valor líquido" : "Valor bruto"}
          </FieldLabel>
          <MoneyInput id="movement-amount" {...withMask(form.register("amount"), maskMoney)} />
          <FieldError errors={[errors.amount]} />
        </Field>
        {redemption && (
          <Controller
            control={form.control}
            name="net"
            render={({ field }) => (
              <Field orientation="horizontal">
                <Checkbox
                  id="movement-net"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                <FieldLabel htmlFor="movement-net">
                  <MetricHint hint={netHint}>É o valor que caiu na conta</MetricHint>
                </FieldLabel>
              </Field>
            )}
          />
        )}
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Field orientation="horizontal" className="sm:mr-auto sm:w-auto">
          <Checkbox
            id="movement-create-more"
            checked={createMore}
            onCheckedChange={(checked) => onCreateMoreChange(checked === true)}
          />
          <FieldLabel htmlFor="movement-create-more">Adicionar outra</FieldLabel>
        </Field>
        <Button type="submit" disabled={add.isPending}>
          Salvar
          <Kbd variant="tinted" aria-label="Ctrl Enter">
            Ctrl
            <CornerDownLeft />
          </Kbd>
        </Button>
      </DialogFooter>
    </form>
  );
}
