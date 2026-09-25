import { z } from "zod";

import { isFixedIncomeType, isIndexer } from "@/shared/lib/labels";
import type { FixedIncomeType, Indexer } from "@/shared/lib/labels";
import { parseDecimalInput, parseSignedDecimalInput } from "@/types/decimal";
import type { components } from "@/types/openapi.generated";

export type ComparisonOption = components["schemas"]["ComparisonOptionInDTO"];

// O gráfico tem uma cor por opção
export const MAX_OPTIONS = 5;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

// A URL pode vir editada à mão: a opção que não fecha é descartada
const optionSchema = z
  .object({
    label: z.string(),
    product_type: z.custom<FixedIncomeType>(
      (value) => typeof value === "string" && isFixedIncomeType(value),
    ),
    indexer: z.custom<Indexer>((value) => typeof value === "string" && isIndexer(value)),
    rate: z.string(),
    amount: z.string(),
    application_date: isoDate,
    redemption_date: isoDate,
  })
  .transform((values, context) => {
    const rate = parseSignedDecimalInput(values.rate);
    const amount = parseDecimalInput(values.amount);
    if (!rate || !amount) {
      context.addIssue({ code: "custom", message: "Opção inválida." });
      return z.NEVER;
    }
    return { ...values, rate, amount };
  });

export function readOptions(params: URLSearchParams): ComparisonOption[] {
  const raw = params.get("options");
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((item: unknown) => optionSchema.safeParse(item))
    .filter((result) => result.success)
    .map((result) => result.data)
    .slice(0, MAX_OPTIONS);
}

export function writeOptions(
  params: URLSearchParams,
  options: ComparisonOption[],
): URLSearchParams {
  if (options.length === 0) params.delete("options");
  else params.set("options", JSON.stringify(options));
  return params;
}
