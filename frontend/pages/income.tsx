import { FileUp, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { IncomeDistributionPanel } from "@/features/income/income-distribution";
import { IncomeFormDialog } from "@/features/income/income-form-dialog";
import { IncomeHistory } from "@/features/income/income-history";
import { IncomePerformancePanel } from "@/features/income/income-performance";
import { CategorySelect } from "@/shared/components/category-select";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { usePortfolioScope } from "@/shared/hooks/use-portfolio-scope";
import type { PortfolioCategory } from "@/shared/lib/portfolio-category";

const tabs = ["received", "by-asset", "history"] as const;
type Tab = (typeof tabs)[number];

function isTab(value: string | null): value is Tab {
  return tabs.some((tab) => tab === value);
}

export function IncomePage() {
  const [subportfolioId] = usePortfolioScope();
  const [category, setCategory] = useState<PortfolioCategory>();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("tab");
  const tab: Tab = isTab(requested) ? requested : "received";
  const filters = <CategorySelect value={category} onChange={setCategory} />;

  return (
    <Tabs
      value={tab}
      onValueChange={(next) => setSearchParams(next === "received" ? {} : { tab: String(next) })}
      className="gap-6"
    >
      <PageHeader
        title="Proventos"
        description="Dividendos, JCP e rendimentos recebidos, pelo valor líquido que caiu na conta."
        actions={
          <>
            <Button variant="outline" nativeButton={false} render={<Link to="/import" />}>
              <FileUp />
              Importar
            </Button>
            <IncomeFormDialog
              trigger={
                <Button>
                  <Plus />
                  Novo provento
                </Button>
              }
            />
          </>
        }
      >
        <TabsList>
          <TabsTrigger value="received">Recebidos</TabsTrigger>
          <TabsTrigger value="by-asset">Por ativo</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
      </PageHeader>

      <TabsContent value="received" className="flex flex-col gap-6">
        <IncomePerformancePanel
          subportfolioId={subportfolioId}
          category={category}
          filters={filters}
        />
      </TabsContent>
      <TabsContent value="by-asset" className="flex flex-col gap-6">
        <IncomeDistributionPanel
          subportfolioId={subportfolioId}
          category={category}
          filters={filters}
        />
      </TabsContent>
      <TabsContent value="history" className="flex flex-col gap-6">
        <IncomeHistory subportfolioId={subportfolioId} category={category} filters={filters} />
      </TabsContent>
    </Tabs>
  );
}
