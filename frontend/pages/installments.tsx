import type { ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

import { AdvanceTab } from "@/features/installments/advance-tab";
import { CashOrAdvanceTab } from "@/features/installments/cash-or-advance-tab";
import { isInstallmentsTab, readTab, writeTab } from "@/features/installments/installments-params";
import { PurchaseTab } from "@/features/installments/purchase-tab";
import { PageHeader } from "@/shared/components/page-header";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { type CurrentRates, useCurrentRates } from "@/shared/hooks/use-current-rates";
import { getApiErrorMessage } from "@/shared/lib/api";

/** As abas que aplicam o dinheiro partem do último dado real das taxas. */
function WithRates({ children }: { children: (current: CurrentRates) => ReactNode }) {
  const { data, error } = useCurrentRates();
  if (error) return <span className="text-destructive">{getApiErrorMessage(error)}</span>;
  if (!data) return <Skeleton className="h-40 w-full" />;
  return children(data);
}

export function InstallmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = readTab(searchParams);

  return (
    <Tabs
      value={tab}
      onValueChange={(next) => {
        if (isInstallmentsTab(next)) setSearchParams((params) => writeTab(params, next));
      }}
      className="gap-6"
    >
      <PageHeader
        title="À vista ou parcelado"
        description="Três jeitos de pagar uma compra: à vista, parcelado com o dinheiro aplicado, ou parcelado e adiantado com o desconto do banco. Cada aba compara dois deles. Nada é gravado."
      >
        <TabsList>
          <TabsTrigger value="buy">À vista × parcelado com investimento</TabsTrigger>
          <TabsTrigger value="vista">Parcelar e adiantar × à vista</TabsTrigger>
          <TabsTrigger value="pre">Adiantar × deixar aplicado</TabsTrigger>
        </TabsList>
      </PageHeader>

      <TabsContent value="buy" className="flex flex-col gap-6">
        <WithRates>{(current) => <PurchaseTab current={current} />}</WithRates>
      </TabsContent>
      <TabsContent value="vista" className="flex flex-col gap-6">
        <CashOrAdvanceTab />
      </TabsContent>
      <TabsContent value="pre" className="flex flex-col gap-6">
        <WithRates>{(current) => <AdvanceTab current={current} />}</WithRates>
      </TabsContent>
    </Tabs>
  );
}
