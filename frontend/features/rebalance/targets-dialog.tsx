import { zodResolver } from "@hookform/resolvers/zod";
import { Target } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  type Targets,
  useSaveTargets,
  useTargets,
} from "@/features/rebalance/use-rebalance";
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
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";
import { parseDecimalInput, toDecimalInput } from "@/types/decimal";

const percent = z.string().transform((value, context) => {
  const parsed = parseDecimalInput(value);
  if (!parsed) {
    context.addIssue({ code: "custom", message: "Percentual inválido." });
    return z.NEVER;
  }
  return parsed;
});

const schema = z.object({
  assets: z.array(z.object({ asset_id: z.number(), ticker: z.string(), target: percent })),
  fixed_income_target: percent,
  max_item_deviation: percent,
  max_total_deviation: percent,
});

export function TargetsDialog({ subportfolioId }: { subportfolioId: number }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Target />
          Editar metas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Metas da subcarteira</DialogTitle>
          <DialogDescription>
            Em percentual da subcarteira; as metas somam 100%. Os limites dizem quando
            a subcarteira aparece em Saúde dos dados e no alerta diário.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <TargetsLoader subportfolioId={subportfolioId} onSaved={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface LoaderProps {
  subportfolioId: number;
  onSaved: () => void;
}

// O formulário nasce com as metas já carregadas
function TargetsLoader({ subportfolioId, onSaved }: LoaderProps) {
  const { data, isPending, error } = useTargets(subportfolioId);
  if (isPending) return <Skeleton className="h-48 w-full" />;
  if (error) return <span className="text-destructive">{getApiErrorMessage(error)}</span>;
  return <TargetsForm subportfolioId={subportfolioId} targets={data} onSaved={onSaved} />;
}

interface FormProps {
  subportfolioId: number;
  targets: Targets;
  onSaved: () => void;
}

function TargetsForm({ subportfolioId, targets, onSaved }: FormProps) {
  const save = useSaveTargets(subportfolioId);
  const values: z.input<typeof schema> = {
    assets: targets.assets.map((asset) => ({
      asset_id: asset.asset_id,
      ticker: asset.ticker,
      target: toDecimalInput(asset.target),
    })),
    fixed_income_target: toDecimalInput(targets.fixed_income_target),
    max_item_deviation: toDecimalInput(targets.max_item_deviation),
    max_total_deviation: toDecimalInput(targets.max_total_deviation),
  };
  const form = useForm({ resolver: zodResolver(schema), values });
  const { errors } = form.formState;

  const submit = form.handleSubmit((body) =>
    save.mutate(
      {
        assets: body.assets.map(({ asset_id, target }) => ({ asset_id, target })),
        fixed_income_target: body.fixed_income_target,
        max_item_deviation: body.max_item_deviation,
        max_total_deviation: body.max_total_deviation,
      },
      { onSuccess: onSaved },
    ),
  );

  return (
    <form onSubmit={(event) => void submit(event)}>
      <FieldGroup>
        {/* Metas por item */}
        {targets.assets.map((asset, index) => (
          <Field key={asset.asset_id} data-invalid={Boolean(errors.assets?.[index]?.target)}>
            <FieldLabel htmlFor={`target-${asset.asset_id}`}>{asset.ticker} (%)</FieldLabel>
            <Input
              id={`target-${asset.asset_id}`}
              inputMode="decimal"
              {...form.register(`assets.${index}.target`)}
            />
            <FieldError errors={[errors.assets?.[index]?.target]} />
          </Field>
        ))}
        <Field data-invalid={Boolean(errors.fixed_income_target)}>
          <FieldLabel htmlFor="target-fixed-income">Renda fixa (%)</FieldLabel>
          <Input
            id="target-fixed-income"
            inputMode="decimal"
            {...form.register("fixed_income_target")}
          />
          <FieldError errors={[errors.fixed_income_target]} />
        </Field>

        {/* Limites do alerta */}
        <Field data-invalid={Boolean(errors.max_item_deviation)}>
          <FieldLabel htmlFor="max-item">Desvio máximo por item (p.p.)</FieldLabel>
          <Input id="max-item" inputMode="decimal" {...form.register("max_item_deviation")} />
          <FieldError errors={[errors.max_item_deviation]} />
        </Field>
        <Field data-invalid={Boolean(errors.max_total_deviation)}>
          <FieldLabel htmlFor="max-total">Desbalanceamento máximo (p.p.)</FieldLabel>
          <Input
            id="max-total"
            inputMode="decimal"
            {...form.register("max_total_deviation")}
          />
          <FieldError errors={[errors.max_total_deviation]} />
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
