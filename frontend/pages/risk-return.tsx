import { useState } from "react";

import { RiskReturnPanel } from "@/features/risk-return/risk-return-panel";
import { CategorySelect } from "@/shared/components/category-select";
import { PageHeader } from "@/shared/components/page-header";
import { usePortfolioScope } from "@/shared/hooks/use-portfolio-scope";
import type { PortfolioCategory } from "@/shared/lib/portfolio-category";

export function RiskReturnPage() {
  const [category, setCategory] = useState<PortfolioCategory>();
  const [subportfolioId] = usePortfolioScope();

  return (
    <>
      <PageHeader
        title="Risco × retorno"
        description="O quanto cada ativo oscilou e o quanto rendeu no mesmo período."
      />
      <RiskReturnPanel
        category={category}
        subportfolioId={subportfolioId}
        filters={<CategorySelect value={category} onChange={setCategory} />}
      />
    </>
  );
}
