// A data chega como "AAAA-MM-DD", que o Date lê em UTC
export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}
