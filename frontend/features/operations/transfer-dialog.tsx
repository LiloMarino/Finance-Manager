import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightLeft } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { AssetSelect } from "@/features/operations/asset-select";
import { useTransfer } from "@/features/operations/use-operations";
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
    from_asset_id: z.string().min(1, "Escolha a origem."),
    to_asset_id: z.string().min(1, "Escolha o destino."),
    operation_date: z.string().min(1, "Informe a data."),
    quantity: z.string(),
  })
  .transform((values, context) => {
    const quantity = parseDecimalInput(values.quantity);
    if (!quantity) {
      context.addIssue({
        code: "custom",
        path: ["quantity"],
        message: "Quantidade inválida.",
      });
      return z.NEVER;
    }
    return {
      from_asset_id: Number(values.from_asset_id),
      to_asset_id: Number(values.to_asset_id),
      operation_date: values.operation_date,
      quantity,
    };
  });

export function TransferDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ArrowRightLeft />
          Transferência
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transferência entre ativos</DialogTitle>
          <DialogDescription>
            Troca de ticker: a posição sai da origem e entra no destino com o preço
            médio que a origem tinha no dia.
          </DialogDescription>
        </DialogHeader>
        {open && <TransferForm onSaved={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function TransferForm({ onSaved }: { onSaved: () => void }) {
  const transfer = useTransfer();
  const form = useForm({
    resolver: zodResolver(schema),
    values: { from_asset_id: "", to_asset_id: "", operation_date: "", quantity: "" },
  });
  const { errors } = form.formState;

  const submit = form.handleSubmit((body) =>
    transfer.mutate(body, { onSuccess: onSaved }),
  );

  return (
    <form onSubmit={(event) => void submit(event)}>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.from_asset_id)}>
          <FieldLabel htmlFor="transfer-from">Origem</FieldLabel>
          <Controller
            control={form.control}
            name="from_asset_id"
            render={({ field }) => (
              <AssetSelect id="transfer-from" value={field.value} onChange={field.onChange} />
            )}
          />
          <FieldError errors={[errors.from_asset_id]} />
        </Field>
        <Field data-invalid={Boolean(errors.to_asset_id)}>
          <FieldLabel htmlFor="transfer-to">Destino</FieldLabel>
          <Controller
            control={form.control}
            name="to_asset_id"
            render={({ field }) => (
              <AssetSelect id="transfer-to" value={field.value} onChange={field.onChange} />
            )}
          />
          <FieldError errors={[errors.to_asset_id]} />
        </Field>
        <Field data-invalid={Boolean(errors.operation_date)}>
          <FieldLabel htmlFor="transfer-date">Data</FieldLabel>
          <Input id="transfer-date" type="date" {...form.register("operation_date")} />
          <FieldError errors={[errors.operation_date]} />
        </Field>
        <Field data-invalid={Boolean(errors.quantity)}>
          <FieldLabel htmlFor="transfer-quantity">Quantidade</FieldLabel>
          <Input id="transfer-quantity" inputMode="decimal" {...form.register("quantity")} />
          <FieldError errors={[errors.quantity]} />
        </Field>
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Button type="submit" disabled={transfer.isPending}>
          Transferir
        </Button>
      </DialogFooter>
    </form>
  );
}
