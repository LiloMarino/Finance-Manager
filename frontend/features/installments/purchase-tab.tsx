import { useSearchParams } from "react-router-dom";

import { readPurchase, writePurchase } from "@/features/installments/installments-params";
import { PurchaseForm } from "@/features/installments/purchase-form";
import { PurchaseResult } from "@/features/installments/purchase-result";
import { useInstallments } from "@/features/installments/use-installments";
import type { CurrentRates } from "@/shared/hooks/use-current-rates";
import { getApiErrorMessage } from "@/shared/lib/api";
import { isoDate } from "@/shared/lib/period";
import { completeProjection, projectionDraft } from "@/shared/lib/projection";

/** À vista × parcelado com o dinheiro aplicado até cada parcela. */
export function PurchaseTab({ current }: { current: CurrentRates }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const purchase = readPurchase(searchParams);
  const projection = completeProjection(projectionDraft(searchParams, current));
  // A decisão é tomada hoje: é daqui que o dinheiro fica aplicado
  const { data, error } = useInstallments(
    purchase && projection ? { ...purchase, start_date: isoDate(new Date()), projection } : null,
  );

  return (
    <>
      <PurchaseForm
        purchase={purchase}
        current={current}
        onSubmit={(next) => setSearchParams((params) => writePurchase(params, next))}
      />
      {error && <span className="text-destructive">{getApiErrorMessage(error)}</span>}
      {!projection && (
        <p className="text-muted-foreground">
          Falta a projeção de alguma série: informe as três taxas em Alterar.
        </p>
      )}
      {purchase && data && <PurchaseResult simulation={data} purchase={purchase} />}
    </>
  );
}
