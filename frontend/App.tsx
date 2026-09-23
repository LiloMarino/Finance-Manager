import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { MainLayout } from "@/layouts/main-layout";
import { ErrorPage } from "@/pages/error";
import { HomePage } from "@/pages/home";
import { PlaceholderPage } from "@/pages/placeholder";
import { queryClient } from "@/shared/lib/query-client";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route
              path="operations"
              element={<PlaceholderPage title="Operações" />}
            />
            <Route
              path="market"
              element={<PlaceholderPage title="Mercado" />}
            />
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
