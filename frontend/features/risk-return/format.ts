const volatilityFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** A volatilidade vem em float: é estatística, não dinheiro. */
export function formatVolatility(value: number | null): string {
  return value === null ? "—" : volatilityFormatter.format(value);
}
