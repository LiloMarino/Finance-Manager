import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import {
  type CorrelationQuery,
  type CorrelationWindow,
  benchmarkLabels,
  isBenchmark,
  isCorrelationWindow,
  windowLabels,
} from "@/features/correlation/correlation-params";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";

// O segundo lado é outro ticker ou uma referência
type SecondKind = "ticker" | "ibov" | "cdi";

const OTHER_TICKER: SecondKind = "ticker";

function isSecondKind(value: string): value is SecondKind {
  return value === "ticker" || isBenchmark(value);
}

const schema = z
  .object({
    first: z.string().trim().min(1, "Informe o ticker."),
    kind: z.custom<SecondKind>((value) => typeof value === "string" && isSecondKind(value)),
    second: z.string().trim(),
    window: z.custom<CorrelationWindow>(
      (value) => typeof value === "string" && isCorrelationWindow(value),
    ),
  })
  .transform((values, context): CorrelationQuery => {
    const first = values.first.toUpperCase();
    if (values.kind !== "ticker") {
      return { first, benchmark: values.kind, window: values.window };
    }
    if (!values.second) {
      context.addIssue({ code: "custom", path: ["second"], message: "Informe o ticker." });
      return z.NEVER;
    }
    return { first, second: values.second.toUpperCase(), window: values.window };
  });

interface CorrelationFormProps {
  query: CorrelationQuery | null;
  onSubmit: (query: CorrelationQuery) => void;
}

export function CorrelationForm({ query, onSubmit }: CorrelationFormProps) {
  const benchmark = query?.benchmark;
  const form = useForm({
    resolver: zodResolver(schema),
    values: {
      first: query?.first ?? "",
      kind: benchmark && isBenchmark(benchmark) ? benchmark : OTHER_TICKER,
      second: query?.second ?? "",
      window: query?.window ?? "1y",
    },
  });
  const { errors } = form.formState;
  const kind = useWatch({ control: form.control, name: "kind" });

  return (
    <form
      className="flex flex-wrap items-start gap-4"
      onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
    >
      <Field className="w-36" data-invalid={Boolean(errors.first)}>
        <FieldLabel htmlFor="correlation-first">Ticker</FieldLabel>
        <Input id="correlation-first" placeholder="ABCD11" {...form.register("first")} />
        <FieldError errors={[errors.first]} />
      </Field>
      <Field className="w-auto">
        <FieldLabel>Comparar com</FieldLabel>
        <Controller
          control={form.control}
          name="kind"
          render={({ field }) => (
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={0}
              value={field.value}
              onValueChange={(next) => {
                if (isSecondKind(next)) field.onChange(next);
              }}
            >
              <ToggleGroupItem value="ticker">Outro ticker</ToggleGroupItem>
              {Object.entries(benchmarkLabels).map(([value, label]) => (
                <ToggleGroupItem key={value} value={value}>
                  {label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      </Field>
      {kind === "ticker" && (
        <Field className="w-36" data-invalid={Boolean(errors.second)}>
          <FieldLabel htmlFor="correlation-second">Segundo ticker</FieldLabel>
          <Input id="correlation-second" placeholder="EFGH3" {...form.register("second")} />
          <FieldError errors={[errors.second]} />
        </Field>
      )}
      <Field className="w-36">
        <FieldLabel htmlFor="correlation-window">Janela</FieldLabel>
        <Controller
          control={form.control}
          name="window"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(next) => {
                if (isCorrelationWindow(next)) field.onChange(next);
              }}
            >
              <SelectTrigger id="correlation-window" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(windowLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>
      <Button type="submit" className="mt-6">
        Comparar
      </Button>
    </form>
  );
}
