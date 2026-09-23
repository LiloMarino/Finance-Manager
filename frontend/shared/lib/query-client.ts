import { QueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/lib/api";

function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && "status" in error;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      // Repetir um 4xx só atrasa o erro: a resposta não vai mudar.
      retry: (failureCount, error) => {
        if (isApiError(error) && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: true,
    },
  },
});
