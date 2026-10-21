import { ListChecks } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { type Members, MembersPicker } from "@/features/subportfolios/members-picker";
import { useSetMembers } from "@/features/subportfolios/use-subportfolio-mutations";
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
import { type FixedIncome, useFixedIncomeList } from "@/shared/hooks/use-fixed-income-list";
import { type Subportfolio, useSubportfolios } from "@/shared/hooks/use-subportfolios";
import { getApiErrorMessage } from "@/shared/lib/api";

export function MembersDialog({ subportfolio }: { subportfolio: Subportfolio }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <ListChecks />
        Itens
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Ativos e títulos de {subportfolio.name}</DialogTitle>
        </DialogHeader>
        {open && <MembersBody subportfolio={subportfolio} onSaved={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}

interface MembersBodyProps {
  subportfolio: Subportfolio;
  onSaved: () => void;
}

/** Resolve os cadastros antes do formulário, que já nasce com todos eles. */
function MembersBody({ subportfolio, onSaved }: MembersBodyProps) {
  const assets = useAssets();
  const investments = useFixedIncomeList();
  const subportfolios = useSubportfolios();

  const error = assets.error ?? investments.error ?? subportfolios.error;
  if (error) return <span className="text-destructive">{getApiErrorMessage(error)}</span>;
  if (!assets.data || !investments.data || !subportfolios.data) {
    return <Skeleton className="h-64 w-full" />;
  }
  return (
    <MembersForm
      subportfolio={subportfolio}
      assets={assets.data}
      investments={investments.data}
      subportfolios={subportfolios.data}
      onSaved={onSaved}
    />
  );
}

interface MembersFormValues {
  members: Members;
}

interface MembersFormProps {
  subportfolio: Subportfolio;
  assets: Asset[];
  investments: FixedIncome[];
  subportfolios: Subportfolio[];
  onSaved: () => void;
}

function MembersForm({
  subportfolio,
  assets,
  investments,
  subportfolios,
  onSaved,
}: MembersFormProps) {
  const save = useSetMembers(subportfolio);
  const form = useForm<MembersFormValues>({
    values: {
      members: {
        asset_ids: subportfolio.assets.map((asset) => asset.id),
        investment_ids: subportfolio.fixed_income.map((investment) => investment.id),
      },
    },
  });

  const submit = form.handleSubmit(({ members }) => save.mutate(members, { onSuccess: onSaved }));

  return (
    <form className="flex min-h-0 flex-1 flex-col gap-5" onSubmit={(event) => void submit(event)}>
      <Controller
        control={form.control}
        name="members"
        render={({ field }) => (
          <MembersPicker
            members={field.value}
            onChange={field.onChange}
            assets={assets}
            investments={investments}
            subportfolios={subportfolios}
            subportfolioId={subportfolio.id}
          />
        )}
      />
      <DialogFooter>
        <Button type="submit" disabled={save.isPending}>
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}
