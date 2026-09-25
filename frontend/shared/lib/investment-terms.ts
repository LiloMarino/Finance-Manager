import { z } from "zod";

import {
  type FixedIncomeType,
  type Indexer,
  isFixedIncomeType,
  isIndexer,
} from "@/shared/lib/labels";
import { parseDecimalInput, parseSignedDecimalInput } from "@/types/decimal";

/** O tipo, o indexador e a taxa como digitados no formulário. */
export interface InvestmentTermsInput {
  product_type: FixedIncomeType;
  indexer: Indexer;
  rate: string;
}

// O spread da Selic pode ser zero ou negativo; as outras taxas são positivas
export const investmentTermsSchema = z
  .object({
    product_type: z.custom<FixedIncomeType>(
      (value) => typeof value === "string" && isFixedIncomeType(value),
    ),
    indexer: z.custom<Indexer>((value) => typeof value === "string" && isIndexer(value)),
    rate: z.string(),
  })
  .transform((values, context) => {
    const rate =
      values.indexer === "selic"
        ? parseSignedDecimalInput(values.rate)
        : parseDecimalInput(values.rate);
    if (!rate) {
      context.addIssue({ code: "custom", path: ["rate"], message: "Taxa inválida." });
      return z.NEVER;
    }
    return { ...values, rate };
  });
