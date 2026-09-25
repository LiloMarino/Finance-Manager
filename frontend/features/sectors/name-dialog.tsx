import { zodResolver } from "@hookform/resolvers/zod";
import type { UseMutationResult } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

const schema = z.object({ name: z.string().trim().min(1, "Informe o nome.") });

interface NameDialogProps {
  title: string;
  trigger: ReactNode;
  /** Nome atual, na renomeação; vazio, na criação. */
  initialName?: string;
  save: UseMutationResult<unknown, Error, string>;
}

/** Diálogo de um campo só, para criar ou renomear setor e segmento. */
export function NameDialog({ title, trigger, initialName = "", save }: NameDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {open && (
          <NameForm initialName={initialName} save={save} onSaved={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface NameFormProps {
  initialName: string;
  save: UseMutationResult<unknown, Error, string>;
  onSaved: () => void;
}

function NameForm({ initialName, save, onSaved }: NameFormProps) {
  const form = useForm({ resolver: zodResolver(schema), values: { name: initialName } });
  const { errors } = form.formState;

  const submit = form.handleSubmit(({ name }) => save.mutate(name, { onSuccess: onSaved }));

  return (
    <form onSubmit={(event) => void submit(event)}>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="name-dialog-name">Nome</FieldLabel>
          <Input id="name-dialog-name" {...form.register("name")} />
          <FieldError errors={[errors.name]} />
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
