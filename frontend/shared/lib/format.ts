import { isoDate, localDay } from "@/shared/lib/period";

// A data chega como "AAAA-MM-DD", que o Date lê em UTC
export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

/** "hoje", "há 1 dia", "há 47 dias": quanto tempo se passou desde a data. */
export function formatDaysAgo(value: string): string {
  const days = Math.round(
    (localDay(isoDate(new Date())).getTime() - localDay(value).getTime()) / 86_400_000,
  );
  if (days <= 0) return "hoje";
  return days === 1 ? "há 1 dia" : `há ${days} dias`;
}
