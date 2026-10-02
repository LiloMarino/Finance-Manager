import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import { MonthlyReturnsPanel } from "@/features/monthly-returns/monthly-returns-panel";
import { PerformancePanel } from "@/features/performance/performance-panel";
import { CategorySelect } from "@/shared/components/category-select";
import { PageHeader } from "@/shared/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { usePortfolioScope } from "@/shared/hooks/use-portfolio-scope";
import type { PortfolioCategory } from "@/shared/lib/portfolio-category";

type Tab = "accumulated" | "years";

export function PerformancePage() {
  const [category, setCategory] = useState<PortfolioCategory>();
  const [subportfolioId] = usePortfolioScope();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: Tab = searchParams.get("tab") === "years" ? "years" : "accumulated";
  const filters = <CategorySelect value={category} onChange={setCategory} />;

  return (
    <Tabs
      value={tab}
      onValueChange={(next) => setSearchParams(next === "years" ? { tab: "years" } : {})}
      className="gap-6"
    >
      <PageHeader
        title="Rentabilidade"
        description="Quanto a carteira rendeu sem contar aportes e resgates, como a cota de um fundo."
      >
        <TabsList>
          <TabsTrigger value="accumulated">Acumulada</TabsTrigger>
          <TabsTrigger value="years">Ano a ano</TabsTrigger>
        </TabsList>
      </PageHeader>

      <TabsContent value="accumulated" className="flex flex-col gap-6">
        <PerformancePanel category={category} subportfolioId={subportfolioId} filters={filters} />
      </TabsContent>
      <TabsContent value="years" className="flex flex-col gap-6">
        <MonthlyReturnsPanel
          category={category}
          subportfolioId={subportfolioId}
          filters={filters}
        />
      </TabsContent>
    </Tabs>
  );
}
