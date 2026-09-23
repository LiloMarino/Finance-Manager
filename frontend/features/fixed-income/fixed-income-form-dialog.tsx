import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import {
  type FixedIncome,
  useSaveFixedIncome,
} from "@/features/fixed-income/use-fixed-income";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { type Indexer, indexerLabels, indexers, isIndexer } from "@/shared/lib/labels";
import { parseDecimalInput } from "@/types/decimal";

const rateLabels: Record<Indexer, string> = {
  cdi: "Percentual do CDI (110 = 110%)",
  selic: "Percentual da Selic (100 = 100%)",
  ipca: "Taxa real a.a. somada ao IPCA (%)",
  prefixed: "Taxa a.a. (%)",
};

const schema = z
  .object({
    label: z.string().trim().min(1, "Informe o nome do título."),
    indexer: z.custom<Indexer>((value) => typeof value === "string" && isIndexer(value)),
    rate: z.string(),
    maturity_date: z.string(),
    daily_liquidity: z.boolean(),
    tax_exempt: z.boolean(),
  })
  .transform((values, context) => {
    const rate = parseDecimalInput(values.rate);
    if (!rate) {
      context.addIssue({ code: "custom", path: ["rate"], message: "Taxa inválida." });
      return z.NEVER;
    }
    return { ...values, rate, maturity_date: values.maturity_date || null };
  });

interface FixedIncomeFormDialogProps {
  /** Título a editar; sem ele, o formulário cria um novo. */
  investment?: FixedIncome;
  trigger: ReactNode;
}

export function FixedIncomeFormDialog({ investment, trigger }: FixedIncomeFormDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {investment ? `Editar ${investment.label}` : "Novo título de renda fixa"}
          </DialogTitle>
        </DialogHeader>
        {open && (
          <FixedIncomeForm investment={investment} onSaved={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface FixedIncomeFormProps {
  investment?: FixedIncome;
  onSaved: () => void;
}

function FixedIncomeForm({ investment, onSaved }: FixedIncomeFormProps) {
  const save = useSaveFixedIncome(investment?.id);
  const form = useForm({
    resolver: zodResolver(schema),
    values: {
      label: investment?.label ?? "",
      indexer: investment?.indexer ?? "cdi",
      rate: investment?.rate ?? "",
      maturity_date: investment?.maturity_date ?? "",
      daily_liquidity: investment?.daily_liquidity ?? false,
      tax_exempt: investment?.tax_exempt ?? false,
    },
  });
  const { errors } = form.formState;
  const indexer = useWatch({ control: form.control, name: "indexer" });

  const submit = form.handleSubmit((body) => save.mutate(body, { onSuccess: onSaved }));

  return (
    <form onSubmit={(event) => void submit(event)}>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.label)}>
          <FieldLabel htmlFor="fixed-income-label">Nome</FieldLabel>
          <Input
            id="fixed-income-label"
            placeholder="CDB Banco X 2030"
            {...form.register("label")}
          />
          <FieldError errors={[errors.label]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="fixed-income-indexer">Indexador</FieldLabel>
          <Controller
            control={form.control}
            name="indexer"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(next) => {
                  if (isIndexer(next)) field.onChange(next);
                }}
              >
                <SelectTrigger id="fixed-income-indexer" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {indexers.map((item) => (
                    <SelectItem key={item} value={item}>
                      {indexerLabels[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field data-invalid={Boolean(errors.rate)}>
          <FieldLabel htmlFor="fixed-income-rate">{rateLabels[indexer]}</FieldLabel>
          <Input id="fixed-income-rate" inputMode="decimal" {...form.register("rate")} />
          <FieldError errors={[errors.rate]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="fixed-income-maturity">Vencimento (opcional)</FieldLabel>
          <Input
            id="fixed-income-maturity"
            type="date"
            {...form.register("maturity_date")}
          />
        </Field>
        <Controller
          control={form.control}
          name="daily_liquidity"
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox
                id="fixed-income-liquidity"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              <FieldLabel htmlFor="fixed-income-liquidity">Liquidez diária</FieldLabel>
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="tax_exempt"
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox
                id="fixed-income-exempt"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              <FieldLabel htmlFor="fixed-income-exempt">
                Isento de IR (LCI, LCA, CRI, CRA)
              </FieldLabel>
            </Field>
          )}
        />
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Button type="submit" disabled={save.isPending}>
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}
