import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import {
  type SegmentDraft,
  useCreateClassification,
} from "@/features/assets/use-classification";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useSectors } from "@/shared/hooks/use-sectors";

const schema = z
  .object({
    sectorId: z.number().nullable(),
    sectorName: z.string().trim(),
    segmentName: z.string().trim().min(1, "Informe o nome do segmento."),
  })
  .refine((values) => values.sectorId !== null || values.sectorName !== "", {
    message: "Informe o nome do setor.",
    path: ["sectorName"],
  });

interface SegmentCreateDialogProps {
  /** O rascunho do segmento a criar; nulo é o diálogo fechado. */
  draft: SegmentDraft | null;
  onClose: () => void;
  onCreated: (segmentId: number) => void;
}

/** Cria o segmento, num setor que já existe ou num novo, e devolve o id dele. */
export function SegmentCreateDialog({ draft, onClose, onCreated }: SegmentCreateDialogProps) {
  return (
    <Dialog open={draft !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo segmento</DialogTitle>
        </DialogHeader>
        {draft && (
          <SegmentForm
            draft={draft}
            onCreated={(segmentId) => {
              onCreated(segmentId);
              onClose();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface SegmentFormProps {
  draft: SegmentDraft;
  onCreated: (segmentId: number) => void;
}

function SegmentForm({ draft, onCreated }: SegmentFormProps) {
  const create = useCreateClassification();
  const { data: sectors = [] } = useSectors();
  const form = useForm<SegmentDraft>({ resolver: zodResolver(schema), values: draft });
  const sectorId = useWatch({ control: form.control, name: "sectorId" });
  const { errors } = form.formState;
  // Nulo é um setor novo, com o nome digitado
  const sectorItems = [
    { value: null, label: "Novo setor" },
    ...sectors.map((sector) => ({ value: sector.id, label: sector.name })),
  ];

  const submit = form.handleSubmit((values) =>
    create.mutate(values, { onSuccess: (segment) => onCreated(segment.id) }),
  );

  return (
    <form onSubmit={(event) => void submit(event)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="segment-create-sector">Setor</FieldLabel>
          <Controller
            control={form.control}
            name="sectorId"
            render={({ field }) => (
              <Select items={sectorItems} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="segment-create-sector" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sectorItems.map((item) => (
                    <SelectItem key={item.label} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        {sectorId === null && (
          <Field data-invalid={Boolean(errors.sectorName)}>
            <FieldLabel htmlFor="segment-create-sector-name">Nome do setor</FieldLabel>
            <Input id="segment-create-sector-name" {...form.register("sectorName")} />
            <FieldError errors={[errors.sectorName]} />
          </Field>
        )}
        <Field data-invalid={Boolean(errors.segmentName)}>
          <FieldLabel htmlFor="segment-create-name">Nome do segmento</FieldLabel>
          <Input id="segment-create-name" {...form.register("segmentName")} />
          <FieldError errors={[errors.segmentName]} />
        </Field>
      </FieldGroup>
      <DialogFooter className="mt-6">
        <Button type="submit" disabled={create.isPending}>
          Criar
        </Button>
      </DialogFooter>
    </form>
  );
}
