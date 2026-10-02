import { ListChecks } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useSetMembers } from "@/features/subportfolios/use-subportfolio-mutations";
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
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/shared/components/ui/field";
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
      <DialogContent>
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
      names={new Map(subportfolios.data.map((item) => [item.id, item.name]))}
      onSaved={onSaved}
    />
  );
}

interface MembersFormValues {
  asset_ids: number[];
  investment_ids: number[];
}

interface MembersFormProps {
  subportfolio: Subportfolio;
  assets: Asset[];
  investments: FixedIncome[];
  /** O nome de cada subcarteira, para o item que hoje está em outra. */
  names: Map<number, string>;
  onSaved: () => void;
}

function MembersForm({ subportfolio, assets, investments, names, onSaved }: MembersFormProps) {
  const save = useSetMembers(subportfolio);
  const form = useForm<MembersFormValues>({
    values: {
      asset_ids: subportfolio.assets.map((asset) => asset.id),
      investment_ids: subportfolio.fixed_income.map((investment) => investment.id),
    },
  });

  // O item que está em outra subcarteira sai dela ao ser marcado aqui
  const elsewhere = (subportfolioId: number | null) =>
    subportfolioId !== null && subportfolioId !== subportfolio.id
      ? names.get(subportfolioId)
      : undefined;

  const submit = form.handleSubmit((values) => save.mutate(values, { onSuccess: onSaved }));

  return (
    <form onSubmit={(event) => void submit(event)}>
      <FieldGroup className="max-h-[60vh] overflow-y-auto">
        <Controller
          control={form.control}
          name="asset_ids"
          render={({ field }) => (
            <MemberList
              legend="Ativos"
              empty="Nenhum ativo cadastrado."
              items={assets.map((asset) => ({
                id: asset.id,
                label: asset.ticker,
                elsewhere: elsewhere(asset.subportfolio_id),
              }))}
              selected={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          control={form.control}
          name="investment_ids"
          render={({ field }) => (
            <MemberList
              legend="Renda fixa"
              empty="Nenhum título cadastrado."
              items={investments.map((investment) => ({
                id: investment.id,
                label: investment.label,
                elsewhere: elsewhere(investment.subportfolio_id),
              }))}
              selected={field.value}
              onChange={field.onChange}
            />
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

interface MemberItem {
  id: number;
  label: string;
  elsewhere: string | undefined;
}

interface MemberListProps {
  legend: string;
  empty: string;
  items: MemberItem[];
  selected: number[];
  onChange: (selected: number[]) => void;
}

function MemberList({ legend, empty, items, selected, onChange }: MemberListProps) {
  return (
    <FieldSet>
      <FieldLegend variant="label">{legend}</FieldLegend>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">{empty}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => {
            const id = `member-${legend}-${item.id}`;
            return (
              <Field key={item.id} orientation="horizontal">
                <Checkbox
                  id={id}
                  checked={selected.includes(item.id)}
                  onCheckedChange={(checked) =>
                    onChange(
                      checked === true
                        ? [...selected, item.id]
                        : selected.filter((found) => found !== item.id),
                    )
                  }
                />
                <FieldLabel htmlFor={id}>
                  {item.label}
                  {item.elsewhere && (
                    <span className="text-muted-foreground text-xs">em {item.elsewhere}</span>
                  )}
                </FieldLabel>
              </Field>
            );
          })}
        </div>
      )}
    </FieldSet>
  );
}
