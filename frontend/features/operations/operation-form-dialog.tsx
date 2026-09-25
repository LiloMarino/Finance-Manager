import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { AssetSelect } from "@/shared/components/asset-select";
import { type Operation, useSaveOperation } from "@/features/operations/use-operations";
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
import {
  type OperationType,
  isOperationType,
  operationTypeLabels,
} from "@/shared/lib/labels";
import { parseDecimalInput, toDecimalString } from "@/types/decimal";

const operationTypes: OperationType[] = ["buy", "sell", "bonus", "split", "reverse_split"];
const pricedTypes: OperationType[] = ["buy", "sell"];

const quantityLabels: Partial<Record<OperationType, string>> = {
  bonus: "Ações recebidas",
  split: "Ações recebidas",
  reverse_split: "Fator (10:1 = 0,1)",
};

const schema = z
  .object({
    asset_id: z.string().min(1, "Escolha o ativo."),
    operation_date: z.string().min(1, "Informe a data."),
    operation_type: z.custom<OperationType>(
      (value) => typeof value === "string" && isOperationType(value),
    ),
    quantity: z.string(),
    unit_price: z.string(),
  })
  .transform((values, context) => {
    const quantity = parseDecimalInput(values.quantity);
    if (!quantity) {
      context.addIssue({
        code: "custom",
        path: ["quantity"],
        message: "Quantidade inválida.",
      });
    }
    // Evento corporativo não tem preço: vai zero, como a CHECK exige
    const unitPrice = pricedTypes.includes(values.operation_type)
      ? parseDecimalInput(values.unit_price)
      : toDecimalString("0");
    if (!unitPrice) {
      context.addIssue({
        code: "custom",
        path: ["unit_price"],
        message: "Preço inválido.",
      });
    }
    if (!quantity || !unitPrice) {
      return z.NEVER;
    }
    return {
      asset_id: Number(values.asset_id),
      operation_date: values.operation_date,
      operation_type: values.operation_type,
      quantity,
      unit_price: unitPrice,
    };
  });

interface OperationFormDialogProps {
  /** Operação a editar; sem ela, o formulário cria uma nova. */
  operation?: Operation;
  trigger: ReactNode;
}

export function OperationFormDialog({ operation, trigger }: OperationFormDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{operation ? "Editar operação" : "Nova operação"}</DialogTitle>
        </DialogHeader>
        {open && <OperationForm operation={operation} onSaved={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}

interface OperationFormProps {
  operation?: Operation;
  onSaved: () => void;
}

function OperationForm({ operation, onSaved }: OperationFormProps) {
  const save = useSaveOperation(operation?.id);
  const form = useForm({
    resolver: zodResolver(schema),
    values: {
      asset_id: operation ? String(operation.asset_id) : "",
      operation_date: operation?.operation_date ?? "",
      operation_type: operation?.operation_type ?? "buy",
      quantity: operation?.quantity ?? "",
      unit_price: operation?.unit_price ?? "",
    },
  });
  const { errors } = form.formState;
  const operationType = useWatch({ control: form.control, name: "operation_type" });

  const submit = form.handleSubmit((body) => save.mutate(body, { onSuccess: onSaved }));

  return (
    <form onSubmit={(event) => void submit(event)}>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.asset_id)}>
          <FieldLabel htmlFor="operation-asset">Ativo</FieldLabel>
          <Controller
            control={form.control}
            name="asset_id"
            render={({ field }) => (
              <AssetSelect
                id="operation-asset"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <FieldError errors={[errors.asset_id]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="operation-type">Tipo</FieldLabel>
          <Controller
            control={form.control}
            name="operation_type"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(next) => {
                  if (isOperationType(next)) field.onChange(next);
                }}
              >
                <SelectTrigger id="operation-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {operationTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field data-invalid={Boolean(errors.operation_date)}>
          <FieldLabel htmlFor="operation-date">Data</FieldLabel>
          <Input id="operation-date" type="date" {...form.register("operation_date")} />
          <FieldError errors={[errors.operation_date]} />
        </Field>
        <Field data-invalid={Boolean(errors.quantity)}>
          <FieldLabel htmlFor="operation-quantity">
            {quantityLabels[operationType] ?? "Quantidade"}
          </FieldLabel>
          <Input
            id="operation-quantity"
            inputMode="decimal"
            {...form.register("quantity")}
          />
          <FieldError errors={[errors.quantity]} />
        </Field>
        {pricedTypes.includes(operationType) && (
          <Field data-invalid={Boolean(errors.unit_price)}>
            <FieldLabel htmlFor="operation-price">Preço unitário</FieldLabel>
            <Input
              id="operation-price"
              inputMode="decimal"
              {...form.register("unit_price")}
            />
            <FieldError errors={[errors.unit_price]} />
          </Field>
        )}
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Button type="submit" disabled={save.isPending}>
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}
