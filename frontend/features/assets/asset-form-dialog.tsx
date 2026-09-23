import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { useSaveAsset } from "@/features/assets/use-asset-mutations";
import type { Asset } from "@/shared/hooks/use-assets";
import { AssetClassSelect } from "@/shared/components/asset-class-select";
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
import { type AssetClass, isAssetClass } from "@/shared/lib/labels";

const schema = z.object({
  ticker: z.string().trim().min(1, "Informe o ticker."),
  asset_class: z.custom<AssetClass>(
    (value) => typeof value === "string" && isAssetClass(value),
    "Escolha a classe.",
  ),
  cnpj: z.string(),
  sector: z.string(),
});

type AssetFormValues = z.infer<typeof schema>;

interface AssetFormDialogProps {
  /** Ativo a editar; sem ele, o formulário cria um novo. */
  asset?: Asset;
  trigger: ReactNode;
}

export function AssetFormDialog({ asset, trigger }: AssetFormDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{asset ? `Editar ${asset.ticker}` : "Novo ativo"}</DialogTitle>
        </DialogHeader>
        {open && <AssetForm asset={asset} onSaved={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}

interface AssetFormProps {
  asset?: Asset;
  onSaved: () => void;
}

function AssetForm({ asset, onSaved }: AssetFormProps) {
  const save = useSaveAsset(asset?.id);
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(schema),
    values: {
      ticker: asset?.ticker ?? "",
      asset_class: asset?.asset_class ?? "stock",
      cnpj: asset?.cnpj ?? "",
      sector: asset?.sector ?? "",
    },
  });
  const { errors } = form.formState;

  const submit = form.handleSubmit((values) =>
    save.mutate(
      { ...values, cnpj: values.cnpj || null, sector: values.sector || null },
      { onSuccess: onSaved },
    ),
  );

  return (
    <form onSubmit={(event) => void submit(event)}>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.ticker)}>
          <FieldLabel htmlFor="asset-ticker">Ticker</FieldLabel>
          <Input id="asset-ticker" {...form.register("ticker")} />
          <FieldError errors={[errors.ticker]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="asset-class">Classe</FieldLabel>
          <Controller
            control={form.control}
            name="asset_class"
            render={({ field }) => (
              <AssetClassSelect id="asset-class" value={field.value} onChange={field.onChange} />
            )}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="asset-cnpj">CNPJ</FieldLabel>
          <Input id="asset-cnpj" {...form.register("cnpj")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="asset-sector">Setor</FieldLabel>
          <Input id="asset-sector" {...form.register("sector")} />
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
