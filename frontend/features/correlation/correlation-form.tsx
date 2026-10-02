import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useState } from "react";
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
import { TickerSearch } from "@/shared/components/ticker-search";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/shared/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";

const schema = z
  .object({
    tickers: z.array(z.string()),
    benchmarks: z.array(
      z.custom<Benchmark>((value) => typeof value === "string" && isBenchmark(value)),
    ),
    window: z.custom<CorrelationWindow>(
      (value) => typeof value === "string" && isCorrelationWindow(value),
    ),
  })
  .transform((values, context) => {
    const symbols = [...new Set([...values.tickers, ...values.benchmarks])];
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
      tickers: state.symbols.filter((symbol) => !isBenchmark(symbol)),
      benchmarks: state.symbols.filter(isBenchmark),
      window: state.window,
    },
  });
  const { errors } = form.formState;
  // O ticker sendo digitado, antes de virar chip
  const [draft, setDraft] = useState("");

  return (
    <form
      className="flex flex-wrap items-start gap-4"
      onSubmit={(event) =>
        void form.handleSubmit(({ symbols, window }) => onSubmit(symbols, window))(event)
      }
    >
      <Field className="min-w-64 flex-1" data-invalid={Boolean(errors.tickers)}>
        <FieldLabel htmlFor="correlation-tickers">Tickers</FieldLabel>
        <Controller
          control={form.control}
          name="tickers"
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <TickerSearch
                id="correlation-tickers"
                placeholder="ABCD11"
                value={draft}
                onChange={setDraft}
                onPick={(ticker) => {
                  if (!field.value.includes(ticker)) field.onChange([...field.value, ticker]);
                  setDraft("");
                }}
              />
              {field.value.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {field.value.map((ticker) => (
                    <Badge key={ticker} variant="secondary">
                      {ticker}
                      <button
                        type="button"
                        aria-label={`Tirar ${ticker}`}
                        onClick={() =>
                          field.onChange(field.value.filter((item) => item !== ticker))
                        }
                      >
                        <X />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        />
        <FieldDescription>
          Enter adiciona o ticker, na carteira ou não. As sugestões vêm da busca do yfinance.
        </FieldDescription>
        <FieldError errors={[errors.tickers]} />
      </Field>
      <Field className="w-auto">
        <FieldLabel>Comparar com</FieldLabel>
        <Controller
          control={form.control}
          name="benchmarks"
          render={({ field }) => (
            <ToggleGroup
              multiple
              variant="segmented"
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
              items={windowLabels}
              value={field.value}
              onValueChange={(next) => {
                if (next !== null && isCorrelationWindow(next)) field.onChange(next);
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
