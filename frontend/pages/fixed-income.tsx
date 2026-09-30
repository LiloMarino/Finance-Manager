import { Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { FixedIncomeFormDialog } from "@/features/fixed-income/fixed-income-form-dialog";
import { FixedIncomeTable } from "@/features/fixed-income/fixed-income-table";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useFixedIncomeList } from "@/shared/hooks/use-fixed-income-list";
import { getApiErrorMessage } from "@/shared/lib/api";
import {
  type FixedIncomeType,
  fixedIncomeTypeLabels,
  fixedIncomeTypes,
  isFixedIncomeType,
} from "@/shared/lib/labels";

// Nulo é todos os tipos
const typeItems = [
  { value: null, label: "Todos os tipos" },
  ...fixedIncomeTypes.map((type) => ({ value: type, label: fixedIncomeTypeLabels[type] })),
];

export function FixedIncomePage() {
  const { data, isPending, error } = useFixedIncomeList();
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  const selectedType = typeParam && isFixedIncomeType(typeParam) ? typeParam : null;

  const selectType = (value: FixedIncomeType | null) =>
    setSearchParams((params) => {
      if (value) params.set("type", value);
      else params.delete("type");
      return params;
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Renda fixa</h1>
          <p className="text-muted-foreground">
            Valor marcado pela curva do indexador, com o IR regressivo estimado.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select items={typeItems} value={selectedType} onValueChange={selectType}>
            <SelectTrigger className="w-48" aria-label="Filtrar por tipo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typeItems.map((item) => (
                <SelectItem key={item.label} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FixedIncomeFormDialog
            trigger={
              <Button>
                <Plus />
                Novo título
              </Button>
            }
          />
        </div>
      </div>

      {isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : data.length === 0 ? (
        <p className="text-muted-foreground">
          Nenhum título cadastrado. Cadastre o título com a primeira aplicação.
        </p>
      ) : (
        <>
          {/* Um grupo por tipo, na ordem do cadastro de tipos */}
          {fixedIncomeTypes
            .filter((type) => selectedType === null || type === selectedType)
            .map((type) => {
              const investments = data.filter((item) => item.product_type === type);
              if (investments.length === 0) return null;
              return (
                <section key={type} className="flex flex-col gap-2">
                  <h2 className="text-lg font-semibold">
                    {fixedIncomeTypeLabels[type]} ({investments.length})
                  </h2>
                  <FixedIncomeTable investments={investments} />
                </section>
              );
            })}
          {selectedType && data.every((item) => item.product_type !== selectedType) && (
            <p className="text-muted-foreground">
              Nenhum título do tipo {fixedIncomeTypeLabels[selectedType]}.
            </p>
          )}
        </>
      )}
    </div>
  );
}
