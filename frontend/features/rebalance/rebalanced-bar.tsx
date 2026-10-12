import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useMarkRebalanced } from "@/features/subportfolios/use-subportfolio-mutations";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
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
import type { Subportfolio } from "@/shared/hooks/use-subportfolios";
import { formatDate, formatDaysAgo } from "@/shared/lib/format";
import { isoDate } from "@/shared/lib/period";

const schema = z.object({ rebalanced_on: z.string().min(1, "Informe a data.") });

function RebalancedForm({
  subportfolio,
  onSaved,
}: {
  subportfolio: Subportfolio;
  onSaved: () => void;
}) {
  const mark = useMarkRebalanced(subportfolio);
  const today = isoDate(new Date());
  const form = useForm({ resolver: zodResolver(schema), values: { rebalanced_on: today } });
  const { errors } = form.formState;
  const submit = form.handleSubmit((values) => mark.mutate(values, { onSuccess: onSaved }));

  return (
    <form onSubmit={(event) => void submit(event)}>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.rebalanced_on)}>
          <FieldLabel htmlFor="rebalanced-on">Data</FieldLabel>
          <Input id="rebalanced-on" type="date" max={today} {...form.register("rebalanced_on")} />
          <FieldError errors={[errors.rebalanced_on]} />
        </Field>
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Button type="submit" disabled={mark.isPending}>
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}

/** Quando a subcarteira foi rebalanceada pela última vez e o botão que registra um
rebalanceamento novo. */
export function RebalancedBar({ subportfolio }: { subportfolio: Subportfolio }) {
  const [open, setOpen] = useState(false);
  const day = subportfolio.rebalanced_on;

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-ink-2">
          {day ? (
            <>
              Último rebalanceamento em {formatDate(day)},{" "}
              <span className="text-muted-foreground">{formatDaysAgo(day)}</span>
            </>
          ) : (
            "Nenhum rebalanceamento marcado ainda."
          )}
        </span>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button variant="outline" size="sm">
                <CalendarCheck />
                Marquei como rebalanceado
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Marquei como rebalanceado</DialogTitle>
              <DialogDescription>
                O dia em que você fez as compras e vendas do rebalanceamento. O card da subcarteira
                passa a mostrar há quanto tempo foi.
              </DialogDescription>
            </DialogHeader>
            {open && <RebalancedForm subportfolio={subportfolio} onSaved={() => setOpen(false)} />}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
