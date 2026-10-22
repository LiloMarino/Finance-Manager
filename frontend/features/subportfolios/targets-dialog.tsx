import { Target } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { type Targets, useSaveTargets, useTargets } from "@/features/rebalance/use-rebalance";
import {
  type TargetsDraft,
  targetsComplete,
  targetsDraft,
  targetsSum,
  toTargetsInput,
} from "@/features/subportfolios/targets-draft";
import { TargetsEditor } from "@/features/subportfolios/targets-editor";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { type Asset, useAssets } from "@/shared/hooks/use-assets";
import type { Subportfolio } from "@/shared/hooks/use-subportfolios";
import { getApiErrorMessage } from "@/shared/lib/api";

export function TargetsDialog({ subportfolio }: { subportfolio: Subportfolio }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Target />
        Metas
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Metas de {subportfolio.name}</DialogTitle>
        </DialogHeader>
        {open && <TargetsBody subportfolio={subportfolio} onSaved={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}

interface TargetsBodyProps {
  subportfolio: Subportfolio;
  onSaved: () => void;
}

/** Resolve as metas salvas e os ativos antes do formulário, que já nasce com eles. */
function TargetsBody({ subportfolio, onSaved }: TargetsBodyProps) {
  const targets = useTargets(subportfolio.id);
  const assets = useAssets();

  const error = targets.error ?? assets.error;
  if (error) return <span className="text-destructive">{getApiErrorMessage(error)}</span>;
  if (!targets.data || !assets.data) return <Skeleton className="h-64 w-full" />;
  return (
    <TargetsForm
      subportfolio={subportfolio}
      targets={targets.data}
      assets={assets.data}
      onSaved={onSaved}
    />
  );
}

interface TargetsFormValues {
  targets: TargetsDraft;
}

interface TargetsFormProps {
  subportfolio: Subportfolio;
  targets: Targets;
  assets: Asset[];
  onSaved: () => void;
}

function TargetsForm({ subportfolio, targets, assets, onSaved }: TargetsFormProps) {
  const save = useSaveTargets(subportfolio.id);
  const form = useForm<TargetsFormValues>({ values: { targets: targetsDraft(targets) } });
  const draft = useWatch({ control: form.control, name: "targets" });

  // Os ativos com meta são os da subcarteira, na ordem em que o servidor os lista
  const chosen = targets.assets.flatMap(
    (target) => assets.find((asset) => asset.id === target.asset_id) ?? [],
  );
  const hasFixedIncome = subportfolio.fixed_income.length > 0;
  const complete = targetsComplete(targetsSum(draft, chosen, hasFixedIncome));

  const submit = form.handleSubmit((values) =>
    save.mutate(toTargetsInput(values.targets, chosen, hasFixedIncome), { onSuccess: onSaved }),
  );

  return (
    <form className="flex min-h-0 flex-1 flex-col gap-5" onSubmit={(event) => void submit(event)}>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Controller
          control={form.control}
          name="targets"
          render={({ field }) => (
            <TargetsEditor
              targets={field.value}
              onChange={field.onChange}
              assets={chosen}
              hasFixedIncome={hasFixedIncome}
            />
          )}
        />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={save.isPending || !complete}>
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}
