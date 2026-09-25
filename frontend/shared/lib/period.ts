export type PeriodPreset = "6m" | "12m" | "24m" | "ytd" | "all" | "custom";

export interface PeriodChoice {
  preset: PeriodPreset;
  start?: string;
  end?: string;
}

export const presetLabels: Record<PeriodPreset, string> = {
  "6m": "6 meses",
  "12m": "12 meses",
  "24m": "24 meses",
  ytd: "Este ano",
  all: "Desde o início",
  custom: "Personalizado",
};

export function isPreset(value: string): value is PeriodPreset {
  return value in presetLabels;
}

export function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** O dia seguinte ao mesmo dia `months` meses atrás; num mês mais curto, parte do
último dia dele. */
function monthsAgo(today: Date, months: number): string {
  const target = new Date(today.getFullYear(), today.getMonth() - months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(today.getDate(), lastDay) + 1);
  return isoDate(target);
}

/** O intervalo que a API recebe. O período conta a partir do fechamento da véspera
de `start`, então "6 meses" começa no dia seguinte ao de 6 meses atrás e bate com o
retorno dos últimos 6 meses. */
export function periodRange(choice: PeriodChoice): { start?: string; end?: string } {
  const today = new Date();
  switch (choice.preset) {
    case "6m":
      return { start: monthsAgo(today, 6) };
    case "12m":
      return { start: monthsAgo(today, 12) };
    case "24m":
      return { start: monthsAgo(today, 24) };
    case "ytd":
      return { start: `${today.getFullYear()}-01-01` };
    case "all":
      return {};
    case "custom":
      return { start: choice.start, end: choice.end };
  }
}
