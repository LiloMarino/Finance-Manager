const volatilityFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** A volatilidade vem em float: é estatística, não dinheiro. */
export function formatVolatility(value: number | null): string {
  return value === null ? "—" : volatilityFormatter.format(value);
}

const pointsFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** A volatilidade em pontos percentuais, para a frase "uns X p.p. para cima ou para baixo". */
export function formatVolatilityPoints(value: number): string {
  return `${pointsFormatter.format(value * 100)} p.p.`;
}
