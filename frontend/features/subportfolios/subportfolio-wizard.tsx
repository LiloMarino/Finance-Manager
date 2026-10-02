import { type ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCreateSubportfolio } from "@/features/subportfolios/use-subportfolio-mutations";
import { type Identity, IdentityStep } from "@/features/subportfolios/wizard-identity-step";
import { type Members, MembersStep } from "@/features/subportfolios/wizard-members-step";
import { TargetsStep } from "@/features/subportfolios/wizard-targets-step";
import {
  type TargetsDraft,
  emptyTargets,
  targetsSum,
} from "@/features/subportfolios/wizard-targets";
import { SubportfolioMark } from "@/shared/components/subportfolio-mark";
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
import { parseDecimalInput, toDecimalString } from "@/types/decimal";

type Step = 1 | 2 | 3;

const stepTitles: Record<Step, string> = {
  1: "nome, ícone e cor",
  2: "itens",
  3: "metas",
};

const initialIdentity: Identity = { name: "", icon: "briefcase", color: "graphite" };

/** O botão e o assistente de três passos: identidade, itens e metas. */
export function SubportfolioWizard({ trigger }: { trigger: ReactElement }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-xl">
        {open && <WizardBody onClose={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}

/** Resolve os cadastros antes do assistente, que já nasce com todos eles. */
function WizardBody({ onClose }: { onClose: () => void }) {
  const assets = useAssets();
  const investments = useFixedIncomeList();
  const subportfolios = useSubportfolios();

  const error = assets.error ?? investments.error ?? subportfolios.error;
  if (error) return <span className="text-destructive">{getApiErrorMessage(error)}</span>;
  if (!assets.data || !investments.data || !subportfolios.data) {
    return <Skeleton className="h-96 w-full" />;
  }
  return (
    <WizardSteps
      assets={assets.data}
      investments={investments.data}
      subportfolios={subportfolios.data}
      onClose={onClose}
    />
  );
}

interface WizardStepsProps {
  assets: Asset[];
  investments: FixedIncome[];
  subportfolios: Subportfolio[];
  onClose: () => void;
}

/** As metas como o servidor as recebe: o que não foi digitado fica em zero. */
function toTargetsInput(targets: TargetsDraft, chosen: Asset[], hasFixedIncome: boolean) {
  const percent = (value: string) => parseDecimalInput(value) ?? toDecimalString("0");
  return {
    assets: chosen.map((asset) => ({
      asset_id: asset.id,
      target: percent(targets.assets[asset.id] ?? ""),
    })),
    fixed_income_target: percent(hasFixedIncome ? targets.fixedIncome : ""),
    max_item_deviation: percent(targets.maxItem),
    max_total_deviation: percent(targets.maxTotal),
  };
}

function WizardSteps({ assets, investments, subportfolios, onClose }: WizardStepsProps) {
  const [step, setStep] = useState<Step>(1);
  const [identity, setIdentity] = useState(initialIdentity);
  const [members, setMembers] = useState<Members>({ assetIds: [], investmentIds: [] });
  const [targets, setTargets] = useState<TargetsDraft>(emptyTargets);
  const create = useCreateSubportfolio();
  const navigate = useNavigate();

  const chosen = assets.filter((asset) => members.assetIds.includes(asset.id));
  const hasFixedIncome = members.investmentIds.length > 0;
  const name = identity.name.trim();
  const duplicate = subportfolios.some((item) => item.name.toLowerCase() === name.toLowerCase());
  const sum = targetsSum(targets, chosen, hasFixedIncome);

  // Sem item escolhido não há meta a definir: o passo dos itens já cria
  const lastStep: Step = chosen.length > 0 || hasFixedIncome ? 3 : 2;

  const submit = (withTargets: boolean) =>
    create.mutate(
      {
        identity: { name, icon: identity.icon, color: identity.color },
        members: { asset_ids: members.assetIds, investment_ids: members.investmentIds },
        targets: withTargets ? toTargetsInput(targets, chosen, hasFixedIncome) : null,
      },
      {
        onSuccess: (created) => {
          onClose();
          void navigate(`/subportfolios/${created.id}`);
        },
      },
    );

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          {step > 1 && <SubportfolioMark identity={identity} />}
          <div className="flex flex-col gap-0.5">
            <span className="text-caption text-muted-foreground">
              Passo {step} de 3 · {stepTitles[step]}
            </span>
            <DialogTitle>
              {step === 1
                ? "Nova subcarteira"
                : step === 2
                  ? `Itens de ${name}`
                  : `Metas de ${name}`}
            </DialogTitle>
          </div>
        </div>
      </DialogHeader>

      {step === 1 && <IdentityStep identity={identity} onChange={setIdentity} />}
      {step === 2 && (
        <MembersStep
          members={members}
          onChange={setMembers}
          assets={assets}
          investments={investments}
          subportfolios={subportfolios}
        />
      )}
      {step === 3 && (
        <TargetsStep
          targets={targets}
          onChange={setTargets}
          assets={chosen}
          hasFixedIncome={hasFixedIncome}
        />
      )}
      {step === 1 && duplicate && (
        <span className="text-destructive text-caption">Já existe a subcarteira {name}.</span>
      )}

      <DialogFooter className="sm:justify-between">
        {step === 1 ? (
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        ) : (
          <Button type="button" variant="ghost" onClick={() => setStep(step === 3 ? 2 : 1)}>
            Voltar
          </Button>
        )}
        <div className="flex gap-2">
          {step === 3 && (
            <Button
              type="button"
              variant="outline"
              disabled={create.isPending}
              onClick={() => submit(false)}
            >
              Definir depois
            </Button>
          )}
          {step < lastStep ? (
            <Button
              type="button"
              disabled={step === 1 && (name === "" || duplicate)}
              onClick={() => setStep(step === 1 ? 2 : 3)}
            >
              Próximo: {step === 1 ? "itens" : "metas"}
            </Button>
          ) : (
            <Button
              type="button"
              disabled={create.isPending || (step === 3 && Math.abs(sum - 100) >= 0.005)}
              onClick={() => submit(step === 3)}
            >
              Criar subcarteira
            </Button>
          )}
        </div>
      </DialogFooter>
    </>
  );
}
