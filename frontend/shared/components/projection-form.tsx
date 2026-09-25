import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { MetricHint } from "@/shared/components/metric-hint";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import type { CurrentRates } from "@/shared/hooks/use-current-rates";
import { formatDate } from "@/shared/lib/format";
import { type Projection, type ProjectionDraft, projectionKeys } from "@/shared/lib/projection";
import {
  type DecimalString,
  formatQuantity,
  parseDecimalInput,
  parseSignedDecimalInput,
  toDecimalInput,
} from "@/types/decimal";

const projectionHint =
  "Depois do último dado real de cada série, a conta supõe que ela segue constante nesta taxa ao ano até o fim da simulação. Ex.: com o CDI projetado em 14% a.a., um título de 100% do CDI rende cerca de 1,1% ao mês daqui em diante. Mudar a projeção não mexe no que já aconteceu.";

const labels: Record<(typeof projectionKeys)[number], { label: string; hint: string }> = {
  cdi: {
    label: "CDI (% a.a.)",
    hint: "A taxa que os bancos cobram entre si por um dia, referência da renda fixa pós-fixada. O ponto de partida é o CDI do último dia publicado, anualizado por 252 dias úteis.",
  },
  selic: {
    label: "Selic (% a.a.)",
    hint: "A taxa básica de juros, que corrige o Tesouro Selic. Costuma ficar 0,10 ponto acima do CDI. O ponto de partida é a Selic do último dia publicado, anualizada.",
  },
  ipca: {
    label: "IPCA (% a.a.)",
    hint: "A inflação oficial, que corrige os títulos IPCA+. O ponto de partida é o IPCA acumulado nos últimos 12 meses publicados.",
  },
};

const lastDate: Record<(typeof projectionKeys)[number], keyof CurrentRates> = {
  cdi: "cdi_date",
  selic: "selic_date",
  ipca: "ipca_date",
};

// A inflação pode ser negativa; os juros, não
const schema = z
  .object({ cdi: z.string(), selic: z.string(), ipca: z.string() })
  .transform((values, context) => {
    const cdi = parseDecimalInput(values.cdi);
    const selic = parseDecimalInput(values.selic);
    const ipca = parseSignedDecimalInput(values.ipca);
    for (const [key, value] of [
      ["cdi", cdi],
      ["selic", selic],
      ["ipca", ipca],
    ] as const) {
      if (!value) {
        context.addIssue({ code: "custom", path: [key], message: "Taxa inválida." });
      }
    }
    if (!cdi || !selic || !ipca) return z.NEVER;
    return { cdi, selic, ipca };
  });

function display(value: DecimalString | null): string {
  return value ? toDecimalInput(value) : "";
}

interface ProjectionFormProps {
  current: CurrentRates;
  draft: ProjectionDraft;
  edited: boolean;
  onApply: (projection: Projection) => void;
  onReset: () => void;
}

/** As taxas que valem depois do último dado real, editáveis. */
export function ProjectionForm({
  current,
  draft,
  edited,
  onApply,
  onReset,
}: ProjectionFormProps) {
  const form = useForm({
    resolver: zodResolver(schema),
    values: {
      cdi: display(draft.cdi),
      selic: display(draft.selic),
      ipca: display(draft.ipca),
    },
  });
  const { errors } = form.formState;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => void form.handleSubmit(onApply)(event)}
    >
      <MetricHint hint={projectionHint}>
        <span className="font-medium">Projeção</span>
      </MetricHint>
      <div className="grid gap-4 sm:grid-cols-3">
        {projectionKeys.map((key) => {
          const realValue = current[key];
          const realDate = current[lastDate[key]];
          return (
            <Field key={key} data-invalid={Boolean(errors[key])}>
              <FieldLabel htmlFor={`projection-${key}`}>
                <MetricHint hint={labels[key].hint}>{labels[key].label}</MetricHint>
              </FieldLabel>
              <Input id={`projection-${key}`} inputMode="decimal" {...form.register(key)} />
              <FieldDescription>
                {realValue && realDate
                  ? `Último real: ${formatQuantity(realValue)}% (${formatDate(realDate)})`
                  : "Sem dado em cache: informe a taxa."}
              </FieldDescription>
              <FieldError errors={[errors[key]]} />
            </Field>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="secondary">
          Aplicar projeção
        </Button>
        {edited && (
          <Button type="button" variant="ghost" onClick={onReset}>
            Voltar ao último valor real
          </Button>
        )}
      </div>
    </form>
  );
}
