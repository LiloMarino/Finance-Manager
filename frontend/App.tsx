import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { MainLayout } from "@/layouts/main-layout";
import { AssetDetailPage } from "@/pages/asset-detail";
import { AssetsPage } from "@/pages/assets";
import { ErrorPage } from "@/pages/error";
import { FixedIncomePage } from "@/pages/fixed-income";
import { FixedIncomeDetailPage } from "@/pages/fixed-income-detail";
import { HomePage } from "@/pages/home";
import { ImportOperationsPage } from "@/pages/import-operations";
import { MarketPage } from "@/pages/market";
import { OperationsPage } from "@/pages/operations";
import { PlaceholderPage } from "@/pages/placeholder";
import { queryClient } from "@/shared/lib/query-client";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="operations" element={<OperationsPage />} />
            <Route path="operations/import" element={<ImportOperationsPage />} />
            <Route path="assets" element={<AssetsPage />} />
            <Route path="assets/:assetId" element={<AssetDetailPage />} />
            <Route path="fixed-income" element={<FixedIncomePage />} />
            <Route path="fixed-income/:investmentId" element={<FixedIncomeDetailPage />} />
            <Route path="market" element={<MarketPage />} />
            <Route
              path="income"
              element={<PlaceholderPage title="Proventos" />}
            />
            <Route
              path="tax"
              element={<PlaceholderPage title="Fiscal" />}
            />
            <Route path="*" element={<ErrorPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
