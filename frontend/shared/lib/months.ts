export const monthLabels = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function monthLabel(year: number, month: number): string {
  return `${monthLabels[month - 1] ?? month}/${year}`;
}
