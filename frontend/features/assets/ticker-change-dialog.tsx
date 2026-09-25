import { zodResolver } from "@hookform/resolvers/zod";
import { Replace } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { useChangeTicker } from "@/features/assets/use-asset-mutations";
import { type Asset, useAssets } from "@/shared/hooks/use-assets";
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

const schema = z.object({
  ticker: z.string().trim().min(1, "Informe o ticker novo."),
  effective_date: z.string().min(1, "Informe a data da troca."),
});

type TickerChangeValues = z.infer<typeof schema>;

export function TickerChangeDialog({ asset }: { asset: Asset }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Replace />
          Trocar ticker
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trocar o ticker de {asset.ticker}</DialogTitle>
          <DialogDescription>
            O ativo passa a se chamar pelo ticker novo a partir da data. Posição, preço
            médio e apuração não mudam; operações, fiscal e IRPF mostram o ticker vigente
            em cada data.
          </DialogDescription>
        </DialogHeader>
        {open && <TickerChangeForm asset={asset} onSaved={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}

interface TickerChangeFormProps {
  asset: Asset;
  onSaved: () => void;
}

function TickerChangeForm({ asset, onSaved }: TickerChangeFormProps) {
  const navigate = useNavigate();
  const assets = useAssets();
  const change = useChangeTicker(asset.id);
  const form = useForm<TickerChangeValues>({
    resolver: zodResolver(schema),
    values: { ticker: "", effective_date: "" },
  });
  const { errors } = form.formState;

  // Ticker novo que já é ativo: a troca junta os dois
  const typed = useWatch({ control: form.control, name: "ticker" }).trim().toUpperCase();
  const existing = assets.data?.find((item) => item.ticker === typed && item.id !== asset.id);

  const submit = form.handleSubmit((values) =>
    change.mutate(values, {
      onSuccess: (result) => {
        onSaved();
        if (result.id !== asset.id) {
          void navigate(`/assets/${result.id}`);
        }
      },
    }),
  );

  return (
    <form onSubmit={(event) => void submit(event)}>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.ticker)}>
          <FieldLabel htmlFor="ticker-change-ticker">Ticker novo</FieldLabel>
          <Input id="ticker-change-ticker" {...form.register("ticker")} />
          {existing && (
            <FieldDescription>
              {existing.ticker} já é um ativo: os dois viram um só, com as operações de{" "}
              {asset.ticker} antes da data e as de {existing.ticker} a partir dela.
            </FieldDescription>
          )}
          <FieldError errors={[errors.ticker]} />
        </Field>
        <Field data-invalid={Boolean(errors.effective_date)}>
          <FieldLabel htmlFor="ticker-change-date">Negociado com o ticker novo desde</FieldLabel>
          <Input id="ticker-change-date" type="date" {...form.register("effective_date")} />
          <FieldError errors={[errors.effective_date]} />
        </Field>
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Button type="submit" disabled={change.isPending}>
          Trocar ticker
        </Button>
      </DialogFooter>
    </form>
  );
}
