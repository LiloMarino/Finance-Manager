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
import type { InvestmentTermsInput } from "@/shared/lib/investment-terms";
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

interface InvestmentTermsFieldsProps {
  id: string;
  value: InvestmentTermsInput;
  onChange: (value: InvestmentTermsInput) => void;
  rateError?: { message?: string };
}

/** Tipo, indexador e taxa de um título. O Tesouro fixa o indexador do próprio nome. */
export function InvestmentTermsFields({
  id,
  value,
  onChange,
  rateError,
}: InvestmentTermsFieldsProps) {
  const treasuryIndexer = treasuryIndexers[value.product_type];

  return (
    <>
      <Field>
        <FieldLabel htmlFor={`${id}-type`}>Tipo</FieldLabel>
        <Select
          value={value.product_type}
          onValueChange={(next) => {
            if (!isFixedIncomeType(next)) return;
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
        <FieldDescription>
          O tipo decide a isenção de IR: LCI, LCA, CRI, CRA e debênture incentivada são
          isentas.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-indexer`}>Indexador</FieldLabel>
        <Select
          value={value.indexer}
          disabled={treasuryIndexer !== undefined}
          onValueChange={(next) => {
            if (isIndexer(next)) onChange({ ...value, indexer: next });
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
        <FieldLabel htmlFor={`${id}-rate`}>{rateLabels[value.indexer]}</FieldLabel>
        <Input
          id={`${id}-rate`}
          inputMode="decimal"
          value={value.rate}
          onChange={(event) => onChange({ ...value, rate: event.target.value })}
        />
        {value.indexer === "selic" && (
          <FieldDescription>
            Selic + 0,10% a.a. se digita 0,10. Pode ser zero ou negativo.
          </FieldDescription>
        )}
        <FieldError errors={[rateError]} />
      </Field>
    </>
  );
}
