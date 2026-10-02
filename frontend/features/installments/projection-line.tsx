import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import { ProjectionForm } from "@/shared/components/projection-form";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import type { CurrentRates } from "@/shared/hooks/use-current-rates";
import { isProjectionEdited, projectionDraft, writeProjection } from "@/shared/lib/projection";
import { type DecimalString, formatRate } from "@/types/decimal";

function rate(value: DecimalString | null): string {
  return value ? `${formatRate(value)}%` : "—";
}

/** A projeção das taxas numa linha, editada num popover. Mora na URL, como nas
outras ferramentas. */
export function ProjectionLine({ current }: { current: CurrentRates }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const draft = projectionDraft(searchParams, current);

  return (
    <div className="bg-muted text-caption text-ink-2 flex items-center justify-between gap-3 rounded-md px-3 py-1.5">
      <span>
        Projeção: CDI <b className="text-foreground tabular-nums">{rate(draft.cdi)}</b> · IPCA{" "}
        <b className="text-foreground tabular-nums">{rate(draft.ipca)}</b> · Selic{" "}
        <b className="text-foreground tabular-nums">{rate(draft.selic)}</b> ao ano
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button variant="ghost" size="sm" />}>Alterar</PopoverTrigger>
        {/* O popover vive num portal, mas o submit do React sobe pela árvore de
        componentes até o formulário da simulação: o da projeção termina aqui */}
        <PopoverContent
          align="end"
          className="w-xl p-4"
          onSubmit={(event) => event.stopPropagation()}
        >
          <ProjectionForm
            current={current}
            draft={draft}
            edited={isProjectionEdited(searchParams)}
            onApply={(next) => {
              setSearchParams((params) => writeProjection(params, next, current));
              setOpen(false);
            }}
            onReset={() => {
              setSearchParams((params) => writeProjection(params, null, current));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
