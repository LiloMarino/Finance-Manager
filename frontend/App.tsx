import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { MainLayout } from "@/layouts/main-layout";
import { AssetDetailPage } from "@/pages/asset-detail";
import { AssetsPage } from "@/pages/assets";
import { DataHealthPage } from "@/pages/data-health";
import { ErrorPage } from "@/pages/error";
import { EvolutionPage } from "@/pages/evolution";
import { FixedIncomePage } from "@/pages/fixed-income";
import { FixedIncomeComparatorPage } from "@/pages/fixed-income-comparator";
import { FixedIncomeDetailPage } from "@/pages/fixed-income-detail";
import { HomePage } from "@/pages/home";
import { ImportPage } from "@/pages/import";
import { IncomePage } from "@/pages/income";
import { MarketPage } from "@/pages/market";
import { MonthlyReturnsPage } from "@/pages/monthly-returns";
import { OperationsPage } from "@/pages/operations";
import { PerformancePage } from "@/pages/performance";
import { SectorsPage } from "@/pages/sectors";
import { TaxPage } from "@/pages/tax";
import { queryClient } from "@/shared/lib/query-client";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="evolution" element={<EvolutionPage />} />
            <Route path="performance" element={<PerformancePage />} />
            <Route path="monthly-returns" element={<MonthlyReturnsPage />} />
            <Route path="operations" element={<OperationsPage />} />
            <Route path="import" element={<ImportPage />} />
            <Route path="assets" element={<AssetsPage />} />
            <Route path="assets/:assetId" element={<AssetDetailPage />} />
            <Route path="sectors" element={<SectorsPage />} />
            <Route path="fixed-income" element={<FixedIncomePage />} />
            <Route path="fixed-income/:investmentId" element={<FixedIncomeDetailPage />} />
            <Route path="market" element={<MarketPage />} />
            <Route path="fixed-income-comparator" element={<FixedIncomeComparatorPage />} />
            <Route
              path="income"
              element={<IncomePage />}
            />
            <Route path="tax" element={<TaxPage />} />
            <Route path="data-health" element={<DataHealthPage />} />
            <Route path="*" element={<ErrorPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
