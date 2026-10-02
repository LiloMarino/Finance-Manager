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
  all: "Tudo",
  custom: "Personalizado",
};

/** Os atalhos do seletor de período, na ordem da tela; o resto vem pelo calendário. */
export const periodShortcuts: PeriodPreset[] = ["6m", "12m", "ytd", "all"];

export interface DayRange {
  start?: string;
  end?: string;
}

/** Os atalhos do painel de datas, cada um com o intervalo de hoje. */
export function rangePresets(today: Date): { label: string; range: Required<DayRange> }[] {
  const year = today.getFullYear();
  const month = today.getMonth();
  return [
    { label: "Este mês", range: { start: isoDate(new Date(year, month, 1)), end: isoDate(today) } },
    {
      label: "Mês passado",
      range: {
        start: isoDate(new Date(year, month - 1, 1)),
        end: isoDate(new Date(year, month, 0)),
      },
    },
    {
      label: "Últimos 3 meses",
      range: { start: isoDate(new Date(year, month - 2, 1)), end: isoDate(today) },
    },
    { label: "Este ano", range: { start: `${year}-01-01`, end: isoDate(today) } },
    { label: "Ano passado", range: { start: `${year - 1}-01-01`, end: `${year - 1}-12-31` } },
  ];
}

/** A data ISO lida como dia local, sem o fuso deslocar para a véspera. */
export function localDay(iso: string): Date {
  const [year = 0, month = 1, day = 1] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** "22/09/2026" vira "2026-09-22"; o texto que não é uma data válida vira nulo. */
export function parseTypedDay(text: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim());
  if (!match) return null;
  const [, day, month, year] = match.map(Number);
  const date = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
  return date.getDate() === day && date.getMonth() + 1 === month ? isoDate(date) : null;
}

/** Os dias do intervalo, contando o primeiro e o último. */
export function daysInRange(range: Required<DayRange>): number {
  const milliseconds = localDay(range.end).getTime() - localDay(range.start).getTime();
  return Math.round(milliseconds / 86_400_000) + 1;
}

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

/** O intervalo em texto curto: "10/08 a 22/09/2026", com o ano uma vez só quando
os dois dias são do mesmo ano. */
export function rangeLabel(range: DayRange): string | null {
  const day = (iso: string, withYear: boolean) => {
    const [year, month, date] = iso.split("-");
    return withYear ? `${date}/${month}/${year}` : `${date}/${month}`;
  };
  if (range.start && range.end) {
    const sameYear = range.start.slice(0, 4) === range.end.slice(0, 4);
    return `${day(range.start, !sameYear)} a ${day(range.end, true)}`;
  }
  if (range.start) return `Desde ${day(range.start, true)}`;
  if (range.end) return `Até ${day(range.end, true)}`;
  return null;
}
