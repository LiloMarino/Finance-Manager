import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { MainLayout } from "@/layouts/main-layout";
import { AssetCorrelationPage } from "@/pages/asset-correlation";
import { AssetDetailPage } from "@/pages/asset-detail";
import { AssetsPage } from "@/pages/assets";
import { CashPage } from "@/pages/cash";
import { CorrelationPage } from "@/pages/correlation";
import { DataPage } from "@/pages/data";
import { ErrorPage } from "@/pages/error";
import { EvolutionPage } from "@/pages/evolution";
import { FixedIncomePage } from "@/pages/fixed-income";
import { FixedIncomeComparatorPage } from "@/pages/fixed-income-comparator";
import { FixedIncomeDetailPage } from "@/pages/fixed-income-detail";
import { HomePage } from "@/pages/home";
import { ImportPage } from "@/pages/import";
import { InstallmentsPage } from "@/pages/installments";
import { IncomePage } from "@/pages/income";
import { OperationsPage } from "@/pages/operations";
import { PerformancePage } from "@/pages/performance";
import { RiskReturnPage } from "@/pages/risk-return";
import { SubportfolioDetailPage } from "@/pages/subportfolio-detail";
import { SubportfoliosPage } from "@/pages/subportfolios";
import { TaxPage } from "@/pages/tax";
import { PortfolioScopeProvider } from "@/shared/components/portfolio-scope-provider";
import { PrivacyProvider } from "@/shared/components/privacy-provider";
import { queryClient } from "@/shared/lib/query-client";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PortfolioScopeProvider>
        <PrivacyProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="evolution" element={<EvolutionPage />} />
                <Route path="performance" element={<PerformancePage />} />
                <Route path="risk-return" element={<RiskReturnPage />} />
                <Route path="operations" element={<OperationsPage />} />
                <Route path="import" element={<ImportPage />} />
                <Route path="assets" element={<AssetsPage />} />
                <Route path="cash" element={<CashPage />} />
                <Route path="assets/:assetId" element={<AssetDetailPage />} />
                <Route path="subportfolios" element={<SubportfoliosPage />} />
                <Route path="subportfolios/:subportfolioId" element={<SubportfolioDetailPage />} />
                <Route path="fixed-income" element={<FixedIncomePage />} />
                <Route path="fixed-income/:investmentId" element={<FixedIncomeDetailPage />} />
                <Route path="fixed-income-comparator" element={<FixedIncomeComparatorPage />} />
                <Route path="installments" element={<InstallmentsPage />} />
                <Route path="correlation" element={<CorrelationPage />} />
                <Route path="asset-correlation" element={<AssetCorrelationPage />} />
                <Route path="income" element={<IncomePage />} />
                <Route path="tax" element={<TaxPage />} />
                <Route path="data" element={<DataPage />} />
                <Route path="*" element={<ErrorPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </PrivacyProvider>
      </PortfolioScopeProvider>
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
