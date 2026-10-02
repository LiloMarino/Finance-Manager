import { Field, FieldDescription, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { UnitInput } from "@/shared/components/unit-input";
import type { InvestmentTermsInput } from "@/shared/lib/investment-terms";
import { maskPercent, maskSignedPercent } from "@/shared/lib/mask";
import {
  type Indexer,
  fixedIncomeTypeLabels,
  fixedIncomeTypes,
  indexerLabels,
  indexers,
  isFixedIncomeType,
  isIndexer,
  treasuryIndexers,
} from "@/shared/lib/labels";

const rateLabels: Record<Indexer, string> = {
  cdi: "Percentual do CDI (110 = 110%)",
  selic: "Spread a.a. somado à Selic (%)",
  ipca: "Taxa real a.a. somada ao IPCA (%)",
  prefixed: "Taxa a.a. (%)",
};

// No formato curto, a unidade da taxa vai dentro do campo
const rateUnits: Record<Indexer, string> = {
  cdi: "% do CDI",
  selic: "% + Selic",
  ipca: "% + IPCA",
  prefixed: "% a.a.",
};

interface InvestmentTermsFieldsProps {
  id: string;
  value: InvestmentTermsInput;
  onChange: (value: InvestmentTermsInput) => void;
  rateError?: { message?: string };
  /** Rótulos curtos, a unidade dentro do campo da taxa e sem as explicações: para
  quando os três campos dividem uma coluna estreita. */
  compact?: boolean;
}

/** Tipo, indexador e taxa de um título. O Tesouro fixa o indexador do próprio nome. */
export function InvestmentTermsFields({
  id,
  value,
  onChange,
  rateError,
  compact = false,
}: InvestmentTermsFieldsProps) {
  const treasuryIndexer = treasuryIndexers[value.product_type];
  const changeRate = (text: string) => {
    const mask = value.indexer === "selic" ? maskSignedPercent : maskPercent;
    onChange({ ...value, rate: mask(text) });
  };

  return (
    <>
      <Field>
        <FieldLabel htmlFor={`${id}-type`}>Tipo</FieldLabel>
        <Select
          items={fixedIncomeTypeLabels}
          value={value.product_type}
          onValueChange={(next) => {
            if (next === null || !isFixedIncomeType(next)) return;
            onChange({
              ...value,
              product_type: next,
              indexer: treasuryIndexers[next] ?? value.indexer,
            });
          }}
        >
          <SelectTrigger id={`${id}-type`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fixedIncomeTypes.map((item) => (
              <SelectItem key={item} value={item}>
                {fixedIncomeTypeLabels[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!compact && (
          <FieldDescription>
            O tipo decide a isenção de IR: LCI, LCA, CRI, CRA e debênture incentivada são isentas.
          </FieldDescription>
        )}
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-indexer`}>{compact ? "Rende pelo" : "Indexador"}</FieldLabel>
        <Select
          items={indexerLabels}
          value={value.indexer}
          disabled={treasuryIndexer !== undefined}
          onValueChange={(next) => {
            if (next !== null && isIndexer(next)) onChange({ ...value, indexer: next });
          }}
        >
          <SelectTrigger id={`${id}-indexer`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {indexers.map((item) => (
              <SelectItem key={item} value={item}>
                {indexerLabels[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field data-invalid={Boolean(rateError)}>
        <FieldLabel htmlFor={`${id}-rate`}>
          {compact ? "Taxa" : rateLabels[value.indexer]}
        </FieldLabel>
        {compact ? (
          <UnitInput
            id={`${id}-rate`}
            unit={rateUnits[value.indexer]}
            value={value.rate}
            onChange={(event) => changeRate(event.target.value)}
          />
        ) : (
          <Input
            id={`${id}-rate`}
            inputMode="decimal"
            value={value.rate}
            onChange={(event) => changeRate(event.target.value)}
          />
        )}
        {!compact && value.indexer === "selic" && (
          <FieldDescription>
            Selic + 0,10% a.a. se digita 0,10. Pode ser zero ou negativo.
          </FieldDescription>
        )}
        <FieldError errors={[rateError]} />
      </Field>
    </>
  );
}
