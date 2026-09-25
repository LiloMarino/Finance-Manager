import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import {
  type Benchmark,
  type CorrelationState,
  type CorrelationWindow,
  MAX_SYMBOLS,
  benchmarks,
  isBenchmark,
  isCorrelationWindow,
  windowLabels,
} from "@/features/correlation/correlation-params";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";

// Vírgula, ponto e vírgula e espaço separam os tickers digitados
const SEPARATOR = /[\s,;]+/;

const schema = z
  .object({
    tickers: z.string(),
    benchmarks: z.array(
      z.custom<Benchmark>((value) => typeof value === "string" && isBenchmark(value)),
    ),
    window: z.custom<CorrelationWindow>(
      (value) => typeof value === "string" && isCorrelationWindow(value),
    ),
  })
  .transform((values, context) => {
    const tickers = values.tickers
      .split(SEPARATOR)
      .map((ticker) => ticker.trim().toUpperCase())
      .filter(Boolean);
    const symbols = [...new Set([...tickers, ...values.benchmarks])];
    if (symbols.length < 2 || symbols.length > MAX_SYMBOLS) {
      context.addIssue({
        code: "custom",
        path: ["tickers"],
        message: `Escolha de 2 a ${MAX_SYMBOLS} itens, contando o IBOV e o CDI.`,
      });
      return z.NEVER;
    }
    return { symbols, window: values.window };
  });

interface CorrelationFormProps {
  state: CorrelationState;
  onSubmit: (symbols: string[], window: CorrelationWindow) => void;
}

export function CorrelationForm({ state, onSubmit }: CorrelationFormProps) {
  const form = useForm({
    resolver: zodResolver(schema),
    values: {
      tickers: state.symbols.filter((symbol) => !isBenchmark(symbol)).join(", "),
      benchmarks: state.symbols.filter(isBenchmark),
      window: state.window,
    },
  });
  const { errors } = form.formState;

  return (
    <form
      className="flex flex-wrap items-start gap-4"
      onSubmit={(event) =>
        void form.handleSubmit(({ symbols, window }) => onSubmit(symbols, window))(event)
      }
    >
      <Field className="min-w-64 flex-1" data-invalid={Boolean(errors.tickers)}>
        <FieldLabel htmlFor="correlation-tickers">Tickers</FieldLabel>
        <Input
          id="correlation-tickers"
          placeholder="ABCD11, EFGH3, IJKL4"
          {...form.register("tickers")}
        />
        <FieldDescription>Separados por vírgula ou espaço, na carteira ou não.</FieldDescription>
        <FieldError errors={[errors.tickers]} />
      </Field>
      <Field className="w-auto">
        <FieldLabel>Referências</FieldLabel>
        <Controller
          control={form.control}
          name="benchmarks"
          render={({ field }) => (
            <ToggleGroup
              type="multiple"
              variant="outline"
              spacing={0}
              value={field.value}
              onValueChange={(next) => field.onChange(next.filter(isBenchmark))}
            >
              {benchmarks.map((benchmark) => (
                <ToggleGroupItem key={benchmark} value={benchmark}>
                  {benchmark}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      </Field>
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
